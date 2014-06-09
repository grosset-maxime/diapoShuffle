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

namespace RandomPic;

require_once dirname(__FILE__) . '/../globals.php';

require_once dirname(__FILE__) . '/Root.class.php';


// PHP
use \DirectoryIterator;
use \Exception;

// DS
use \Root;


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
    protected $customFolder = '';       // Custom path folder choose by user where to get random pic.
    protected $picFileName = '';        // Random pic file name.
    protected $rootPathFolder = '';     // Absolute root folder (with custom path folder) where to get random pic.
    protected $absolutePathFolder = ''; // Complete path of the random pic's folder.
    protected $publicPathFolder = '';   // Relative path from pic folder of the random pic's folder.
    protected $levelMax = 20;           // Maximum folder depth.
    protected $tryMax = 5;              // Maximum try before to raise folder empty exception.


    /**
     * RandomPic constructor.
     *
     * @param {array} $data : RandomPic data.
     * * param {String} data.customFolder : Custom folder.
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);

        if (empty($this->rootPathFolder)) {
            $this->setRootPath();
        }
    }

    /**
     * replaceWinSlaches
     *
     * @param {String} $s : String to replace antislashes by slashes.
     *
     * @return {String} String with win antislashes replaced by slashes.
     */
    protected function replaceWinSlaches($s)
    {
        return str_replace('\\', '/', $s);
    }

    /**
     * HasFolder
     *
     * @param {string} $folder : folder to scan
     *
     * @return {bool} $hasFolder : true if the folder has folder else false
     */
    protected function hasFolder($folder)
    {
        $hasFolder = false;
        $isEmptyFolder = true;
        $dir;
        $file;

        try {
            $dir = new DirectoryIterator($folder);
        } catch (Exception $e) {
            throw new Exception('Folder doesn\'t exist: ' . $folder);
        }

        foreach ($dir as $file) {
            set_time_limit(30);

            if ($file->isDot()) {
                continue;
            }

            if ($file->isDir() && !preg_match('/^[\.].*/i', $file->getFilename())) {
                $hasFolder = true;
                $isEmptyFolder = false;
                break;
            } else if ($file->isFile() && !preg_match('/^[\.].*/i', $file->getFilename())) {
                $isEmptyFolder = false;
                break;
            }
        }

        if ($isEmptyFolder) {
            throw new Exception('The folder is empty : ' . $folder);
        }

        return $hasFolder;
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
        $listItem = array();
        $dir = new DirectoryIterator($folder);
        $file;
        $min;
        $max;
        $nb;
        $item;
        $fileName;
        $randomItem;

        foreach ($dir as $item) {
            set_time_limit(30);

            $fileName = $item->getFilename();

            if ($item->isDot()
                || preg_match('/^[\.].*/i', $fileName)
                || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName)
            ) {
                continue;
            }

            $listItem[] = array(
                'name' => $item->getFilename(),
                'isFolder' => $item->isDir()
            );
        }

        $min = 0;
        $max = count($listItem) - 1;

        if ($max < 0) {
            return null;
        }

        $nb = mt_rand($min, $max);
        $randomItem = $listItem[$nb];

        return new Item(
            array(
                'name' => $randomItem['name'],
                'type' => $randomItem['isFolder'] ? Item::TYPE_FOLDER : Item::TYPE_FILE,
                'path' => $folder
            )
        );
    }

    /**
     * searchRandomPic
     *
     * @param {string} $folder : folder to scan
     *
     * @return null
     */
    protected function searchRandomPic($folder)
    {
        global $_BASE_PIC_FOLDER_NAME;
        static $levelCurrent = 0;
        $item;
        $isFolder;

        try {
            $item = $this->getRandomItem($folder);
        } catch (Exception $e) {
            if ($levelCurrent === 0) {
                throw new Exception('Root folder is empty: ' . $folder);
            }
            return;
        }

        if (!$item) {
            return;
        }

        $isFolder = $item->isFolder();

        if ($isFolder && $levelCurrent < $this->levelMax) {
            $levelCurrent++;
            $this->searchRandomPic($item->getPathWithName());
        } else if (!$isFolder) {
            $this->picFileName = $item->getName();
            $this->absolutePathFolder = $folder;

            $this->publicPathFolder = substr(
                $folder,
                strpos(
                    $this->replaceWinSlaches($folder),
                    '/' . $_BASE_PIC_FOLDER_NAME
                )
            );
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
        global $_BASE_PIC_FOLDER_NAME;
        $folder = $this->rootPathFolder;
        $picFileName = '';
        $try = 0;
        $tryMax = $this->tryMax;
        $result = array();
        $publicPathFolder = '';
        $absolutePathFolder = '';
        $width = 0;
        $height = 0;
        $customFolder = $this->getCustomFolder();

        do {
            try {
                $this->searchRandomPic($folder);
            } catch (Exception $e) {
                throw new Exception('No picture to show! or : ' . $e->getMessage());
                // $jsonResult['error']['errorMessage'] = $e->getMessage();
            }

            if ($this->picFileName) {
                break;
            }

            $try++;
        } while (empty($this->picFileName) && $try < $tryMax);

        $picFileName = $this->picFileName;
        $publicPathFolder = $this->publicPathFolder;
        $absolutePathFolder = $this->absolutePathFolder;

        // If no pic found after nb try.
        if (!$picFileName) {
            throw new Exception('No picture to show after ' . $tryMax . ' try.');
        }

        $publicPathFolder = $this->replaceWinSlaches($publicPathFolder);

        // End of customFolder
        if ($publicPathFolder[strlen($publicPathFolder) - 1] !== '/') {
            $publicPathFolder .= '/';
        }

        list($width, $height) = getimagesize($absolutePathFolder . '/' . $picFileName);

        $result = array(
            'src' => $publicPathFolder . $picFileName,
            'randomPublicPath' => substr(
                $publicPathFolder,
                strlen('/' . $_BASE_PIC_FOLDER_NAME . $customFolder)
            ),
            'customFolderPath' => $customFolder,
            'width' => $width,
            'height' => $height
        );

        return $result;
    } // End function getRandomPic()

    /**
     * Set root path.
     *
     * @return null
     */
    protected function setRootPath()
    {
        // Init vars
        global $_BASE_PIC_PATH;
        $rootPathFolder;

        $this->rootPathFolder = $rootPathFolder = $_BASE_PIC_PATH . $this->customFolder;

        try {
            if (!file_exists($rootPathFolder)) {
                throw new Exception();
            }

            new DirectoryIterator($rootPathFolder);
        } catch (Exception $e) {
            throw new Exception('Custom folder doesn\'t exist: ' . $rootPathFolder);
        }
    }

    /**
     * Getter custom folder.
     *
     * @return {String} $customFolder : Custom folder.
     */
    public function getCustomFolder()
    {
        return $this->customFolder;
    }

    /**
     * Setter custom folder.
     *
     * @param {String} $customFolder : Custom folder.
     *
     * @return null
     */
    public function setCustomFolder($customFolder = '')
    {
        // Init vars.
        $lenghtCustoFolder = 0;
        $firstCharCustomFolder = '';

        $customFolder = $this->replaceWinSlaches($customFolder);
        $lenghtCustoFolder = strlen($customFolder);

        if ($customFolder === '/') {
            $customFolder = '';
        }

        // Manage '/' for begining end end of the customFolder.
        if ($customFolder) {
            $firstCharCustomFolder = $customFolder[0];

            // Begin of customFolder
            if ($firstCharCustomFolder !== '/' && $firstCharCustomFolder !== '\\') {
                $customFolder = '/' . $customFolder;
            }

            // End of customFolder
            if ($customFolder[$lenghtCustoFolder - 1] !== '/' && $customFolder[$lenghtCustoFolder - 1] !== '\\') {
                $customFolder .= '/';
            }
        }

        $this->customFolder = $customFolder;

        $this->setRootPath();
    } // End function setCustomFolder()
} // End Class RandomPic


/**
 * Class Item.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class Item extends Root
{
    const TYPE_FOLDER = 'folder';
    const TYPE_FILE = 'file';

    protected $name = '';
    protected $type = '';
    protected $path = '';

    /**
     * Item constructor.
     *
     * @param {array} $data : RandomPic data.
     * * param {String} data.name : Item name.
     * * param {String} data.type : Item type.
     * * param {String} data.path : Item path.
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);
    }

    /**
     * Is folder.
     *
     * @return {Boolean} Item is a folder.
     */
    public function isFolder()
    {
        return $this->type === self::TYPE_FOLDER;
    }

    /**
     * Getter name.
     *
     * @return {String} Item name.
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Setter name.
     *
     * @param {String} $name : Item name.
     *
     * @return null
     */
    public function setName($name = '')
    {
        $this->name = $name;
    }

    /**
     * Getter type.
     *
     * @return {String} Item type.
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Setter type.
     *
     * @param {String} $type : Item type (folder or item).
     *
     * @return null
     */
    public function setType($type = self::TYPE_FILE)
    {
        $type = strtolower($type);

        if ($type !== self::TYPE_FILE && $type !== self::TYPE_FOLDER) {
            $type = self::TYPE_FILE;
        }

        $this->type = $type;
    }

    /**
     * Getter path with name.
     *
     * @return {String} Item path with name.
     */
    public function getPathWithName()
    {
        return $this->path . '/' . $this->name;
    }

    /**
     * Getter path.
     *
     * @return {String} Item path.
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * Setter path.
     *
     * @param {String} $path : Item path.
     *
     * @return null
     */
    public function setPath($path = '')
    {
        $this->path = $path;
    }
} // End Class Item
