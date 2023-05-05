<?php
/**
 * Description : Delete an Item.
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
require_once ROOT_DIR . '/api/class/Bdd/Pic.class.php';

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

$request_body = file_get_contents('php://input');
$data = json_decode($request_body);

$picPath = !empty($data->picPath) ? trim($data->picPath) : '';
$continueIfNotExist = !empty($data->continueIfNotExist) ? !!$data->continueIfNotExist : false;
$deleteOnlyFromBdd = !empty($data->deleteOnlyFromBdd) ? !!$data->deleteOnlyFromBdd : false;

if (empty($picPath)) {
    $picPath = trim($_POST['picPath']) ? trim($_POST['picPath']) : '';
    $continueIfNotExist = !empty($_POST['continueIfNotExist']) ? !!$_POST['continueIfNotExist'] : false;
    $deleteOnlyFromBdd = !empty($_POST['deleteOnlyFromBdd']) ? !!$_POST['deleteOnlyFromBdd'] : false;
}

$logError = array(
    'mandatory_fields' => array(
        'picPath' => '= ' . $picPath
    ),
    'optional_fields' => array(
        'continueIfNotExist' => '= ' . ($continueIfNotExist ? 'true' : 'false'),
        'deleteOnlyFromBdd' => '= ' . ($deleteOnlyFromBdd ? 'true' : 'false')
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

$firstCharPicPAth = $picPath[0];
// Begin of picPath
if ($firstCharPicPAth !== '/') {
    $picPath = '/' . $picPath;
}

$path = substr($picPath, strlen('/' . $_BASE_PIC_FOLDER_NAME));

$path = str_replace('\\', '/', $path);
$firstCharPicPAth = $path[0];

// Begin of path
if ($firstCharPicPAth !== '/') {
    $path = '/' . $path;
}

$absolutePicPath = $_BASE_PIC_PATH . $path;

$cacheManager = new CacheManager();

try {
    $result = null;

    try {
        if (!$deleteOnlyFromBdd) {
            $result = (new DeleteItem())->deletePic($absolutePicPath, $cacheManager->getCacheFolder(), $continueIfNotExist);
        }
    } catch (ExceptionExtended $e) {
        error_log($e);
    } catch (Exception $e) {
        error_log($e);
    }

    if (!$deleteOnlyFromBdd) {
        // Remove pic from cache.
        $cacheManager->setCacheFolder($result['cacheFolder']);
    }

    try {

        // Remove pic from bdd.
        ( new Pic( array('path' => $picPath) ) )->delete();

    } catch (ExceptionExtended $e) {
        if ($e->getSeverity() !== ExceptionExtended::SEVERITY_INFO) {
            error_log($e);
            throw $e;
        }
    } catch (Exception $e) {
        error_log($e);
        throw $e
    }

    $success = true;

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
header('Content-type: application/json');
header('Accept: application/json');
print json_encode($jsonResult);
exit;
