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

require_once dirname(__FILE__) . '/../globals.php';

require_once dirname(__FILE__) . '/Root.class.php';


/**
 * Classe RandomPic.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class RandomPic extends Root
{
    protected $customFolder = '';
    protected $publicPathPic = '';
    protected $fileName = '';
    protected $absolutePathFolder = '';
    protected $levelMax = 20;
    protected $tryMax = 5;
    protected $rootPath = '';

    /**
     * RandomPic constructor.
     *
     * @param {array} $data : RandomPic data.
     * * param {String} data.customFolder : Custom folder.
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);

        if (empty($this->rootPath)) {
            $this->setRootPath();
        }
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
     * getRandomFile
     *
     * @param {string} $folder : folder to scan
     *
     * @return {file} $file : Random file
     */
    protected function getRandomFile($folder)
    {
        $listPic = array();
        $dir = new DirectoryIterator($folder);
        $file;
        $min;
        $max;
        $nb;

        foreach ($dir as $file) {
            set_time_limit(30);

            if ($file->isDot()
                || preg_match('/^[\.].*/i', $file->getFilename())
                || preg_match('/^(thumb)(s)?[\.](db)$/i', $file->getFilename())
                || $file->isDir()
                || !$file->isFile()
            ) {
                continue;
            }

            $listPic[] = $file->getFilename();
        }

        $min = 0;
        $max = count($listPic) - 1;

        if ($max < 0) {
            return null;
        }

        $nb = mt_rand($min, $max);
        return $listPic[$nb];
    }

    /**
     * getRandomFolder
     *
     * @param {string} $folder : folder to scan
     *
     * @return {string}  : Random folder path
     */
    protected function getRandomFolder($folder)
    {
        $listFolder = array();
        $dir = new DirectoryIterator($folder);

        foreach ($dir as $file) {
            set_time_limit(30);
            $folderPath = $file->getPathname();
            $fileName = $file->getFilename();

            if ($file->isDot()
                || preg_match('/^[\.].*/i', $fileName)
                || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName)
                || !$file->isDir()
            ) {
                continue;
            }

            $listFolder[] = $folderPath;
        }

        $min = 0;
        $max = count($listFolder) - 1;

        if ($max < 0) {
            return null;
        }

        $nb = mt_rand($min, $max);

        return $listFolder[$nb];
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
        $hasFolder;

        try {
            $hasFolder = $this->hasFolder($folder);
        } catch (Exception $e) {
            if ($levelCurrent === 0) {
                throw new Exception('Root folder is empty: ' . $folder);
            }
            return;
        }

        error_log('levelCurrent = ' . $levelCurrent);
        error_log('levelMax = ' . $this->levelMax);

        if ($hasFolder && $levelCurrent < $this->levelMax) {
            $levelCurrent++;
            $this->searchRandomPic(
                $this->getRandomFolder($folder)
            );
        } else {
            $this->fileName = $this->getRandomFile($folder);
            $this->absolutePathFolder = $folder;

            $this->publicPathPic = substr(
                $folder,
                strpos(
                    str_replace('\\', '/', $folder),
                    '/' . $_BASE_PIC_FOLDER_NAME
                )
            );
        }
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
        $folder = $this->rootPath;
        $fileName = '';
        $try = 0;
        $tryMax = $this->tryMax;
        $result = array();
        $src = '';
        $publicPathPic = '';
        $absolutePathFolder = '';
        $lenghtPublicPathPic = 0;
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

            if ($this->fileName) {
                break;
            }

            $try++;
        } while (empty($this->fileName) && $try < $tryMax);

        $fileName = $this->fileName;
        $publicPathPic = $this->publicPathPic;
        $absolutePathFolder = $this->absolutePathFolder;

        // If no pic found after nb try.
        if (!$fileName) {
            throw new Exception('No picture to show after ' . $tryMax . ' try.');
        }

        // End of customFolder
        $lenghtPublicPathPic = strlen($publicPathPic);
        if ($publicPathPic[$lenghtPublicPathPic - 1] !== '/' && $publicPathPic[$lenghtPublicPathPic - 1] !== '\\') {
            $publicPathPic .= '/';
        }

        $src = $publicPathPic . $fileName;
        $src = str_replace('\\', '/', $src);

        $customFolder = str_replace('\\', '/', $customFolder);
        $publicPathPic = str_replace('\\', '/', $publicPathPic);

        list($width, $height) = getimagesize($absolutePathFolder . '/' . $fileName);

        $result = array(
            'src' => $src,
            'randomPublicPath' => substr(
                $publicPathPic,
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
        $rootPath;

        $this->rootPath = $rootPath = $_BASE_PIC_PATH . $this->customFolder;

        try {
            if (!file_exists($rootPath)) {
                throw new Exception();
            }

            new DirectoryIterator($rootPath);
        } catch (Exception $e) {
            throw new Exception('Custom folder doesn\'t exist: ' . $rootPath);
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

        // Manage '/' for begining end end of the customFolder.
        if ($customFolder) {
            $customFolder = str_replace('\\', '/', $customFolder);
            $lenghtCustoFolder = strlen($customFolder);
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
