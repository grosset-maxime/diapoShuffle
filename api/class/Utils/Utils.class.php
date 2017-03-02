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

}
