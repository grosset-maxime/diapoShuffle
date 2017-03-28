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
 * Class Pics.
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

    /**
     * Pics constructor.
     */
    public function __construct(Array $data = array())
    {
        $this->bdd = BddConnector::getBddConnector()->getBdd();

        parent::__construct($data);
    }

    public function fetch(Array $options = array())
    {
        $where = '';
        $pics = array();

        $bdd = $this->bdd;
        $query = 'SELECT * FROM pics WHERE ';
        $req; $data;

        $tags = !empty($options['tags']) ? $options['tags'] : array();
        $operator = !empty($options['operator']) ? $options['operator'] : '';
        $operator = $operator === 'OR' ? ' OR ' : ' AND ';

        if (empty($tags)) {
            return $pics;
        }

        $tags = array_map(function ($tag) {
            return '%;' . $tag . ';%';
        }, $tags);

        foreach ($tags as $tag) {
            $where .= '(tags LIKE ?) ' . $operator;
        }

        $where = rtrim($where, $operator);

        $req = $bdd->prepare($query . $where);
        $req->execute($tags);

        while ($data = $req->fetch(PDO::FETCH_ASSOC)) {

            $pics[] = $data;

        }

        $req->closeCursor();

        return $pics;
    }
}
