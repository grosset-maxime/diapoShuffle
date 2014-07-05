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

require_once ROOT_DIR . '/api/class/ExceptionExtended.class.php';
require_once ROOT_DIR . '/api/class/FolderList/FolderList.class.php';

// PHP
use \DirectoryIterator;

// DS
use DS\ExceptionExtended;

// FolderList
use FolderList\FolderList;


// Init vars.
$folder;
$folderList;
$listFolder = array();


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
    'folderList' => array(),
);



try {

    $folderList = new FolderList(
        array('customFolder' => $folder)
    );

    $listFolder = $folderList->getFolderList();

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
$jsonResult['folderList'] = $listFolder;
print json_encode($jsonResult);
exit;
