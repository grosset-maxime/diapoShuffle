<?php
/**
 * Description : Allowed routes
 *
 * PHP version 5
 *
 * @category Config_-_Routes
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

$_routes = array();

// Modules - Views - App
// ---------------------
$_routes += array(
    'diapoShuffle' => array(
        'isView' => true,
        'title' => 'Diapo Shuffle',
        'assets' => array(
            'js' => array(
                'App/start'
            ),
            'css' => array(
            ),
        ),
    ),
);

// API - Scripts
// -------------
$_routes += array(
    'clearCache_s' => array(
        'isScript' => true,
        'path' => '/api/script/clearCache_json.php',
    ),
    'deletePic_s' => array(
        'isScript' => true,
        'path' => '/api/script/deletePic_json.php',
    ),
    'setTags_s' => array(
        'isScript' => true,
        'path' => '/api/script/setTags_json.php',
    ),
    'editTag_s' => array(
        'isScript' => true,
        'path' => '/api/script/editTag_json.php',
    ),
    'fetchTags_s' => array(
        'isScript' => true,
        'path' => '/api/script/fetchTags_json.php',
    ),
    'editTagCategory_s' => array(
        'isScript' => true,
        'path' => '/api/script/editTagCategory_json.php',
    ),
    'getAllTags_s' => array(
        'isScript' => true,
        'path' => '/api/script/getAllTags_json.php',
    ),
    'getAllTagCategories_s' => array(
        'isScript' => true,
        'path' => '/api/script/getAllTagCategories_json.php',
    ),
    'getFolderList_s' => array(
        'isScript' => true,
        'path' => '/api/script/getFolderList_json.php',
    ),
    'getRandomPic_s' => array(
        'isScript' => true,
        'path' => '/api/script/getRandomPic_json.php',
    ),
    'getPicsFromBdd_s' => array(
        'isScript' => true,
        'path' => '/api/script/getPicsFromBdd_json.php',
    ),
    'getPicsList_s' => array(
        'isScript' => true,
        'path' => '/api/script/getPicsList_json.php',
    ),
    'export_s' => array(
        'isScript' => true,
        'path' => '/api/script/export_json.php',
    ),
);

// Static - Views - Errors
// -----------------------
$_routes += array(
    'status_403' => array(
        'isView' => true,
        'path' => '/public/errors/status_403.phtml',
        'title' => 'Error 403',
        'dont_check_auth' => true,
    ),
    'status_404' => array(
        'isView' => true,
        'path' => '/public/errors/status_404.phtml',
        'title' => 'Error 404',
        'dont_check_auth' => true,
    ),
);
