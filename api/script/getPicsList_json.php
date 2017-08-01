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

require_once ROOT_DIR . '/api/class/ExceptionExtended.class.php';
require_once ROOT_DIR . '/api/class/PicsList/PicsList.class.php';

// PHP
// use \DirectoryIterator;

// DS
use DS\ExceptionExtended;

// PicsList
use PicsList\PicsList;


// Init vars.
$folder;
$PicsListInstance;
$pics = array();


$folder = trim($_POST['folder']) ? trim($_POST['folder']) : '';

$logError = array(
    'mandatory_fields' => array(
        'folder' => '= ' . $folder
    ),
    'optional_fields' => array(
    ),
);

$jsonResult = array(
    'success' => false,
    'pics' => array(),
);



try {

    $PicsListInstance = new PicsList();

    $pics = $PicsListInstance->getPics($folder);

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
$jsonResult['pics'] = $pics;
print json_encode($jsonResult);
exit;
