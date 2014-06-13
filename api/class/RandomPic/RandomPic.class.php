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

require_once dirname(__FILE__) . '/../../globals.php';

require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';
require_once dirname(__FILE__) . '/Item.class.php';


// PHP
use \DirectoryIterator;
use \Exception;

// DS
use DS\Root;
use DS\ExceptionExtended;

// RandomPic
use RandomPic\Item;


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
    protected $WIN_SEP = '\\';
    protected $UNIX_SEP = '/';

    protected $customFolder = '';       // Custom path folder choose by user where to get random pic.
    protected $picFileName = '';        // Random pic file name.
    protected $rootPathFolder = '';     // Absolute root folder (with custom path folder) where to get random pic.
    protected $absolutePathFolder = ''; // Complete path of the random pic's folder.
    protected $publicPathFolder = '';   // Relative path from pic folder of the random pic's folder.
    protected $levelMax = 20;           // Maximum folder depth.
    protected $tryMax = 5;              // Maximum try before to raise folder empty exception.
    protected $cacheFolder = array();
    protected $needUpdateCache = false;


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

        $this->cacheFolder = !empty($_SESSION['cacheFolder']) ? $_SESSION['cacheFolder'] : array();
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
        return str_replace($this->WIN_SEP, $this->UNIX_SEP, $s);
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
        $file; $min; $max; $nb; $item; $fileName; $randomItem; $dir;
        $listItem = array();

        if (isset($this->cacheFolder[$folder]) || array_key_exists($folder, $this->cacheFolder)) {
            $listItem = $this->cacheFolder[$folder];
        } else {
            $dir = new DirectoryIterator($folder);

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

            $this->cacheFolder[$folder] = $listItem;
            $this->needUpdateCache = true;
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
                    $this->UNIX_SEP . $_BASE_PIC_FOLDER_NAME
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
        $UNIX_SEP = $this->UNIX_SEP;
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
        $errorMessage;


        do {
            try {
                $this->searchRandomPic($folder);
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
            $errorMessage = 'No picture to show after ' . $tryMax . ' try.';
            throw new ExceptionExtended(
                array(
                    'publicMessage' => $errorMessage,
                    'message' => $errorMessage,
                    'severity' => ExceptionExtended::SEVERITY_INFO
                )
            );
        }

        $publicPathFolder = $this->replaceWinSlaches($publicPathFolder);

        // End of customFolder
        if ($publicPathFolder[strlen($publicPathFolder) - 1] !== $UNIX_SEP) {
            $publicPathFolder .= $UNIX_SEP;
        }

        list($width, $height) = getimagesize($absolutePathFolder . $UNIX_SEP . $picFileName);

        $result = array(
            'src' => $publicPathFolder . $picFileName,
            'randomPublicPath' => substr(
                $publicPathFolder,
                strlen($UNIX_SEP . $_BASE_PIC_FOLDER_NAME . $customFolder)
            ),
            'customFolderPath' => $customFolder,
            'width' => $width,
            'height' => $height
        );

        if ($this->needUpdateCache) {
            $this->needUpdateCache = false;
            $_SESSION['cacheFolder'] = $this->cacheFolder;
        }

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
        $customFolder = $this->getCustomFolder();

        $this->rootPathFolder = $rootPathFolder = $_BASE_PIC_PATH . $customFolder;

        try {
            if (!file_exists($rootPathFolder)) {
                throw new Exception();
            }

            new DirectoryIterator($rootPathFolder);
        } catch (Exception $e) {
            $errorMessage = 'Custom folder doesn\'t exist: ' . $customFolder;

            throw new ExceptionExtended(
                array(
                    'publicMessage' => $errorMessage,
                    'message' => $e->getMessage() ? $e->getMessage : $errorMessage,
                    'severity' => ExceptionExtended::SEVERITY_WARNING
                )
            );
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
        $UNIX_SEP = $this->UNIX_SEP;
        $lenghtCustoFolder = 0;
        $firstCharCustomFolder = '';

        $customFolder = $this->replaceWinSlaches($customFolder);
        $lenghtCustoFolder = strlen($customFolder);

        if ($customFolder === $UNIX_SEP) {
            $customFolder = '';
        }

        // Manage '/' for begining end end of the customFolder.
        if ($customFolder) {
            $firstCharCustomFolder = $customFolder[0];

            // Begin of customFolder
            if ($firstCharCustomFolder !== $UNIX_SEP) {
                $customFolder = $UNIX_SEP . $customFolder;
            }

            // End of customFolder
            if ($customFolder[$lenghtCustoFolder - 1] !== $UNIX_SEP) {
                $customFolder .= $UNIX_SEP;
            }
        }

        $this->customFolder = $customFolder;

        $this->setRootPath();
    } // End function setCustomFolder()
} // End Class RandomPic
