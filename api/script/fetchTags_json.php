<?php
/**
 * Description : Fetch tags form folders to fill bdd pics table.
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
    ROOT_DIR,
    _BASE_PIC_PATH
*/

require_once ROOT_DIR . '/api/class/ExceptionExtended.class.php';

require_once ROOT_DIR . '/api/class/Item/Item.class.php';

require_once ROOT_DIR . '/api/class/Utils/Utils.class.php';


// DS
use DS\ExceptionExtended;

// Bdd
use Item\Item;

// Utils
use Utils\Utils;


$folders = !empty($_POST['folders']) ? $_POST['folders'] : array();
$folder;
$nbFiles = 0;
$success = false;


$logError = array(
    'mandatory_fields' => array(
        'folders' => '= ' . implode(' - ', $folders),
    ),
    'optional_fields' => array(
    ),
);

$jsonResult = array(
    'success' => false
);

if (empty($folders) || !count($folders)) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['mandatoryFields'] = true;
    $jsonResult['error']['message'] = 'Mandatory fields missing.';
    print json_encode($jsonResult);
    die;
}


function getRootFolders ($folders = array(''))
{
    // Init vars.
    global $_BASE_PIC_PATH;
    $errorMessage;
    $rootPathFolder;
    $folder;
    $result = array();
    $Utils = new Utils();

    foreach ($folders as $folder) {
        $folder = $Utils->normalizePath($folder);

        $rootPathFolder = $_BASE_PIC_PATH . $folder;

        try {
            if (!file_exists($rootPathFolder)) {
                throw new Exception();
            }

            new DirectoryIterator($rootPathFolder);

            $result[] = $rootPathFolder;
        } catch (Exception $e) {
            continue;
        }
    }

    if (!count($result)) {
        $errorMessage = 'No valid custom folders provided: ' . implode(' - ', $folders);

        throw new ExceptionExtended(
            array(
                'publicMessage' => $errorMessage,
                'message' => $e->getMessage() ? $e->getMessage : $errorMessage,
                'severity' => ExceptionExtended::SEVERITY_WARNING
            )
        );
    }

    return $result;
}

function fetchTags ($folder = '')
{
    global $nbFiles;

    try {
        $dir = new DirectoryIterator($folder);
    } catch (Exception $e) {
        throw new ExceptionExtended(
            array(
                'publicMessage' => 'Folder "' . $folder . '" is not accessible.',
                'message' => $e->getMessage(),
                'severity' => ExceptionExtended::SEVERITY_WARNING
            )
        );
    }

    foreach ($dir as $item) {
        set_time_limit(30);

        $fileName = $item->getFilename();
        $isDir = $item->isDir();

        if ($item->isDot()
            || preg_match('/^[\.].*/i', $fileName)
            || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName)
            || ($isDir && $fileName === '@eaDir')
        ) {
            continue;
        }

        if ($isDir) {
            fetchTags($item->getPathname());
            continue;
        }

        (new Item(
            array(
                'name' => $fileName,
                'type' => Item::TYPE_FILE,
                'path' => $folder,
                'format' => pathinfo($fileName)['extension'],
                'shouldFetch' => true
            )
        ))->getTags();

        $nbFiles++;
    }
}


try {
    $folders = getRootFolders($folders);

    foreach ($folders as $folder) {
        fetchTags($folder);
    }

    $jsonResult['nbFiles'] = $nbFiles;
    $success = true;

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
