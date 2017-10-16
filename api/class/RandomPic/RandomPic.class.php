<?php
/**
 * Random Pic engine.
 *
 * PHP version 5
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

/* global
    $_BASE_PIC_PATH, $_BASE_PIC_FOLDER_NAME, $_config
*/

namespace RandomPic;

// DS
require_once dirname(__FILE__) . '/../../../config/config.inc.php';
require_once dirname(__FILE__) . '/../../globals.php';
require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../CacheManager.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';

// Utils
require_once dirname(__FILE__) . '/../Utils/Utils.class.php';

// DeleteItem
require_once dirname(__FILE__) . '/../DeleteItem/DeleteItem.class.php';

// Item
require_once dirname(__FILE__) . '/../Item/Item.class.php';


// PHP
use \DirectoryIterator;
use \Exception;

// DS
use DS\Root;
use DS\CacheManager;
use DS\ExceptionExtended;

// Utils
use Utils\Utils;

// DeleteItem
use DeleteItem\DeleteItem;

// Item
use Item\Item;


/**
 * Class RandomPic.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class RandomPic extends Root
{
    protected $Utils = null;

    protected $customFolders = array(); // List of custom path folder choose by user where to get random pic.

    protected $levelMax = 50;           // Maximum folder depth.
    protected $tryMax = 100;            // Maximum try before to raise folder empty exception.
    protected $cacheFolder = array();
    protected $cacheEmptyFolder = array();
    protected $needUpdateCache = false;
    protected $useCache = false;

    protected $cacheManager = null;

    protected $randomPic = null; // Random pic.


    /**
     * RandomPic constructor.
     *
     * @param {array} $data : RandomPic data.
     * * param {String[]} data.customFolders : List of custom folder.
     */
    public function __construct(array $data = array())
    {
        $this->Utils = new Utils();

        $this->cacheManager = new CacheManager();
        $this->cacheFolder = $this->cacheManager->getCacheFolder();
        $this->cacheEmptyFolder = $this->cacheManager->getCacheEmptyFolder();

        parent::__construct($data);
    }

    /**
     * Remove the folder (from cache and delete it).
     *
     * @param {String} $folderPath : Folder to remove from cache.
     *
     * @return null.
     */
    protected function removeEmptyFolder($folderPath)
    {
        // Init vars
        global $_config;
        $result;
        $deleteFromDisk = isset($_config['deleteEmptyFolder']) ? $_config['deleteEmptyFolder'] : false;

        try {

            $result = (new DeleteItem())->deleteFolder(
                $folderPath,
                $deleteFromDisk,
                $this->cacheFolder,
                $this->cacheEmptyFolder
            );

        } catch (ExceptionExtended $e) { throw $e; }

        if (is_array($result)) {
            $this->cacheFolder = $result['cacheFolder'];
            $this->cacheEmptyFolder = $result['cacheEmptyFolder'];
            $this->needUpdateCache = true;
        }
    }

    /**
     * getRandomItem
     *
     * @param {string} $folder : folder to scan
     *
     * @return {Item} Random item.
     */
    protected function getRandomItem($folder)
    {
        // Init vars
        $file;
        $min;
        $max;
        $nb;
        $nbItems;
        $item;
        $itemType;
        $fileName;
        $randomItem;
        $dir;
        $isDir;
        $folderPath;
        $listItems = array();
        $useCache = false;


        if (isset($this->cacheFolder[$folder]) || array_key_exists($folder, $this->cacheFolder)) {
            $listItems = $this->cacheFolder[$folder];
            $useCache = true;
        } else {
            try {
                $dir = new DirectoryIterator($folder);
            } catch (Exception $e) {
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => 'Folder "' . $folder . '" is not accessible.',
                        'message' => $e->getMessage(),
                        'severity' => ExceptionExtended::SEVERITY_ERROR
                    )
                );
            }

            foreach ($dir as $item) {
                set_time_limit(30);

                $fileName = $item->getFilename();
                $isDir = $item->isDir();

                if ($item->isDot()
                    || preg_match('/^[\.].*/i', $fileName)
                    || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName)
                    || (!$isDir && !preg_match('/(.jpeg|.jpg|.gif|.png|.bmp|.webm)$/i', $fileName))
                    || ($isDir && $fileName === '@eaDir')
                ) {
                    continue;
                }

                $listItems[$fileName] = $isDir;
            }

            $this->needUpdateCache = true;

            if (count($listItems) > 0) {
                $this->cacheFolder[$folder] = $listItems;
            } else {
                $this->cacheEmptyFolder[$folder] = 1;
                return null;
            }
        }

        $nbItems = count($listItems);

        if ($nbItems <= 0) {
            $this->removeEmptyFolder($folder);
            return null;
        }

        $min = 0;
        $max = $nbItems - 1;

        do {
            $nb = mt_rand($min, $max);
            $fileName = array_keys($listItems)[$nb];
            $itemType = $listItems[$fileName] ? Item::TYPE_FOLDER : Item::TYPE_FILE;

            $folderPath = $folder . '/' . $fileName;

            if (
                $itemType === Item::TYPE_FOLDER &&
                (
                    isset($this->cacheEmptyFolder[$folderPath]) ||
                    array_key_exists($folderPath, $this->cacheEmptyFolder)
                )
            ) {
                $this->removeEmptyFolder($folderPath);
                $max--;
            } else {
                break;
            }
        } while ($max >= 0);

        if ($max < 0) {
            return null;
        }

        $this->useCache = $useCache && $itemType === Item::TYPE_FILE;

        return new Item(
            array(
                'name' => $fileName,
                'type' => $itemType,
                'path' => $folder,
                'format' => $itemType === Item::TYPE_FILE ? pathinfo($fileName)['extension'] : null,
                'shouldFetch' => true
            )
        );
    }

    /**
     * searchRandomPic
     *
     * @param {string} $folder : folder to scan.
     *
     * @return {Item} Random Pic item.
     */
    protected function searchRandomPic($folder)
    {
        static $levelCurrent = 0;
        $item; $isFolder;

        try {

            $item = $this->getRandomItem($folder);

        } catch (ExceptionExtended $e) {
            throw $e;
        } catch (Exception $e) {
            if ($levelCurrent === 0) {
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => 'Root folder is empty: ' . $folder,
                        'message' => $e->getMessage(),
                        'severity' => ExceptionExtended::SEVERITY_WARNING
                    )
                );
            } else {
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => 'Unexpected error.',
                        'message' => $e->getMessage()
                    )
                );
            }
        }

        if (!$item || !file_exists($item->getPathWithName())) {
            return;
        }

        $isFolder = $item->isFolder();

        if ($isFolder && $levelCurrent < $this->levelMax) {

            $levelCurrent++;
            $this->searchRandomPic($item->getPathWithName());

        } else if (!$isFolder) {

            $this->randomPic = $item;
        }

        return;
    } // End function searchRandomPic()

    /**
     * Get a random pic.
     *
     * @return {Array} Pic information.
     */
    public function getRandomPic()
    {
        // Init vars
        global $_BASE_PIC_FOLDER_NAME, $_BASE_PIC_PATH;

        $try = 0;
        $tryMax = $this->tryMax;
        $result = array();
        $width = 0;
        $height = 0;
        $warningMessage = '';
        $randomCustomFolder = $this->getRandomCustomFolder();
        $errorMessage;
        $randomPic;
        $tags;

        do {
            try {

                $this->searchRandomPic(
                    $_BASE_PIC_PATH . $randomCustomFolder
                );

                $randomPic = $this->randomPic;

            } catch (ExceptionExtended $e) {
                throw $e;
            } catch (Exception $e) {
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => 'Unexpected error.',
                        'message' => $e->getMessage()
                    )
                );
            }

            if (!empty($randomPic)) {
                break;
            }

            $try++;

        } while (empty($randomPic) && $try < $tryMax);

        // If no pic found after nb try.
        if (empty($randomPic)) {
            $errorMessage = 'No picture to show after ' . $tryMax . ' try.';
            throw new ExceptionExtended(
                array(
                    'publicMessage' => $errorMessage,
                    'message' => $errorMessage,
                    'severity' => ExceptionExtended::SEVERITY_INFO,
                    'log' =>  $_BASE_PIC_PATH . $randomCustomFolder
                )
            );
        }

        list($width, $height) = $randomPic->getSize();

        try {
            $tags = $randomPic->getTags();
        } catch (ExceptionExtended $e) {
            $tags = array();
            $warningMessage = $e->getPublicMessage() . ' - ' . $e->getMessage();
        } catch (Exception $e) {
            throw $e;
        }

        $result = array(
            'src' => $randomPic->getPublicPathWithName(),
            'randomPublicPath' => substr(
                $randomPic->getPublicPath(),
                strlen(
                    '/' . $_BASE_PIC_FOLDER_NAME . $randomCustomFolder
                )
            ),
            'customFolderPath' => $randomCustomFolder,
            'name' => $randomPic->getName(),
            'extension' => $randomPic->getFormat(),
            'width' => $width,
            'height' => $height,
            'tags' => $tags,
            'useCache' => $this->useCache,
            'warning' => $warningMessage
        );

        if ($this->needUpdateCache) {
            $this->needUpdateCache = false;
            $this->cacheManager->setCacheFolder($this->cacheFolder);
            $this->cacheManager->setCacheEmptyFolder($this->cacheEmptyFolder);
        }

        return $result;
    } // End function getRandomPic()

    /**
     * Get randomly one of custom folders.
     *
     * @return {String} One custom folder get randomly.
     */
    protected function getRandomCustomFolder()
    {
        // Init vars

        $randomCustomFolder;
        $randomIndex;
        $min = 0;
        $max = count($this->customFolders) - 1;

        if ($max < 0) {

            $randomCustomFolder = '';

        } else {

            $randomIndex = mt_rand($min, $max);
            $randomCustomFolder =  $this->customFolders[$randomIndex];

        }

        return $randomCustomFolder;
    }

    /**
     * Getter list of custom folders.
     *
     * @return {String} $customFolders : List of custom folders.
     */
    public function getCustomFolders()
    {
        return $this->customFolders;
    }

    /**
     * Setter list of custom folders.
     *
     * @param {String[]} $customFolders : List of custom folders.
     *
     * @return null
     */
    public function setCustomFolders($customFolders = array(''))
    {
        // Init vars.
        global $_BASE_PIC_PATH;
        $errorMessage;
        $rootPathFolder;
        $customFolder;

        foreach ($customFolders as $customFolder) {
            $customFolder = $this->Utils->normalizePath($customFolder);

            $rootPathFolder = $_BASE_PIC_PATH . $customFolder;

            try {
                if (!file_exists($rootPathFolder)) {
                    throw new Exception();
                }

                new DirectoryIterator($rootPathFolder);

                $this->customFolders[] = $customFolder;
            } catch (Exception $e) {
                continue;
            }
        }

        if (count($customFolders) > 0 && count($this->customFolders) <= 0) {
            $errorMessage = 'No valid custom folders provided: ' . implode(' - ', $customFolders);

            throw new ExceptionExtended(
                array(
                    'publicMessage' => $errorMessage,
                    'message' => $e->getMessage() ? $e->getMessage : $errorMessage,
                    'severity' => ExceptionExtended::SEVERITY_WARNING
                )
            );
        }
    } // End function setCustomFolders()
} // End Class RandomPic
