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

if (empty($picPath)) {
    $picPath = trim($_POST['picPath']) ? trim($_POST['picPath']) : '';
}

$logError = array(
    'mandatory_fields' => array(
        'picPath' => '= ' . $picPath
    )
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

// Begin of picPath
if ($picPath[0] !== '/') {
    $picPath = '/' . $picPath;
}

$cacheManager = new CacheManager();

try {
    $result = null;
    $isDeletePicDBSuccess = false;
    $isDeletePicFSSuccess = false;

    // Remove pic from DB.
    // ===================
    try {

        ( new Pic( array('path' => $picPath) ) )->delete();
        $isDeletePicDBSuccess = true;

    } catch (ExceptionExtended $e) {
        if ($e->getSeverity() === ExceptionExtended::SEVERITY_INFO) {
            // Pic not found on DB, considere that is a success.
            $isDeletePicDBSuccess = true;
        } else {
            error_log($e);
            throw $e;
        }
    } catch (Exception $e) {
        error_log($e);
        throw $e;
    }

    // Delete pic from FS.
    // ===================
    try {

        $path = substr($picPath, strlen('/' . $_BASE_PIC_FOLDER_NAME));
        $path = str_replace('\\', '/', $path);

        // Begin of path
        if ($path[0] !== '/') {
            $path = '/' . $path;
        }

        $absolutePicPath = $_BASE_PIC_PATH . $path;
        
        $result = (new DeleteItem())->deletePic(
            $absolutePicPath,
            $cacheManager->getCacheFolder()
        );
        $isDeletePicFSSuccess = $result['success'];

    } catch (ExceptionExtended $e) {
        if ($e->getSeverity() === ExceptionExtended::SEVERITY_INFO) {
            // Pic not found on FS, considere that is a success.
            $isDeletePicFSSuccess = true;
        } else {
            error_log($e);
            throw $e;
        }
    } catch (Exception $e) {
        error_log($e);
        throw $e;
    }

    // Remove pic from cache.
    // ======================
    $cacheManager->setCacheFolder($result['cacheFolder']);

    // Throw error if at least one of both fail
    if (!$isDeletePicDBSuccess || !$isDeletePicFSSuccess) {
        $errorMsg = 'Unknow error.';

        if (!$isDeletePicDBSuccess && !$isDeletePicFSSuccess) {
            $errorMsg = 'Fail to remove pic from DB and FS: ' . $picPath;
        } else if (!$isDeletePicDBSuccess) {
            $errorMsg = 'Fail to remove pic from DB: ' . $picPath;
        } else if (!$isDeletePicFSSuccess) {
            $errorMsg = 'Fail to remove pic from FS: ' . $picPath;
        }

        throw new ExceptionExtended(
            array(
                'publicMessage' => $errorMsg,
                'message' => $errorMsg,
                'severity' => ExceptionExtended::SEVERITY_ERROR
            )
        );
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
