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

require_once ROOT_DIR . '/api/class/CacheManager.class.php';

// DS
use DS\CacheManager;


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
$cacheManager = new CacheManager();
$cacheManager->deleteCacheFolder();
$cacheManager->deleteCacheFolderList();

$jsonResult['success'] = true;
print json_encode($jsonResult);
exit;
