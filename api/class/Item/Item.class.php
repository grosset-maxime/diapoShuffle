<?php
/**
 * Random Pic Item.
 *
 * PHP version 5
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

namespace Item;

require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';

// Utils
require_once dirname(__FILE__) . '/../Utils/Utils.class.php';

// DS
use DS\Root;
use DS\ExceptionExtended;

// Utils
use Utils\Utils;

/**
 * Class Item.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class Item extends Root
{
    const TYPE_FOLDER = 'folder';
    const TYPE_FILE = 'file';

    protected $name = '';
    protected $type = '';
    protected $path = '';
    protected $tags = array();

    /**
     * Item constructor.
     *
     * @param {array} $data : RandomPic data.
     * * param {String} data.name : Item name.
     * * param {String} data.type : Item type.
     * * param {String} data.path : Item absolute path without name.
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);
    }

    /**
     * Is folder.
     *
     * @return {Boolean} Item is a folder.
     */
    public function isFolder()
    {
        return $this->type === self::TYPE_FOLDER;
    }

    /**
     * Getter name.
     *
     * @return {String} Item name.
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Setter name.
     *
     * @param {String} $name : Item name.
     *
     * @return null
     */
    public function setName($name = '')
    {
        $this->name = $name;
    }

    /**
     * Getter type.
     *
     * @return {String} Item type.
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Setter type.
     *
     * @param {String} $type : Item type (folder or item).
     *
     * @return null
     */
    public function setType($type = self::TYPE_FILE)
    {
        $type = strtolower($type);

        if ($type !== self::TYPE_FILE && $type !== self::TYPE_FOLDER) {
            $type = self::TYPE_FILE;
        }

        $this->type = $type;
    }

    /**
     * Getter path with name.
     *
     * @return {String} Item path with name.
     */
    public function getPathWithName()
    {
        return $this->path . '/' . $this->name;
    }

    /**
     * Getter path (Absolute path).
     *
     * @return {String} Item absolute path.
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * Setter path.
     *
     * @param {String} $path : Item path.
     *
     * @return null
     */
    public function setPath($path = '')
    {
        $this->path = (new Utils())->replaceWinSlaches($path);
    }

    /**
     * Getter path (Public path from root site).
     *
     * @return {String} Item public path.
     */
    public function getPublicPath()
    {
        global $_BASE_PIC_FOLDER_NAME;

        $path = $this->path;

        $publicPath = substr(
            $path,
            strpos($path, '/' . $_BASE_PIC_FOLDER_NAME)
        );

        return $publicPath;
    }

    /**
     * Getter path (Public path from root site).
     *
     * @return {String} Item public path.
     */
    public function getPublicPathWithName()
    {
        return $this->getPublicPath() . '/' . $this->name;
    }

    /**
     * Getter tags.
     *
     * @return {Array} Tags list.
     */
    public function getTags()
    {
        return $this->tags;
    }

    /**
     * Setter tags.
     *
     * @param {Array} $tags : Tags list (replace existing).
     *
     * @return null
     */
    public function setTags($tags = array())
    {
        $this->tags = $tags;
    }


    /**
     * Getter size.
     *
     * @return {Array[width, height]} Item size.
     */
    public function getSize()
    {
        try {

            $size = getimagesize($this->getPathWithName());

        } catch (Exception $e) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'File: "' . $this->getPathWithName() . '" fail to get size.',
                    'message' => $e->getMessage(),
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        return $size;
    }
} // End Class Item
