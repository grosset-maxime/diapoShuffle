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
$customFolder;
$logError;
$jsonResult;
$RandomPic; // Instance of RandomPic class.


$customFolder = trim($_POST['customFolder']) ? trim($_POST['customFolder']) : '';

$logError = array(
    'mandatory_fields' => array(
    ),
    'optional_fields' => array(
        'customFolder' => '= ' . $customFolder
    ),
);

$jsonResult = array(
    'success' => false,
    'pic' => array(),
);


try {

    $RandomPic = new RandomPic(
        array('customFolder' => $customFolder)
    );

    $jsonResult['pic'] = $RandomPic->getRandomPic();

} catch (ExceptionExtended $e) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['message'] = $e->getMessage();
    $jsonResult['error']['publicMessage'] = $e->getPublicMessage();
    $jsonResult['error']['severity'] = $e->getSeverity();
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
print json_encode($jsonResult);
exit;
