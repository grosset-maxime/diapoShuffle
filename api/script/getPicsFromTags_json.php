<?php
/**
 * Description : Fetch all pics which have tags provided in parameter.
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

// Bdd
require_once ROOT_DIR . '/api/class/Bdd/Pics.class.php';


// DS
use DS\ExceptionExtended;

// Bdd
use Bdd\Pics;


$tags = !empty($_POST['tags']) ? $_POST['tags'] : array();
$operator = !empty($_POST['operator']) ? $_POST['operator'] : 'AND';
$types = !empty($_POST['types']) ? $_POST['types'] : array();

$logError = array();
$jsonResult = array(
    'success' => false
);

if (empty($tags) && empty($types)) {
    $logError = array(
        'mandatory_fields' => array(
            'tags' => '= ' . print_r($tags, true),
            'types' => '= ' . print_r($types, true),
        ),
        'optional_fields' => array(
        ),
    );
    $jsonResult['error'] = $logError;
    $jsonResult['error']['mandatoryFields'] = true;
    $jsonResult['error']['message'] = 'Mandatory fields missing.';
    print json_encode($jsonResult);
    die;
}

$success = false;


try {

    $results = (new Pics())->fetch(array(
        'operator' => $operator,
        'tags' => $tags,
        'types' => $types
    ));

    if (!empty($results)) {
        $success = true;
        $jsonResult['results'] = $results;
    } else {
        $message = 'No pic found for selected ';
        if (empty($tags)) {
            $message .= 'types: ' . implode(' OR ', $types);
        } else if (empty($types)) {
            $message .= 'tags: ' . implode(' ' . $operator . ' ', $tags);
        } else {
            $message .= 'tags: ' . implode(' ' . $operator . ' ', $tags);
            $message .= ' and for types: ' . implode(' OR ', $types);
        }
        $jsonResult['error']['publicMessage'] = $message;
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