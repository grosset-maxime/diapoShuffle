<?php
/**
 * Description : Static assets to load.
 *
 * PHP version 5
 *
 * @category Config_-_Assets
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

$_jQueryPath = 'vendors/jquery/jquery-2.1.1';
$_jQueryUIPath = 'vendors/jquery-ui/jquery-ui';
$_jQueryInheritPath = 'vendors/jquery-inherit/jquery-inherit-1.3.6';

$_PMPath = 'vendors/PM/';

$_assets = array(
    // JS
    // --
    'js' => array(
        // Vendors
        $_jQueryPath,
        $_jQueryInheritPath,
        'vendors/curl/curl-0.8.10',
    ),

    // CSS
    // ---
    'css' => array(
        // Vendors
        $_jQueryUIPath,

        // Screen (must be the last)
        'screen',
    ),
);

