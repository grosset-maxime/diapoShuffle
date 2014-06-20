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
    $_BASE_PIC_FOLDER_NAME, $_BASE_PIC_PATH
*/

require_once ROOT_DIR . '/api/class/CacheManager.class.php';

// DS
use DS\CacheManager;


// ====================
// Start of the script.
// ====================

$picPath = trim($_POST['picPath']) ? trim($_POST['picPath']) : '';

$logError = array(
    'mandatory_fields' => array(
        'picPath' => '= ' . $picPath
    ),
    'optional_fields' => array(
    ),
);

$jsonResult = array(
    'success' => false
);

if (!$picPath) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['mandatoryFields'] = true;
    $jsonResult['error']['message'] = 'Mandatory fields missing.';
    print json_encode($jsonResult);
    die;
}

// if ()
$success = false;
$picPath = substr($picPath, strlen('/' . $_BASE_PIC_FOLDER_NAME));

$picPath = str_replace('\\', '/', $picPath);
$firstCharPicPAth = $picPath[0];

// Begin of picPath
if ($firstCharPicPAth !== '/') {
    $picPath = '/' . $picPath;
}

$absolutePicPath = $_BASE_PIC_PATH . $picPath;

try {

    if (!file_exists($absolutePicPath)) {
        throw new Exception('Picture doesn\'t exist: ' . $absolutePicPath);
    }

} catch (Exception $e) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['wrongCustomFolder'] = true;
    $jsonResult['error']['message'] = 'Picture doesn\'t exist.';
    $jsonResult['error']['errorMessage'] = $e->getMessage();
    print json_encode($jsonResult);
    die;
}

try {

    $success = unlink($absolutePicPath);

} catch (Exception $e) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['message'] = 'Error while trying to delete picture.';
    $jsonResult['error']['errorMessage'] = $e->getMessage();
    print json_encode($jsonResult);
}

if (!$success) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['message'] = 'Error while trying to delete picture.';
    print json_encode($jsonResult);
}

$folderPath = substr(
    $absolutePicPath,
    0,
    strrpos(
        $absolutePicPath,
        '/'
    )
);

$picName = substr(
    $absolutePicPath,
    strrpos(
        $absolutePicPath,
        '/'
    ) + 1
);

$cacheManager = new CacheManager();
$cacheFolder = $cacheManager->getCacheFolder();

if (isset($cacheFolder[$folderPath][$picName])) {

    unset($cacheFolder[$folderPath][$picName]);
    $cacheManager->setCacheFolder($cacheFolder);

}

$jsonResult['success'] = $success;
print json_encode($jsonResult);
exit;
