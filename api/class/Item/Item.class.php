<?php
/**
 * Pic Item.
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

// Bdd
require_once dirname(__FILE__) . '/../Bdd/Pic.class.php';

// PHP
use \Exception;

// DS
use DS\Root;
use DS\ExceptionExtended;

// Utils
use Utils\Utils;

// Bdd
use Bdd\Pic;

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
    protected $type = ''; // Item type (folder or file).
    protected $path = ''; // Item absolute path without name.
    protected $tags = array();
    protected $format = ''; // Item extension format (jpg, gif, png, webm).
    protected $Pic = null;


    /**
     * Item constructor.
     *
     * @param {array} $data : RandomPic data.
     * * param {String} data.name : Item name.
     * * param {String} data.type : Item type (folder or file).
     * * param {String} data.path : Item absolute path without name.
     * * param {String} data.format : Item extension format (jpg, gif, png, webm).
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);

        if (!empty($data['shouldFetch']) && $data['shouldFetch'] === true) {
            $this->Pic = new Pic(array(
                'path' => $this->getPublicPathWithName(),
                'type' => $data['format'] ? $data['format'] : null,
                'shouldFetch' => true
            ));
        }
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
        $tags = $this->tags;

        if (empty($tags)) {

            if (empty($this->Pic)) {

                if ($this->isJpgFormat()) {
                    $tags = $this->getJpgTags();
                }

                $this->Pic = new Pic(array(
                    'path' => $this->getPublicPathWithName(),
                    'type' => $this->format,
                    'tags' => $tags
                ));
            } else {
                $tags = $this->Pic->getTags(true);

                if (empty($tags)) {

                    if ($this->isJpgFormat()) {
                        $tags = $this->getJpgTags();
                    }

                    $this->Pic->setTags($tags);
                }
            }

            if (!empty($tags)) {
                $this->tags = $tags;
                $this->Pic->update();
            }
        }

        return $tags;
    }

    /**
     * Setter tags.
     *
     * @param {Array} $tags : Tags list (replace existing).
     *
     * @return null
     */
    public function setTags(array $tags = array(), $clearTags = false)
    {
        if (empty($tags) && !$clearTags) {
            return false;
        }

        // Remove doublon tags.
        if (!$clearTags) {
            $tags = array_unique($tags);
        }

        if ($this->isJpgFormat()) {
            try {
                $this->setJpgTags($tags);
            } catch (ExceptionExtended $e) {
                throw $e;
            }
        }

        if (empty($this->Pic)) {
            $this->Pic = new Pic(
                array(
                    'path' => $this->getPublicPathWithName(),
                    'type' => $this->format
                )
            );
        }

        $this->tags = $tags;
        $this->Pic->setTags($tags);

        return $this->Pic->update();
    }

    public function getFormat()
    {
        return $this->format;
    }

    public function setFormat($format = '')
    {
        $this->format = $format;
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

    protected function isJpgFormat()
    {
        $is = false;
        $format = strtolower($this->format);

        if (empty($format)) {
            return false;
        }

        if ($format === 'jpg' || $format === 'jpeg') {
            $is = true;
        }

        return $is;
    }

    protected function setJpgTags(Array $tags = array())
    {
        $result = false;
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

            $jpegInfo['keywords'] = $tags;

            $jpegHeaderData = put_photoshop_file_info(
                $jpegHeaderData,
                $jpegInfo,
                $exif,
                $xmp,
                $irb
            );

            $result = put_jpeg_header_data(
                $pathWithName,
                $pathWithName,
                $jpegHeaderData
            );

            // Report all errors.
            error_reporting(E_ALL);

        } catch (Exception $e) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'File: "' . $pathWithName . '" fail to set tags.',
                    'message' => $e->getMessage(),
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        return $result;
    }

    protected function getJpgTags()
    {
        $exif; $xmp; $jpegHeaderData;
        $pathWithName = $this->getPathWithName();
        $tags = array();

        try {

            // Report all errors except E_NOTICE and E_STRICT.
            error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT);

            $exif = get_EXIF_JPEG($pathWithName);

            $jpegHeaderData = get_jpeg_header_data($pathWithName);

            $xmp = read_XMP_array_from_text(get_XMP_text($jpegHeaderData));

            $irb = get_Photoshop_IRB($jpegHeaderData);

            $jpegInfo = get_photoshop_file_info($exif, $xmp, $irb);

            $tags = $jpegInfo['keywords'];

            // Report all errors.
            error_reporting(E_ALL);

        } catch (Exception $e) {
            error_log('File: "' . $pathWithName . '" fail to get tags.');
            error_log(print_r($e->getMessage(), true));

            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'File: "' . $pathWithName . '" fail to get tags.',
                    'message' => $e->getMessage(),
                    'severity' => ExceptionExtended::SEVERITY_WARNING
                )
            );
        }

        return $tags;
    }
} // End Class Item
