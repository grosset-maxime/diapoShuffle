<?php
/**
 * Folder Pic engine.
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
    $_BASE_PIC_PATH, $_BASE_PIC_FOLDER_NAME, $_config
*/

namespace RandomPic;

// DS
require_once dirname(__FILE__) . '/../../../config/config.inc.php';
require_once dirname(__FILE__) . '/../../globals.php';
require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../CacheManager.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';

// Utils
require_once dirname(__FILE__) . '/../Utils/Utils.class.php';

// DeleteItem
require_once dirname(__FILE__) . '/../DeleteItem/DeleteItem.class.php';

// Item
require_once dirname(__FILE__) . '/../Item/Item.class.php';


// PHP
use \DirectoryIterator;
use \Exception;

// DS
use DS\Root;
use DS\CacheManager;
use DS\ExceptionExtended;

// Utils
use Utils\Utils;

// DeleteItem
use DeleteItem\DeleteItem;

// Item
use Item\Item;


/**
 * Class FolderPic.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class FolderPic extends Root
{
    // protected $Utils = null;

    /**
     * RandomPic constructor.
     *
     * @param {array} $data : RandomPic data.
     * * param {String[]} data.customFolders : List of custom folder.
     */
    public function __construct(array $data = array())
    {
        // $this->Utils = new Utils();

        parent::__construct($data);
    }

    public function getPics($folder)
    {
        return $this->getPicsList($folder);
    }

    /**
     * get
     *
     * @param {string} $folder : folder to scan
     *
     * @return {Item} Random item.
     */
    protected function getPicsList($folder)
    {
        // Init vars
        $item;
        $fileName;
        $dir;
        $listItems = array();


        try {
            $dir = new DirectoryIterator($folder);
        } catch (Exception $e) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Folder "' . $folder . '" is not accessible.',
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
                || !preg_match('/(.jpeg|.jpg|.gif|.png|.bmp)$/i', $fileName)
            ) {
                continue;
            }

            $listItems[] = $fileName;
        }

        return $listItems
    }
}
