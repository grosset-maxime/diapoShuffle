<?php
/**
 * Description : Export items filtered by tags to the export folder.
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
    $_BASE_PIC_PATH, $_BASE_PIC_FOLDER_NAME
*/

require_once ROOT_DIR . '/api/class/ExceptionExtended.class.php';

require_once ROOT_DIR . '/api/class/Bdd/Pics.class.php';


// DS
use DS\ExceptionExtended;

// Bdd
use Bdd\Pics;

global $_config;

$tags = !empty($_POST['tags']) ? $_POST['tags'] : array();
$tagsOperator = !empty($_POST['tagsOperator']) ? $_POST['tagsOperator'] : 'AND';
$types = !empty($_POST['types']) ? $_POST['types'] : array();

$exportFolderPath = isset($_config['exportFolderPath']) ? $_config['exportFolderPath'] : false;

$logError = array(
    'mandatory_fields' => array(
        'exportFolderPath' => '= ' . $exportFolderPath,
        'tags' => '= ' . print_r($tags, true)
    ),
    'optional_fields' => array(),
);

$jsonResult = array(
    'success' => false
);

if (empty($exportFolderPath) || empty($tags)) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['mandatoryFields'] = true;
    $jsonResult['error']['message'] = 'Mandatory fields missing.';
    print json_encode($jsonResult);
    die;
}

$success = false;



// $results = (new Pics())->fetch(array(
//     'tags' => $tags
// ));

$results = (new Pics())->fetch(array(
    'tagsOperator' => $tagsOperator,
    'tags' => $tags,
    'types' => $types
));


if (!empty($results)) {

    try {
        if (!is_dir($exportFolderPath)) {
            if (!mkdir($exportFolderPath)) {
                $message = 'Impossible to create export folder: ' . $exportFolderPath;
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => $message,
                        'message' => $message,
                        'severity' => ExceptionExtended::SEVERITY_ERROR
                    )
                );
            }
        }

        $date = new DateTime();
        $exportFolder = $exportFolderPath . '/' . $date->getTimestamp();

        if (!mkdir($exportFolder)) {
            $message = 'Impossible to create timestamp export folder: ' . $exportFolder;
            throw new ExceptionExtended(
                array(
                    'publicMessage' => $message,
                    'message' => $message,
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        $nbCopiedFiles = 0;
        $baseItemPath = substr($_BASE_PIC_PATH, 0, -strlen('/' . $_BASE_PIC_FOLDER_NAME));

        $indexSameName = 1;

        foreach ($results as $result) {
            $resultPath = $result['path'];

            $slashPos = strrpos($resultPath, '/');
            $fileName = substr($resultPath, $slashPos + 1);

            $srcPath = $baseItemPath . $resultPath;
            $destPath = $exportFolder . '/' . $fileName;

            if (!file_exists($srcPath)) {
                continue;
            }

            if (file_exists($destPath)) {
                $extensionPos = strrpos($destPath, '.'); // find position of the last dot, so where the extension starts
                $destPath = substr($destPath, 0, $extensionPos) . '_' . $date->getTimestamp() . '_' . $indexSameName . substr($destPath, $extensionPos);

                $indexSameName++;
            }

            if (copy($srcPath, $destPath)) {
                $nbCopiedFiles++;
            }
        }

        $success = $nbCopiedFiles > 0;

        if (!$success) {
            $message = 'No file copied from ' . count($results) . ' results found.';
            throw new ExceptionExtended(
                array(
                    'publicMessage' => $message,
                    'message' => $message,
                    'severity' => ExceptionExtended::SEVERITY_WARNING
                )
            );
        }

        $jsonResult['nbCopiedFiles'] = $nbCopiedFiles;

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
} else {
    $message = 'No pic found for selected ';
    $message .= 'tags: ' . implode(' ' . 'AND' . ' ', $tags);
    $jsonResult['error']['message'] = $message;
    $jsonResult['error']['publicMessage'] = $message;
}

$jsonResult['success'] = $success;
print json_encode($jsonResult);
exit;
