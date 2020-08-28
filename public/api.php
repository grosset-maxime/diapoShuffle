<?php
define('ROOT_DIR', dirname(dirname(__FILE__)));

ini_set('log_errors', 'on');
ini_set('error_log', ROOT_DIR . '/log/php/php_error.log');

include_once ROOT_DIR . '/api/globals.php';

$_r = $_SERVER['REQUEST_URI'];

$_routes = array();

$_routes += array(
    '/api/clearCache' => array(
        'path' => '/api/script/clearCache_json.php',
    ),
    '/api/deletePic' => array(
        'path' => '/api/script/deletePic_json.php',
    ),
    '/api/setTags' => array(
        'path' => '/api/script/setTags_json.php',
    ),
    '/api/setTagsFolders' => array(
        'path' => '/api/script/setTagsFolders_json.php',
    ),
    '/api/editTag' => array(
        'path' => '/api/script/editTag_json.php',
    ),
    '/api/fetchTags' => array(
        'path' => '/api/script/fetchTags_json.php',
    ),
    '/api/editTagCategory' => array(
        'path' => '/api/script/editTagCategory_json.php',
    ),
    '/api/getAllTags' => array(
        'path' => '/api/script/getAllTags_json.php',
    ),
    '/api/getAllTagCategories' => array(
        'path' => '/api/script/getAllTagCategories_json.php',
    ),
    '/api/getFolderList' => array(
        'path' => '/api/script/getFolderList_json.php',
    ),
    '/api/getRandomPic' => array(
        'path' => '/api/script/getRandomPic_json.php',
    ),
    '/api/getPicsFromBdd' => array(
        'path' => '/api/script/getPicsFromBdd_json.php',
    ),
    '/api/getPicsList' => array(
        'path' => '/api/script/getPicsList_json.php',
    ),
    '/api/export' => array(
        'path' => '/api/script/export_json.php',
    ),
);

if (!empty($_routes[$_r]['path'])) {
    include_once ROOT_DIR . $_routes[$_r]['path'];
} else {
    error_log('### Does not exist:' . $_r);
}
exit;