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

// ====================
// Start of the script.
// ====================

$logError = array(
    'mandatory_fields' => array(
    ),
    'optional_fields' => array(
    ),
);

$jsonResult = array(
    'success' => false
);

// Clean all session variable.
session_unset();

$jsonResult['success'] = true;
print json_encode($jsonResult);
exit;
