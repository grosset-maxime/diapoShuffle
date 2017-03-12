<?php
/**
 * Pics collection.
 *
 * PHP version 5
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

namespace Bdd;


require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';

require_once dirname(__FILE__) . '/BddConnector.class.php';

// PHP
use \Exception;
use \PDO;

// DS
use DS\Root;
use DS\ExceptionExtended;

// Bdd
use Bdd\BddConnector;


/**
 * Class Pic.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class Pics extends Root
{
    protected $bdd = null;

    // protected $pics = array();


    /**
     * Pic constructor.
     */
    public function __construct(Array $data = array())
    {
        $this->bdd = (new BddConnector())->getBdd();

        parent::__construct($data);

        // if (!empty($data['shouldFetchAll']) && $data['shouldFetchAll'] === true) {
        //     $this->fetchAll();
        // }
    }

    // public function getPics ()

    public function fetch(Array $options = array())
    {
        $bdd = $this->bdd;
        $query = 'SELECT * FROM pics WHERE tags LIKE ?';
        $req; $data;

        $tagsRegex = '%;' . $options['tags'][0] . ';%';

        $req = $bdd->prepare($query);
        $req->execute(array($tagsRegex));

        $pics = array();

        while ($data = $req->fetch(PDO::FETCH_ASSOC)) {

            $pics[] = $data;

        }


        // if (
        //     empty($options['shouldNotHydrate']) || $options['shouldNotHydrate'] !== true
        // ) {
        //     $this->hydrate(array(
        //         'pics' => $pics
        //     ));
        // }

        return $pics;
    }
}
