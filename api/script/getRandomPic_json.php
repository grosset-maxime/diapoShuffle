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
    ROOT_DIR,
    $_BASE_PIC_PATH, $_BASE_PIC_FOLDER_NAME
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
    $isEmptyFolder = true;
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
function getRandomFile($folder)
{
    $listPic = array();
    $dir = new DirectoryIterator($folder);

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
function getRandomFolder($folder)
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
function searchRandomPic($folder)
{
    global $levelCurent, $levelMax, $fileName, $publicPathPic, $absolutePathFolder, $_BASE_PIC_FOLDER_NAME;

    try {
        $hasFolder = hasFolder($folder);
    } catch (Exception $e) {
        if ($levelCurent === 0) {
            throw new Exception('Root folder is empty: ' . $folder);
        }
        return;
    }

    if ($hasFolder && $levelCurent < $levelMax) {
        $levelCurent++;
        searchRandomPic(getRandomFolder($folder));
    } else {
        $fileName = getRandomFile($folder);
        $absolutePathFolder = $folder;

        $publicPathPic = substr($folder, strpos(str_replace('\\', '/', $folder), '/' . $_BASE_PIC_FOLDER_NAME));
    }
}


// ====================
// Start of the script.
// ====================

$customFolder = trim($_POST['customFolder']) ? trim($_POST['customFolder']) : '';
$customFolder = !empty($customFolder) ? $customFolder : '/';

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
$absolutePathFolder = '';
$fileName = '';
$publicPathPic = '';
$levelCurent = 0;
$levelMax = 20;
$try = 0;
$tryMax = 5;


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
$folder = $_BASE_PIC_PATH . $customFolder;



try {
    if (!file_exists($folder)) {
        throw new Exception('Folder doesn\'t exist: ' . $folder);
    }

    $dir = new DirectoryIterator($folder);
} catch (Exception $e) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['wrongCustomFolder'] = true;
    $jsonResult['error']['message'] = 'Wrong custom folder, it doesn\'t exist.';
    $jsonResult['error']['errorMessage'] = $e->getMessage();
    print json_encode($jsonResult);
    die;
}

do {
    try {
        searchRandomPic($folder);
    } catch (Exception $e) {
        $jsonResult['error'] = $logError;
        $jsonResult['error']['noPic'] = true;
        $jsonResult['error']['message'] = 'No picture to show!';
        $jsonResult['error']['errorMessage'] = $e->getMessage();
        print json_encode($jsonResult);
        die;
    }

    if ($fileName) {
        break;
    }

    $try++;
} while (empty($fileName) && $try < $tryMax);

// If no pic found after nb try.
if (!$fileName) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['noPic'] = true;
    $jsonResult['error']['message'] = 'No picture to show after ' . $tryMax . ' try.';
    print json_encode($jsonResult);
    die;
}

// End of customFolder
$lenghtpublicPathPic = strlen($publicPathPic);
if ($publicPathPic[$lenghtpublicPathPic - 1] !== '/' && $publicPathPic[$lenghtpublicPathPic - 1] !== '\\') {
    $publicPathPic .= '/';
}

$src = $publicPathPic . $fileName;
$src = str_replace('\\', '/', $src);
$customFolder = str_replace('\\', '/', $customFolder);
$publicPathPic = str_replace('\\', '/', $publicPathPic);

list($width, $height) = getimagesize($absolutePathFolder . '/' . $fileName);

$jsonResult['success'] = true;
$jsonResult['pic']['src'] = $src;
$jsonResult['pic']['randomPublicPath'] = substr($publicPathPic, strlen('/' . $_BASE_PIC_FOLDER_NAME . $customFolder));
$jsonResult['pic']['customFolderPath'] = $customFolder;
$jsonResult['pic']['width'] = $width;
$jsonResult['pic']['height'] = $height;

print json_encode($jsonResult);
exit;
