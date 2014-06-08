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
        $fileName;
        $folderPath;
        $file;
        $min = 0;
        $max;
        $nb;

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

        if ($hasFolder && $levelCurrent < $this->levelMax) {
            $levelCurrent++;
            $this->searchRandomPic(
                $this->getRandomFolder($folder)
            );
        } else {
            $this->picFileName = $this->getRandomFile($folder);
            $this->absolutePathFolder = $folder;

            $this->publicPathFolder = substr(
                $folder,
                strpos(
                    $this->replaceWinSlaches($folder),
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
        $folder = $this->rootPathFolder;
        $picFileName = '';
        $try = 0;
        $tryMax = $this->tryMax;
        $result = array();
        $publicPathPic = '';
        $publicPathFolder = '';
        $absolutePathFolder = '';
        $lenghtPublicPathFolder = 0;
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

        // End of customFolder
        $lenghtPublicPathFolder = strlen($publicPathFolder);
        if ($publicPathFolder[$lenghtPublicPathFolder - 1] !== '/' && $publicPathFolder[$lenghtPublicPathFolder - 1] !== '\\') {
            $publicPathFolder .= '/';
        }

        $publicPathFolder = $this->replaceWinSlaches($publicPathFolder);

        $publicPathPic = $publicPathFolder . $picFileName;

        list($width, $height) = getimagesize($absolutePathFolder . '/' . $picFileName);

        $result = array(
            'publicPathPic' => $publicPathPic,
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

        // Manage '/' for begining end end of the customFolder.
        if ($customFolder) {
            $customFolder = $this->replaceWinSlaches($customFolder);
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
