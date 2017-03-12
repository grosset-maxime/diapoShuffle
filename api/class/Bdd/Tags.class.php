<?php
/**
 * Tags collection.
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
require_once dirname(__FILE__) . '/Tag.class.php';

// PHP
use \Exception;
use \PDO;

// DS
use DS\Root;
use DS\ExceptionExtended;

// Bdd
use Bdd\BddConnector;
use Bdd\Tag;


/**
 * Class Pic.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class Tags extends Root
{
    protected $bdd = null;

    protected $tags = array();


    /**
     * Pic constructor.
     */
    public function __construct(Array $data = array())
    {
        $this->bdd = BddConnector::getBddConnector()->getBdd();

        parent::__construct($data);

        if (!empty($data['shouldFetchAll']) && $data['shouldFetchAll'] === true) {
            $this->fetchAll();
        }
    }

    protected function setTags(Array $tags = array())
    {
        $this->tags = $tags;
    }

    public function getTags()
    {
        return $this->tags;
    }

    public function export()
    {
        $export = array();

        foreach ($this->tags as $Tag) {
            $export[] = $Tag->export();
        }

        return $export;
    }

    public function fetchAll(Array $options = array())
    {
        $bdd = $this->bdd;
        $query = 'SELECT * FROM tags ORDER BY name';
        $req; $data;

        $req = $bdd->prepare($query);
        $req->execute();

        $tags = array();

        while ($data = $req->fetch(PDO::FETCH_ASSOC)) {

            $tags[] = new Tag($data);

        }

        if (
            empty($options['shouldNotHydrate']) || $options['shouldNotHydrate'] !== true
        ) {
            $this->hydrate(array(
                'tags' => $tags
            ));
        }

        $req->closeCursor();

        return $tags;
    }
}
