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
ob_start(); // required for not sending header automaticaly

/*global
    $_routes, $_config
*/

define('ROOT_DIR', dirname(dirname(__FILE__)));
define('HTTP_HOST', $_SERVER['HTTP_HOST']);

ini_set('log_errors', 'on');
ini_set('error_log', ROOT_DIR . '/log/php/php_error.log');

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
require_once ROOT_DIR . '/config/assets.php';

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

// If the route is a Script
if (!empty($_routes[$_r]['isScript'])) {
    include_once ROOT_DIR . '/api/globals.php';
    include_once ROOT_DIR . $_routes[$_r]['path'];
    exit;
}

// Manage assets (js and css)
// --------------------------
$assetsJs = '';

if (!empty($_assets['js'])) {
    foreach ($_assets['js'] as $key => $pathAsset) {
        $assetsJs .= '<script type="text/javascript" src="/js/' . $pathAsset . '.js"></script>';
    }
}

$assetsCss = '';

if (!empty($_assets['css'])) {
    foreach ($_assets['css'] as $key => $pathAsset) {
        $assetsCss .= '<link rel="stylesheet" href="/css/' . $pathAsset . '.css" type="text/css" media="screen"/>';
    }
}

// Manage route assets (js and css)
// --------------------------------
$assetsRouteJs = '';

if (!empty($_routes[$_r]['assets']) && !empty($_routes[$_r]['assets']['js'])) {
    foreach ($_routes[$_r]['assets']['js'] as $key => $pathAsset) {
        $assetsRouteJs .= '<script type="text/javascript" src="/js/' . $pathAsset . '.js"></script>';
    }
}

$assetsRouteCss = '';

if (!empty($_routes[$_r]['assets']) && !empty($_routes[$_r]['assets']['css'])) {
    foreach ($_routes[$_r]['assets']['css'] as $key => $pathAsset) {
        $assetsRouteCss .= '<link rel="stylesheet" href="/css/' . $pathAsset . '.css" type="text/css" media="screen"/>';
    }
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
        <?php echo $assetsCss; ?>

        <?php echo $assetsRouteCss; ?>

        <!-- JS //-->
        <script type="text/javascript">
        var curl = {
            baseUrl: '/js',
            paths: {
                'jquery': '<?php echo $_jQueryPath ?>',
                'jquery-ui': '<?php echo $_jQueryUIPath; ?>',
                'jquery-inherit': '<?php echo $_jQueryInheritPath; ?>.js',
                'PM': '<?php echo $_PMPath; ?>'
            }
        };

        <?php
            if (!empty($_config['globalsJs'])) {
                echo 'var globals = {';
                foreach ($_config['globalsJs'] as $key => $val) {
                    echo '"' . $key . '": "' . $val . '",';
                }
                echo '};';
            }
        ?>
        </script>

        <?php echo $assetsJs; ?>

        <?php echo $assetsRouteJs; ?>

    </head>
    <body>
<?php require_once ROOT_DIR . '/static/header.phtml'; ?>

<?php require_once ROOT_DIR . '/static/menu.phtml'; ?>

<?php
if (!empty($_routes[$_r]['path'])) {
    include_once ROOT_DIR . $_routes[$_r]['path'];
}
?>

<?php require_once ROOT_DIR . '/static/footer.phtml'; ?>
    </body>
</html>
