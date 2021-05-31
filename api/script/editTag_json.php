<?php
/**
 * Description : Edit tag on bdd.
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

require_once ROOT_DIR . '/api/class/Bdd/Tag.class.php';


// DS
use DS\ExceptionExtended;

// Bdd
use Bdd\Tag;

$request_body = file_get_contents('php://input');
$data = json_decode($request_body);

$isNew = !empty($data->isNew)
    ? $data->isNew
    : false;

$isDelete = !empty($data->isDelete)
    ? $data->isDelete
    : false;

$id = !empty($data->id)
    ? trim($data->id)
    : '';

$name = !empty($data->name)
    ? trim($data->name)
    : '';

$category = !empty($data->category)
    ? trim($data->category)
    : '';

// Manage legacy code.
if (empty($id)) {
    $id = !empty($_POST['id'])
        ? $_POST['id']
        : '';
        
    $name = !empty($_POST['name'])
        ? $_POST['name']
        : '';

    $category = !empty($_POST['category'])
        ? $_POST['category']
        : '';

    $isNew = !empty($_POST['isNew']) && $_POST['isNew'] === 'true' ? true : false;
    $isDelete = !empty($_POST['isDelete']) && $_POST['isDelete'] === 'true' ? true : false;
}

$logError = array(
    'mandatory_fields' => array(
        'id' => '= ' . $id,
        'name' => '= ' . $name,
        'category' => '= ' . $category,
        'isNew' => '= ' . $isNew ? 'true' : 'false',
        'isDelete' => '= ' . $isDelete ? 'true' : 'false'
    ),
    'optional_fields' => array(
    ),
);

$jsonResult = array(
    'success' => false
);

if (!$isDelete && (empty($id) || empty($name))) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['mandatoryFields'] = true;
    $jsonResult['error']['message'] = 'Mandatory fields missing.';
    print json_encode($jsonResult);
    die;
}

$success = false;

try {

    $Tag = new Tag(array(
        'id' => $id,
        'name' => $name,
        'category' => $category,
        'shouldFetch' => false
    ));

    if ($isNew) {
        $success = $Tag->add(array('shouldNotUpdate' => true));
    } else if ($isDelete) {
        $success = $Tag->delete();
    } else {
        $success = $Tag->update();
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
