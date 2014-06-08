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

require_once ROOT_DIR . '/api/class/RandomPic.class.php';

// ====================
// Start of the script.
// ====================

// Init vars.
$customFolder;
$logError;
$jsonResult;
$RandomPic; // Instance of RandomPic class.


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
    'pic' => array(),
);


try {

    $RandomPic = new RandomPic(
        array('customFolder' => $customFolder)
    );

    $jsonResult['pic'] = $RandomPic->getRandomPic();

} catch (Exception $e) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['errorMessage'] = $e->getMessage();
    print json_encode($jsonResult);
    die;
}

$jsonResult['success'] = true;
print json_encode($jsonResult);
exit;
