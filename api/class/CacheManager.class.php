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
     * * param {array} data.cacheFolderList : Cache folder list (only folder).
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);
    }

    /**
     * Get cache folder.
     *
     * @return {array} Cache folder.
     */
    public function getCacheFolder()
    {
        $cacheFolder = apc_fetch('cacheFolder');
        return is_array($cacheFolder) ? $cacheFolder : array();
    }

    /**
     * Get cache folder list (only folder).
     *
     * @return {array} Cache folder list.
     */
    public function getCacheFolderList()
    {
        $cacheFolder = apc_fetch('cacheFolderList');
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
     * Store cache folder list.
     *
     * @param {array} $cacheFolderList : Cache folder list.
     *
     * @return null
     */
    public function setCacheFolderList($cacheFolderList = array())
    {
        apc_store('cacheFolderList', $cacheFolderList);
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

    /**
     * Delete cache folder list.
     *
     * @return null
     */
    public function deleteCacheFolderList()
    {
        apc_delete('cacheFolderList');
    }
} // End Class CacheManager
