<?php
/**
 * Utils class.
 *
 * PHP version 5
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

namespace Utils;

require_once dirname(__FILE__) . '/../Root.class.php';

// DS
use DS\Root;


/**
 * Class Utils.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class Utils extends root
{

    const WIN_SEP = '\\';
    const UNIX_SEP = '/';

    /**
     * Utils constructor.
     */
    public function __construct() {
        parent::__construct();
    }

    /**
     * replaceWinSlaches
     *
     * @param {String} $s : String to replace antislashes by slashes.
     *
     * @return {String} String with win antislashes replaced by slashes.
     */
    public function replaceWinSlaches($s)
    {
        return str_replace(self::WIN_SEP, self::UNIX_SEP, $s);
    }

    /**
     * Normalize path.
     *
     * @param {String} $p : Path to normalize.
     *
     * @return {String} Normalized path.
     */
    public function normalizePath($p)
    {
        $p = $this->replaceWinSlaches($p);

        if ($p === '/') {
            $p = '';
        }

        // Manage '/' for start and end of the path.
        if ($p) {
            // Begin of path
            if ($p[0] !== '/') {
                $p = '/' . $p;
            }

            // End of path
            if ($p[strlen($p) - 1] !== '/') {
                $p .= '/';
            }
        }

        return $p;
    }

    /**
     * Is supported file type.
     *
     * @param {String} $fileName : File name to check if type is supported.
     *
     * @return {Boolean} Is type supported.
     */
    public function isSupportedFileType ($fileName)
    {
        return preg_match('/(.jpeg|.jpg|.gif|.png|.bmp|.webm|.mp4|.mkv)$/i', $fileName);
    }

}
