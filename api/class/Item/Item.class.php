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

// JpegMetadataToolkit
require_once dirname(__FILE__) . '/../../vendors/JpegMetadataToolkit/JPEG.php';
require_once dirname(__FILE__) . '/../../vendors/JpegMetadataToolkit/XMP.php';
require_once dirname(__FILE__) . '/../../vendors/JpegMetadataToolkit/Photoshop_IRB.php';
require_once dirname(__FILE__) . '/../../vendors/JpegMetadataToolkit/EXIF.php';
require_once dirname(__FILE__) . '/../../vendors/JpegMetadataToolkit/Photoshop_File_Info.php';

require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';

// Utils
require_once dirname(__FILE__) . '/../Utils/Utils.class.php';

// PHP
use \Exception;

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
        $pathLength = strlen($path);

        if ($pathLength){
            $path = (new Utils())->replaceWinSlaches($path);

            if (
                $path[$pathLength - 1] === '/' &&
                $pathLength >= 2
            ) {
                $path = rtrim($path, '/');
            }
        }

        $this->path = $path;
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
        if (empty($this->tags)) {
            $exif; $xmp; $jpegHeaderData;
            $pathWithName = $this->getPathWithName();

            try {

                // Report all errors except E_NOTICE and E_STRICT.
                error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);

                $exif = get_EXIF_JPEG($pathWithName);

                $jpegHeaderData = get_jpeg_header_data($pathWithName);

                $xmp = read_XMP_array_from_text(get_XMP_text($jpegHeaderData));

                $irb = get_Photoshop_IRB($jpegHeaderData);

                $jpegInfo = get_photoshop_file_info($exif, $xmp, $irb);

                $this->tags = $jpegInfo['keywords'];

                // Report all errors.
                error_reporting(E_ALL);

            } catch (Exception $e) {
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => 'File: "' . $pathWithName . '" fail to get tags.',
                        'message' => $e->getMessage(),
                        'severity' => ExceptionExtended::SEVERITY_WARNING
                    )
                );
            }
        }

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
