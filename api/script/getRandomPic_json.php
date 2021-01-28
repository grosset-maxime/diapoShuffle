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
*/

require_once ROOT_DIR . '/api/class/RandomPic/RandomPic.class.php';
require_once ROOT_DIR . '/api/class/ExceptionExtended.class.php';

// DS
use DS\ExceptionExtended;

// RandomPic
use RandomPic\RandomPic;


// Init vars.
$customFolders;
$logError;
$jsonResult;
$RandomPic; // Instance of RandomPic class.

$request_body = file_get_contents('php://input');
$data = json_decode($request_body);

$customFolders = !empty($data->customFolders)
    ? $data->customFolders
    : array();

if (empty($customFolders)) {
    $customFolders = !empty($_POST['customFolders'])
        ? $_POST['customFolders']
        : array();
}

$logError = array(
    'mandatory_fields' => array(
    ),
    'optional_fields' => array(
        'customFolders' => '= ' . implode(' - ', $customFolders)
    ),
);

$jsonResult = array(
    'success' => false,
    'pic' => array(),
);

try {

    $RandomPic = new RandomPic(
        array('customFolders' => $customFolders)
    );

    $jsonResult['pic'] = $RandomPic->getRandomPic();

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

$jsonResult['success'] = true;

header('Content-type: application/json');
header('Accept: application/json');
print json_encode($jsonResult);

exit;
