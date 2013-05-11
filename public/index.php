<?php
/**
 * Description :
 *
 * PHP version 5
 *
 * @category Script_-_Main_Frame
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
session_start();

/*global
    $_routes, $_config
*/

define('ROOT_DIR', dirname(dirname(__FILE__)));
define('HTTP_HOST', $_SERVER['HTTP_HOST']);
define('USER_ID', !empty($_SESSION['id']) ? $_SESSION['id'] : 0);

/**
 * Description :
 *
 * @param {string} $url : Url to load.
 *
 * @return null
 */
function redirect ($url)
{
    if (!headers_sent()) {
        header('Location: ' . $url); exit;
    } else {
        echo '<script type="text/javascript">'
            . 'window.location.href="' . $url . '";'
            . '</script>'
            . '<noscript>'
            . '<meta http-equiv="refresh" content="0;url=' . $url . '" />'
            .'</noscript>';
        exit;
    }
}

//require_once ROOT_DIR . '/connexionBdd.inc.php';  // Connexion a la base de donnee MySQL

require_once ROOT_DIR . '/config/routes.php';

// Get global config
// -----------------
$_configPath = ROOT_DIR . '/config/config.inc.php';

if (file_exists($_configPath)) {
    include_once $_configPath;
} else {
    die("Global config file is missing.");
}

$appTitle = '';
$appSubTitle = '';
$copyRightText = '';

if (!empty($_config['app'])) {
    $appConfig = $_config['app'];
    $appTitle = isset($appConfig['title']) ? $appConfig['title'] : '';
    $appSubTitle = isset($appConfig['sub_title']) ? $appConfig['sub_title'] : '';
    $copyRightText = isset($appConfig['copy_right_text']) ? $appConfig['copy_right_text'] : '';
}


$_r = !empty($_GET['r']) ? $_GET['r'] : 'diapoShuffle';
$_r = !empty($_POST['r']) ? $_POST['r'] : $_r;

// Check if the route exist
if (!array_key_exists($_r, $_routes)) {
    $_r = 'status_404';
    redirect('http://' . HTTP_HOST . '/index.php?r=' . $_r);
} 

// If the roote is a Script
if (!empty($_routes[$_r]['isScript'])) {
    include_once ROOT_DIR . $_routes[$_r]['path'];
    exit;
}
?>

<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="utf-8">
        <title>
<?php if (!empty($_routes[$_r]['title'])) {
            echo $_routes[$_r]['title'];
} ?>
        </title>

        <link rel="icon favicon" type="image/png" href="favicon.png"/>

        <!-- CSS //-->
        <link rel="stylesheet" href="http://<?php echo HTTP_HOST; ?>/js/vendors/jquery-ui/jquery-ui.css" type="text/css"  media="screen"/>
        <link rel="stylesheet" href="http://<?php echo HTTP_HOST; ?>/css/screen.css" media="screen" type="text/css" title="default"/>
        
        <!-- <script type="text/javascript" src="http://<?php echo HTTP_HOST; ?>/js/vendors/jquery/jquery-2.0.0.min.js"></script>
        <script type="text/javascript" src="http://<?php echo HTTP_HOST; ?>/js/vendors/jquery-ui/jquery-ui.js"></script> -->

        <script type="text/javascript">
        var curl = {
            baseUrl: "/js",
            paths: {
                'jquery': 'vendors/jquery/jquery-2.0.0',
                'jquery-ui': 'vendors/jquery-ui/jquery-ui'
            }
        };
        </script>
        <script type="text/javascript" src="http://<?php echo HTTP_HOST; ?>/js/vendors/curl/curl.js"></script>
    </head>
    <body>
<?php require_once ROOT_DIR . '/static/header.phtml'; ?>
        
<?php require_once ROOT_DIR . '/static/menu.phtml'; ?>

        <div class="content_container">
<?php require_once ROOT_DIR . $_routes[$_r]['path']; ?>
        </div>
        
<?php require_once ROOT_DIR . '/static/footer.phtml'; ?>
    </body>
</html>
