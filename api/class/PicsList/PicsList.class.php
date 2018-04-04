<?php
/**
 * Pics list engine.
 *
 * PHP version 5
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

/* global
    $_BASE_PIC_PATH
*/

namespace PicsList;

// DS
require_once dirname(__FILE__) . '/../../../config/config.inc.php';
require_once dirname(__FILE__) . '/../../globals.php';

require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';

// Utils
require_once dirname(__FILE__) . '/../Utils/Utils.class.php';

// Item
require_once dirname(__FILE__) . '/../Item/Item.class.php';

// PHP
use \DirectoryIterator;
use \Exception;

// DS
use DS\Root;
use DS\ExceptionExtended;

// Utils
use Utils\Utils;

// Item
use Item\Item;


/**
 * Class PicsList.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class PicsList extends Root
{
    protected $Utils = null;

    /**
     * PicsList constructor.
     */
    public function __construct()
    {
        $this->Utils = new Utils();

        parent::__construct();
    }

    /**
     * Get pics list in the provided folder.
     *
     * @param {string} $folder : Folder where to get pics list (path from pic folder).
     *
     * @return {strting[]} Pics list in the folder.
     */
    public function getPics($folder)
    {
        global $_BASE_PIC_PATH;

        $rootPathFolder = '';

        $folder = $this->Utils->normalizePath($folder);

        $rootPathFolder = $_BASE_PIC_PATH . $folder;

        return $this->getPicsList($rootPathFolder);
    }

    /**
     * Get pics list from the provided folder.
     *
     * @param {string} $folder : folder where to get pics list (Complete path from root).
     *
     * @return {strting[]} Pics list in the folder.
     */
    protected function getPicsList($rootPathFolder)
    {
        // Init vars
        $item;
        $pic;
        $fileName;
        $dir;
        $tags;
        $warningMessage = '';
        $pics = array();

        try {
            $dir = new DirectoryIterator($rootPathFolder);
        } catch (Exception $e) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Folder "' . $rootPathFolder . '" is not accessible.',
                    'message' => $e->getMessage(),
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        foreach ($dir as $item) {
            set_time_limit(30);

            $fileName = $item->getFilename();

            if ($item->isDot()
                || $item->isDir()
                || preg_match('/^[\.].*/i', $fileName)
                || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName)
                || !$this->Utils->isSupportedFileType($fileName)
            ) {
                continue;
            }

            $pic = new Item(
                array(
                    'name' => $fileName,
                    'type' => Item::TYPE_FILE,
                    'path' => $rootPathFolder,
                    'format' => pathinfo($fileName)['extension'],
                    'shouldFetch' => true
                )
            );

            try {
                $tags = $pic->getTags();
            } catch (ExceptionExtended $e) {
                $tags = array();
                $warningMessage = $e->getPublicMessage() . ' - ' . $e->getMessage();
            } catch (Exception $e) {
                throw $e;
            }

            $pics[] = array(
                'path' => $pic->getPublicPathWithName(),
                'tags' => $tags,
                'warning' => $warningMessage
            );
        }

        return $pics;
    }
}
