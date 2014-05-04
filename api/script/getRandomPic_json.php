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

        if ($file->isDir() && !preg_match('/^[\.].*/i', $file->getFilename())) {
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
    $listFolder = array();
    $dir = new DirectoryIterator($folder);
    foreach ($dir as $file) {
        set_time_limit(30);
        if ($file->isDot() || preg_match('/^[\.].*/i', $file->getFilename())
            || preg_match('/^(thumb)(s)?[\.](db)$/i', $file->getFilename())
        ) {
            continue;
        }

        if ($file->isDir()) {
            $listFolder[] = $file->getPathname();
        }
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
function searchRandomPic($folder)
{
    global $levelCurent, $levelMax, $fileName, $publicPathPic, $absolutePathFolder;

    $hasFolder = hasFolder($folder);

    if ($hasFolder && $levelCurent < $levelMax) {
        $levelCurent++;
        searchRandomPic(getRandomFolder($folder));
    } else {
        $fileName = getRandomFile($folder);
        $absolutePathFolder = $folder;

        $publicPathPic = substr($folder, strpos(str_replace('\\', '/', $folder), '/pic'));
    }
}


// ====================
// Start of the script.
// ====================

$customFolder = !empty(trim($_POST['customFolder'])) ? trim($_POST['customFolder']) : '/';

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


// Init variables
$baseAppPathFolder = ROOT_DIR . '/public/pic';
$absolutePathFolder = '';
$fileName = '';
$publicPathPic = '';
$levelCurent = 0;
$levelMax = 20;
$try = 0;
$tryMax = 5;


// Manage '/' for begining end end of the customFolder.
if ($customFolder) {
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
$folder = $baseAppPathFolder . $customFolder;

if (!file_exists($folder)) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['wrongCustomFolder'] = true;
    $jsonResult['error']['message'] = 'Wrong custom folder, it doesn\'t exist.';
    print json_encode($jsonResult);
    die;
}

$isEmptyFolder = (count(glob($folder . '/*')) === 0) ? true : false;

if ($isEmptyFolder) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['noPic'] = true;
    $jsonResult['error']['message'] = 'No picture to show!';
    print json_encode($jsonResult);
    die;
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

$src = $publicPathPic . $fileName;
$src = str_replace('\\', '/', $src);

list($width, $height) = getimagesize($absolutePathFolder . '/' . $fileName);

$jsonResult['success'] = true;
$jsonResult['pic']['src'] = $src;
$jsonResult['pic']['width'] = $width;
$jsonResult['pic']['height'] = $height;

print json_encode($jsonResult);
exit;
