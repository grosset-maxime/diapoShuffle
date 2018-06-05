<?php
/**
 * Description : Set or unset tags on all items in provided folders (recursively).
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
    $_BASE_PIC_PATH
*/

require_once ROOT_DIR . '/api/class/ExceptionExtended.class.php';

require_once ROOT_DIR . '/api/class/Item/Item.class.php';

// Utils
require_once ROOT_DIR . '/api/class/Utils/Utils.class.php';


// DS
use DS\ExceptionExtended;

// Item
use Item\Item;

// Utils
use Utils\Utils;


$Utils = new Utils();

$folders = !empty($_POST['folders']) ? $_POST['folders'] : array();
$tags = !empty($_POST['tags']) ? $_POST['tags'] : array();
$method = !empty($_POST['method']) ? $_POST['method'] : 'set';

$logError = array(
    'mandatory_fields' => array(
        'folders' => '= ' . print_r($folders, true),
        'tags' => '= ' . print_r($tags, true),
        'method' => '= ' . print_r($method, true),
    ),
    'optional_fields' => array(
    ),
);

$jsonResult = array(
    'success' => false,
    'hasWarning' => false,
    'warning' => array()
);

if (!count($folders) || !count($tags) || empty($method)) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['mandatoryFields'] = true;
    $jsonResult['error']['message'] = 'Mandatory fields missing.';
    print json_encode($jsonResult);
    die;
}

$success = false;
$nbFolders = count($folders);
$foldersError = array();
$itemsError = array();

function setTagsToFolder ($folder, array $tags = array()) {
    global $itemsError;
    global $foldersError;
    global $Utils;
    global $method;

    $subFolders = array();
    $clearTags = false;
    $HUGE_EXIF_ERROR = 'Error: huge number of EXIF entries - EXIF is probably Corrupted';

    $dir = new DirectoryIterator($folder);

    foreach ($dir as $item) {
        set_time_limit(30);

        $fileName = $item->getFilename();
        $isDir = $item->isDir();
        $pathName = $item->getPathname();
        $path = $item->getPath();

        if (
            $item->isDot()
            || preg_match('/^[\.].*/i', $fileName) // Hidden file
            || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName)
            || ($isDir && $fileName === '@eaDir')
            || (!$isDir && !$Utils->isSupportedFileType($fileName))
        ) {
            continue;
        }

        if ($isDir) {
            $subFolders[] = $pathName;
            continue;
        }

        $Item = new Item(array(
            'path' => $path,
            'name' => $fileName,
            'type' => Item::TYPE_FILE,
            'format' => pathinfo($fileName)['extension'],
            'shouldFetch' => true
        ));

        try {
            $itemTags = $Item->getTags();
        } catch (ExceptionExtended $e) {
            if ($e->getMessage() === $HUGE_EXIF_ERROR) {
                $itemsError[] = $pathName;
                continue;
            } else {
                throw $e;
            }
        } catch (Exception $e) {
            if ($e->getMessage() === $HUGE_EXIF_ERROR) {
                $itemsError[] = $pathName;
                continue;
            } else {
                throw $e;
            }
        }


        if ($method === 'set') {
            $newTags = array_merge($tags, $itemTags);

        // Else unset tags.
        } else {
            $newTags = array_filter($itemTags, function ($tag) {
                global $tags;
                return !in_array($tag, $tags);
            });

            if (!count($newTags)) {
                $clearTags = true;
            }
        }

        try {
            $success = $Item->setTags($newTags, $clearTags);
        } catch (ExceptionExtended $e) {
            if ($e->getMessage() === $HUGE_EXIF_ERROR) {
                $itemsError[] = $pathName;
                continue;
            } else {
                throw $e;
            }
        } catch (Exception $e) {
            if ($e->getMessage() === $HUGE_EXIF_ERROR) {
                $itemsError[] = $pathName;
                continue;
            } else {
                throw $e;
            }
        }

        if (!$success) {
            $itemsError[] = $pathName;
        }
    }

    foreach ($subFolders as $subFolder) {
        set_time_limit(30);

        if (!file_exists($subFolder)) {
            $foldersError[] = $subFolder;
            continue;
        }

        setTagsToFolder($subFolder, $tags);
    }
}


foreach ($folders as $folder) {
    try {
        set_time_limit(30);

        $absolutePath = $_BASE_PIC_PATH . $folder;

        if (!file_exists($absolutePath)) {
            $foldersError[] = $folder;
            continue;
        }

        setTagsToFolder($absolutePath, $tags);

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
}

if (count($foldersError)) {
    $jsonResult['hasWarning'] = true;
    $jsonResult['warning']['foldersError'] = $foldersError;
}

if (count($itemsError)) {
    $jsonResult['hasWarning'] = true;
    $jsonResult['warning']['itemsError'] = $itemsError;
}

$success = true;


$jsonResult['success'] = $success;
print json_encode($jsonResult);
exit;
