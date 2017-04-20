<?php
/**
 * Description : Delete a pic.
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

require_once ROOT_DIR . '/api/class/ExceptionExtended.class.php';
require_once ROOT_DIR . '/api/class/CacheManager.class.php';

require_once ROOT_DIR . '/api/class/DeleteItem/DeleteItem.class.php';

// Bdd
require_once ROOT_DIR . '/api/class/Bdd/Pics.class.php';

// DS
use DS\ExceptionExtended;
use DS\CacheManager;

// DeleteItem
use DeleteItem\DeleteItem;

// Bdd
use Bdd\Pic;


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

$success = false;
$path = substr($picPath, strlen('/' . $_BASE_PIC_FOLDER_NAME));

$path = str_replace('\\', '/', $path);
$firstCharPicPAth = $path[0];

// Begin of picPath
if ($firstCharPicPAth !== '/') {
    $path = '/' . $path;
}

$absolutePicPath = $_BASE_PIC_PATH . $path;

$cacheManager = new CacheManager();

try {

    $result = (new DeleteItem())->deletePic($absolutePicPath, $cacheManager->getCacheFolder());

    if (is_array($result) && $result['success'] === true) {
        // Remove pic from cache.
        $cacheManager->setCacheFolder($result['cacheFolder']);

        try {

            // Remove pic from bdd.
            ( new Pic( array('path' => $picPath) ) )->delete();

        } catch (ExceptionExtended $e) {
            if ($e->getSeverity() !== ExceptionExtended::SEVERITY_INFO) {
                throw $e;
            }
        }

        $success = true;
    }

} catch (ExceptionExtended $e) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['message'] = $e->getMessage();
    $jsonResult['error']['publicMessage'] = $e->getPublicMessage();
    $jsonResult['error']['severity'] = $e->getSeverity();
    $jsonResult['error']['log'] = $e->getLog();
    print json_encode($jsonResult);
    die;
} catch (Exception $e) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['message'] = $e->getMessage();
    $jsonResult['error']['publicMessage'] = 'Unexpected error.';
    $jsonResult['error']['severity'] = ExceptionExtended::SEVERITY_ERROR;
    print json_encode($jsonResult);
    die;
}


$jsonResult['success'] = $success;
print json_encode($jsonResult);
exit;
