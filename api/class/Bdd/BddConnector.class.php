<?php
/**
 * Bdd connector.
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
    ROOT_DIR, $_localConfig
*/

namespace Bdd;


require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';


$localConfigPath = ROOT_DIR . '/config/local.inc.php';
if (file_exists($localConfigPath)) {
    include_once $localConfigPath;
} else {
    die("Global local file is missing.");
}


// PHP
use \Exception;
use \PDO;

// DS
use DS\Root;
use DS\ExceptionExtended;

/**
 * Class BddConnector.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class BddConnector extends Root
{
    protected static $BddConnector = null;

    protected $bdd = null;
    protected $host = '';
    protected $name = '';
    protected $port = 0;
    protected $login = '';
    protected $pwd = '';

    /**
     * BddConnector constructor.
     */
    public function __construct()
    {
        global $_localConfig;

        parent::__construct();

        $bddConfig = $_localConfig['bdd'];

        $this->host = $bddConfig['host'];
        $this->name = $bddConfig['name'];
        $this->port = $bddConfig['port'];
        $this->login = $bddConfig['login'];
        $this->pwd = $bddConfig['pwd'];

        $pdoConnection = 'mysql:host=' . $this->host . ';dbname=' . $this->name . ';port=' . $this->port . 'charset=utf8';

        try {

            $this->bdd = new PDO(
                $pdoConnection,
                $this->login,
                $this->pwd,
                array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
            );

        } catch (Exception $e) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Impossible to connect to the bdd: "' . $this->host . ':' . $this->name . ':' . $this->port . '" fail to get tags.',
                    'message' => $e->getMessage(),
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }
    }

    public static function getBddConnector()
    {
        if (is_null(self::$BddConnector)) {
            self::$BddConnector = new BddConnector();
        }

        return self::$BddConnector;
    }

    public function getBdd()
    {
        return $this->bdd;
    }
}
