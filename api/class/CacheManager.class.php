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
     * * param {array} data.cacheFolder : Cache folder (with pics).
     * * param {array} data.cacheFolderList : Cache folder list (only folders).
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);

        if (empty($_SESSION['cacheFolderUpdate'])) {
            $_SESSION['cacheFolderUpdate'] = 0;
        }

        if (empty($_SESSION['cacheFolderListUpdate'])) {
            $_SESSION['cacheFolderListUpdate'] = 0;
        }
    }

    /**
     * Get cache folder (with pics).
     *
     * @return {array} Cache folder.
     */
    public function getCacheFolder()
    {
        $cacheFolder = apc_fetch('cacheFolder');

        if (!is_array($cacheFolder)) {
            $cacheFolder = !empty($_SESSION['cacheFolder']) ? $_SESSION['cacheFolder'] : array();
        }

        return $cacheFolder;
    }

    /**
     * Get cache folder list (only folders).
     *
     * @return {array} Cache folder list.
     */
    public function getCacheFolderList()
    {
        $cacheFolder = apc_fetch('cacheFolderList');

        if (!is_array($cacheFolder)) {
            $cacheFolder = !empty($_SESSION['cacheFolderList']) ? $_SESSION['cacheFolderList'] : array();
        }

        return $cacheFolder;
    }

    /**
     * Store cache folder (with pics).
     *
     * @param {array} $cacheFolder : Cache folder.
     *
     * @return null
     */
    public function setCacheFolder($cacheFolder = array())
    {
        apc_store('cacheFolder', $cacheFolder);

        if (!$_SESSION['cacheFolderUpdate']--) {
            $_SESSION['cacheFolder'] = $cacheFolder;
            $_SESSION['cacheFolderUpdate'] = 5;
        }
    }

    /**
     * Store cache folder list (only folders).
     *
     * @param {array} $cacheFolderList : Cache folder list.
     *
     * @return null
     */
    public function setCacheFolderList($cacheFolderList = array())
    {
        apc_store('cacheFolderList', $cacheFolderList);

        if (!$_SESSION['cacheFolderListUpdate']--) {
            $_SESSION['cacheFolderList'] = $cacheFolderList;
            $_SESSION['cacheFolderListUpdate'] = 5;
        }
    }

    /**
     * Delete cache folder (with pics).
     *
     * @return null
     */
    public function deleteCacheFolder()
    {
        apc_delete('cacheFolder');
        unset($_SESSION['cacheFolder']);
    }

    /**
     * Delete cache folder list (only folders).
     *
     * @return null
     */
    public function deleteCacheFolderList()
    {
        apc_delete('cacheFolderList');
        unset($_SESSION['cacheFolderList']);
    }
} // End Class CacheManager
