<?php
/**
 * Delete a pic or a folder.
 *
 * PHP version 5
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

namespace DeleteItem;

require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';


// PHP
use \DirectoryIterator;
use \Exception;

// DS
use DS\Root;
use DS\ExceptionExtended;

/**
 * Class DeleteItem.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class DeleteItem extends Root
{
    /**
     * DeleteItem constructor.
     *
     * @param {array} $data : Delete data.
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);
    }

    /**
     * Delete a folder recursively (remove all files and folders).
     *
     * @param {String} $path : Path folder to remove (remove all files and folders).
     *
     * @return null.
     */
    protected function rrmdir($path) {
        $dir = opendir($path);

        while (false !== ($file = readdir($dir))) {
            if ($file !== '.' && $file !== '..') {
                $full = $path . '/' . $file;

                if (is_dir($full)) { $this->rrmdir($full); }
                else { unlink($full); }
            }
        }

        closedir($dir);
        rmdir($path);
    }

    /**
     * Delete a folder. (Remove all hidden and windows files and Synology DSM folder)
     *
     * @param {String} $path : Path folder path to remove.
     *
     * @return null.
     */
    protected function rmdir($path) {

        // init vars
        $dir;
        $fileName;
        $pathName;
        $item;
        $shouldRmdir = true;

        try {

            $dir = new DirectoryIterator($path);

        } catch (Exception $e) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Folder "' . $path . '" is not accessible.',
                    'message' => $e->getMessage(),
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        foreach ($dir as $item) {
            $fileName = $item->getFilename();
            $pathName = $item->getPathname();

            if ($item->isDot()) { // if . or .. go to next file.
                continue;
            }

            if ($item->isDir()) {
                if ($fileName === '@eaDir') { // Synology DSM folder.
                    $this->rrmdir($pathName);
                    continue;
                } else {
                    $shouldRmdir = false;
                    break;
                }
            }

            if (
                preg_match('/^[\.]/i', $fileName) // Hidden files
                || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName) // Windows files
            ) {
                unlink($pathName);
            } else {
                $shouldRmdir = false;
                break;
            }
        }

        if ($shouldRmdir === true) {
            return rmdir($path);
        } else {
            return false;
        }
    }

    /**
     * Delete a folder.
     *
     * @param {String}   $path             : Folder path to remove.
     * @param {Boolean}  $fromDisk         : Should remove the folder from disk.
     * @param {String[]} $cacheFolder      : Folder cache where to remove the folder.
     * @param {String[]} $cacheEmptyFolder : Empty folder cache where to remove the folder.
     *
     * @return {Object}.
     */
    public function deleteFolder(
        $path = '',
        $fromDisk = false,
        array $cacheFolder = array(),
        array $cacheEmptyFolder = array()
    ) {

        // Init vars
        $folderName;
        $explodedPath;
        $parentFolderPath;
        $listItems;
        $fromDiskStatus = null;


        if ($fromDisk === true) {
            if (!file_exists($path)) {
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => 'Folder doesn\'t exist: ' . $path,
                        'message' => 'Folder doesn\'t exist: ' . $path,
                        'severity' => ExceptionExtended::SEVERITY_WARNING
                    )
                );
            }

            try {

                $fromDiskStatus = $this->rmdir($path);

            } catch (Exception $e) {
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => 'Fail to delete folder: ' . $path,
                        'message' => $e->getMessage(),
                        'severity' => ExceptionExtended::SEVERITY_ERROR
                    )
                );
            }
        }


        // Delete folder from caches
        // -------------------------

        $explodedPath = explode('/', $path);

        // Get folder name.
        $folderName = end($explodedPath);

        // Get parent folder path.
        unset($explodedPath[count($explodedPath) - 1]); // Remove last item of the array.
        $parentFolderPath = implode('/', $explodedPath);

        // Remove empty folder name from parent folder list from cache.
        $listItems = $cacheFolder[$parentFolderPath];
        unset($listItems[$folderName]);
        $cacheFolder[$parentFolderPath] = $listItems;

        // Remove empty folder path from cache.
        unset($cacheFolder[$path]);
        unset($cacheEmptyFolder[$path]);


        return array(
            'fromDiskStatus' => $fromDiskStatus,
            'cacheFolder' => $cacheFolder,
            'cacheEmptyFolder' => $cacheEmptyFolder
        );
    }
} // End Class DeleteItem
