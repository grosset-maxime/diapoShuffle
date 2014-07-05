<?php
/**
 * Get Folder list.
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
    $_BASE_PIC_PATH, $_BASE_PIC_FOLDER_NAME
*/

namespace FolderList;

require_once dirname(__FILE__) . '/../../globals.php';

require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';
require_once dirname(__FILE__) . '/../CacheManager.class.php';


// PHP
use \DirectoryIterator;
use \Exception;

// DS
use DS\Root;
use DS\ExceptionExtended;
use DS\CacheManager;


/**
 * Class FolderList.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class FolderList extends Root
{
    protected $WIN_SEP = '\\';
    protected $UNIX_SEP = '/';

    protected $customFolder = '';
    protected $rootPathFolder = '';

    protected $cacheFolderList = array();
    protected $cacheManager = null;


    /**
     * FolderList constructor.
     *
     * @param {array} $data : FolderList data.
     * * param {String} data.customFolder : Custom folder.
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);

        if (empty($this->rootPathFolder)) {
            $this->setRootPath();
        }

        $this->cacheManager = new CacheManager();
        $this->cacheFolderList = $this->cacheManager->getCacheFolderList();
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
     * getFolderList
     *
     * @return null
     */
    public function getFolderList()
    {

        $folder = $this->rootPathFolder;
        $listFolder = array();
        $dir;
        $item;
        $fileName;

        if (isset($this->cacheFolderList[$folder])
            || array_key_exists($folder, $this->cacheFolderList)
        ) {
            $listFolder = $this->cacheFolderList[$folder];
        } else {
            try {

                if (!file_exists($folder)) {
                    throw new Exception();
                }

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

                if ($item->isDot()
                    || !$item->isDir()
                    || preg_match('/^[\.].*/i', $fileName)
                    || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName)
                ) {
                    continue;
                }

                $listFolder[] = $fileName;
            }

            $this->cacheFolderList[$folder] = $listFolder;
            $this->cacheManager->setCacheFolderList($this->cacheFolderList);
        }

        return $listFolder;

    } // End function getFolderList()

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
