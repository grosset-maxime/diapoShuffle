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
    /**
     * CacheManager constructor.
     *
     * @param {array} $data : CacheManager data.
     * * param {array} data.cacheFolder : Cache folder.
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);
    }

    /**
     * Fetch cache folder.
     *
     * @return {array} Cache folder.
     */
    public function getCacheFolder()
    {
        $cacheFolder = apc_fetch('cacheFolder');
        return is_array($cacheFolder) ? $cacheFolder : array();
    }

    /**
     * Store cache folder.
     *
     * @param {array} $cacheFolder : Cache folder.
     *
     * @return null
     */
    public function setCacheFolder($cacheFolder = array())
    {
        apc_store('cacheFolder', $cacheFolder);
    }

    /**
     * Delete cache folder.
     *
     * @return null
     */
    public function deleteCacheFolder()
    {
        apc_delete('cacheFolder');
    }
} // End Class CacheManager
