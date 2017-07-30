<?php
/**
 * Folder Pic engine.
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
 * Class FolderPic.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class FolderPic extends Root
{
    // protected $Utils = null;

    protected $cacheFolder = array();
    protected $cacheEmptyFolder = array();
    protected $needUpdateCache = false;
    protected $useCache = false;

    protected $cacheManager = null;


    /**
     * RandomPic constructor.
     *
     * @param {array} $data : RandomPic data.
     * * param {String[]} data.customFolders : List of custom folder.
     */
    public function __construct(array $data = array())
    {
        // $this->Utils = new Utils();

        $this->cacheManager = new CacheManager();
        $this->cacheFolder = $this->cacheManager->getCacheFolder();
        $this->cacheEmptyFolder = $this->cacheManager->getCacheEmptyFolder();

        parent::__construct($data);
    }

    public function getPics($folder)
    {
        return $this->getPicsList($folder);
    }

    /**
     * get
     *
     * @param {string} $folder : folder to scan
     *
     * @return {Item} Random item.
     */
    protected function getPicsList($folder)
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
                    || (!$isDir && !preg_match('/(.jpeg|.jpg|.gif|.png|.bmp)$/i', $fileName))
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
} // End Class RandomPic
