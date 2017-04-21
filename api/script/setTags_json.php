<?php
/**
 * Description : Set tags on a pic.
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
    $_BASE_PIC_PATH
*/

require_once ROOT_DIR . '/api/class/ExceptionExtended.class.php';

require_once ROOT_DIR . '/api/class/Item/Item.class.php';


// DS
use DS\ExceptionExtended;

// Item
use Item\Item;


$name = trim($_POST['name']) ? trim($_POST['name']) : '';
$path = trim($_POST['path']) ? trim($_POST['path']) : '';
$tags = !empty($_POST['tags']) ? $_POST['tags'] : array();

$logError = array(
    'mandatory_fields' => array(
        'name' => '= ' . $name,
        'path' => '= ' . $path
    ),
    'optional_fields' => array(
        'tags' => '= ' . print_r($tags, true)
    ),
);

$jsonResult = array(
    'success' => false
);

if (empty($name) || empty($path)) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['mandatoryFields'] = true;
    $jsonResult['error']['message'] = 'Mandatory fields missing.';
    print json_encode($jsonResult);
    die;
}

$success = false;

$firstCharPicPAth = $path[0];

// Begin of picPath
if ($firstCharPicPAth !== '/') {
    $path = '/' . $path;
}

$absolutePath = $_BASE_PIC_PATH . $path;

$Pic = new Item(array(
    'path' => $absolutePath,
    'name' => $name,
    'type' => Item::TYPE_FILE,
    'format' => pathinfo($name)['extension'],
    'shouldFetch' => true
));

try {

    $success = $Pic->setTags($tags, empty($tags));

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
