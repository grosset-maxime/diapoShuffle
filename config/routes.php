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
        'path' => '/module/App/view/diapoShuffle_view.phtml',
        'title' => 'Diapo Shuffle',
        'assets' => array(
            'js' => array(
                '/view/diapoShuffle'
            ),
        ),
    ),
);

// API - Scripts
// -------------
$_routes += array(
    'getRandomPic_s' => array(
        'isScript' => true,
        'path' => '/api/script/getRandomPic_json.php',
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
