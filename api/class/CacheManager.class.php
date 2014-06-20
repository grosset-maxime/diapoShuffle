<?php
/**
 * Cache manager.
 *
 * PHP version 5
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

namespace DS;

require_once dirname(__FILE__) . '/Root.class.php';


// DS
use DS\Root;


/**
 * Class CacheManager.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class CacheManager extends Root
{
    protected $cacheFolder = array();

    /**
     * RandomPic constructor.
     *
     * @param {array} $data : CacheManager data.
     * * param {array} data.cacheFolder : Cache folder.
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);

        if (empty($data['cacheFolder'])) {
            $this->cacheFolder = !empty($_SESSION['cacheFolder']) ? $_SESSION['cacheFolder'] : array();
        }
    }

    /**
     * Getter cache folder.
     *
     * @return {array} Cache folder.
     */
    public function getCacheFolder()
    {
        return $this->cacheFolder;
    }

    /**
     * Setter cache folder.
     *
     * @param {array} $cacheFolder : Cache folder.
     *
     * @return null
     */
    public function setCacheFolder($cacheFolder = array())
    {
        $this->cacheFolder = $cacheFolder;
        $_SESSION['cacheFolder'] = $cacheFolder;
    }

} // End Class CacheManager
