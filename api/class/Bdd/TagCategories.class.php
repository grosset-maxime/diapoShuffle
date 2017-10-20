<?php
/**
 * TagCategories collection.
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
require_once dirname(__FILE__) . '/TagCategory.class.php';

// PHP
use \Exception;
use \PDO;

// DS
use DS\Root;
use DS\ExceptionExtended;

// Bdd
use Bdd\BddConnector;
use Bdd\TagCategory;


/**
 * Class TagCategories.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class TagCategories extends Root
{
    protected $bdd = null;

    protected $tagCategories = array();


    /**
     * Constructor.
     */
    public function __construct(Array $data = array())
    {
        $this->bdd = BddConnector::getBddConnector()->getBdd();

        parent::__construct($data);

        if (!empty($data['shouldFetchAll']) && $data['shouldFetchAll'] === true) {
            $this->fetchAll();
        }
    }

    protected function setTagCategories(Array $categories = array())
    {
        $this->tagCategories = $categories;
    }

    public function getTagCategories()
    {
        return $this->tagCategories;
    }

    public function export()
    {
        $export = array();

        foreach ($this->tagCategories as $TagCategory) {
            $export[] = $TagCategory->export();
        }

        return $export;
    }

    public function fetchAll(Array $options = array())
    {
        $bdd = $this->bdd;
        $query = 'SELECT * FROM tagCategories ORDER BY name';
        $req; $data;

        $req = $bdd->prepare($query);
        $req->execute();

        $tagCategories = array();

        while ($data = $req->fetch(PDO::FETCH_ASSOC)) {

            $tagCategories[] = new TagCategory($data);

        }

        if (
            empty($options['shouldNotHydrate']) || $options['shouldNotHydrate'] !== true
        ) {
            $this->hydrate(array(
                'tagCategories' => $tagCategories
            ));
        }

        $req->closeCursor();

        return $tagCategories;
    }
}
