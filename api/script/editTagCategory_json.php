<?php
/**
 * Description : Edit TagCategory on bdd.
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

require_once ROOT_DIR . '/api/class/Bdd/TagCategory.class.php';


// DS
use DS\ExceptionExtended;

// Bdd
use Bdd\TagCategory;

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

$color = !empty($data->color)
    ? $data->color
    : '';

// Manage legacy code.
if (empty($id) && empty($name) && empty($color)) {
    $id = !empty($_POST['id'])
        ? $_POST['id']
        : '';
        
    $name = !empty($_POST['name'])
        ? $_POST['name']
        : '';

    $color = !empty($_POST['color'])
        ? $_POST['color']
        : '';

    $isNew = !empty($_POST['isNew']) && $_POST['isNew'] === 'true' ? true : false;
    $isDelete = !empty($_POST['isDelete']) && $_POST['isDelete'] === 'true' ? true : false;
}

$logError = array(
    'mandatory_fields' => array(
        'id' => '= ' . $id
    ),
    'optional_fields' => array(
        'name' => '= ' . $name,
        'color' => '= ' . $color,
        'isNew' => '= ' . $isNew ? 'true' : 'false',
        'isDelete' => '= ' . $isDelete ? 'true' : 'false'
    ),
);

$jsonResult = array(
    'success' => false
);

if (($isDelete || !$isNew) && empty($id)) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['mandatoryFields'] = true;
    $jsonResult['error']['message'] = 'Mandatory fields missing.';
    print json_encode($jsonResult);
    die;
}

$success = false;

try {

    $TagCategory = new TagCategory(array(
        'id' => $id,
        'name' => $name,
        'color' => $color,
        'shouldFetch' => false
    ));

    if ($isNew) {
        $tagCategoryId = $TagCategory->add(array('shouldNotUpdate' => true));

        if ($tagCategoryId) {
            $jsonResult['tagCategoryId'] = $tagCategoryId;
            $success = true;
        }

    } else if ($isDelete) {
        $success = $TagCategory->delete();
    } else {
        $success = $TagCategory->update();
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
