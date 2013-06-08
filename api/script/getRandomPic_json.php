<?php
/**
 * Description :
 * Return : JSON
 *
 * PHP version 5
 *
 * @category Script_-_Json
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

/*global
    ROOT_DIR
*/

/**
 * HasFolder
 *
 * @param {string} $folder : folder to scan
 *
 * @return {bool} $hasFolder : true if the folder has folder else false
 */
function hasFolder($folder)
{
    $hasFolder = false;
    $dir = new DirectoryIterator($folder);
    foreach ($dir as $file) {
        set_time_limit(30);
        if ($file->isDot()) {
            continue;
        }

        if ($file->isDir()) {
            $hasFolder = true;
            break;
        } else if ($file->isFile() && !preg_match('/^[\.].*/i', $file->getFilename())) {
            break;
        }
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
function getRandomFile($folder)
{
    $listPic = array();
    $dir = new DirectoryIterator($folder);
    foreach ($dir as $file) {
        set_time_limit(30);
        if ($file->isDot() || preg_match('/^[\.].*/i', $file->getFilename())
            || preg_match('/^(thumb)(s)?[\.](db)$/i', $file->getFilename())
            || $file->isDir()
        ) {
            continue;
        }
        
        if ($file->isFile()) {
            $listPic[] = $file->getFilename();
        }
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
function getRandomFolder($folder)
{
    $listPic = array();
    $dir = new DirectoryIterator($folder);
    foreach ($dir as $file) {
        set_time_limit(30);
        if ($file->isDot() || preg_match('/^[\.].*/i', $file->getFilename())
            || preg_match('/^(thumb)(s)?[\.](db)$/i', $file->getFilename())
        ) {
            continue;
        }

        if ($file->isDir()) { 
            $listPic[] = $file->getPathname();
        }
    }

    $min = 0;
    $max = count($listPic) - 1;

    if ($max < 0) {
        return null;
    }

    $nb = mt_rand($min, $max);
    return $listPic[$nb];
}

$customFolder = !empty($_POST['customFolder']) ? $_POST['customFolder'] : '';

$logError = array(
    'mandatory_fields' => array(
    ),
    'optional_fields' => array(
        'customFolder' => '= ' . $customFolder
    ),
);

$jsonResult = array(
    'success' => false,
    'pic' => array(
        'src' => '' 
    ),
);

$folder = ROOT_DIR . '/public/pic/' . $customFolder;
$fileName = '';
$publicPathPic = '';
$levelCurent = 0;
$levelMax = 10;
$try = 0;
$tryMax = 5;

$folderTemp = $folder;

/**
 * searchRandomPic
 *
 * @param {string} $folder : folder to scan
 *
 * @return null
 */
function searchRandomPic($folder)
{
    global $levelCurent, $levelMax, $fileName, $publicPathPic;

    $hasFolder = hasFolder($folder);
    
    if ($hasFolder && $levelCurent < $levelMax) {
        $levelCurent++;
        searchRandomPic(getRandomFolder($folder));
    } else {
        $fileName = getRandomFile($folder);
        $publicPathPic = substr($folder, strpos(str_replace('\\', '/', $folder), '/pic/'));
    }
}

do {
    searchRandomPic($folder);

    if ($fileName) {
        break;
    }

    $try++;
} while (empty($fileName) || $try < $tryMax);


if (!$fileName) {
    print json_encode($jsonResult);
    die;
}

$src = $publicPathPic . '/' . $fileName;
$src = str_replace('\\', '/', $src);

$jsonResult['success'] = true;
$jsonResult['pic']['src'] = $src;
print json_encode($jsonResult);
exit;
