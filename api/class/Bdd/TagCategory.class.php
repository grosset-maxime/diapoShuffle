<?php
/**
 * Tag category item in bdd.
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
 * Class Tag category.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class TagCategory extends Root
{
    protected $bdd = null;

    protected $id = 0;
    protected $name = '';
    protected $color = '';

    /**
     * Constructor.
     */
    public function __construct(Array $data = array())
    {
        $this->bdd = BddConnector::getBddConnector()->getBdd();

        parent::__construct($data);

        if (!empty($data['shouldFetch']) && $data['shouldFetch'] === true) {
            $this->fetch();
        }
    }

    public function setId($id = 0)
    {
        $this->id = $id;
    }

    public function getId()
    {
        return $this->Id;
    }

    public function setName($name = '')
    {
        $this->name = $name;
    }

    public function getName()
    {
        return $this->name;
    }

    public function setColor($color = '')
    {
        $this->color = $color;
    }

    public function getColor()
    {
        return $this->color;
    }

    public function export()
    {
        return array(
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color
        );
    }

    public function fetch(Array $options = array())
    {
        $SELECT = 'SELECT * FROM tagCategories WHERE ';

        $errorMsg;
        $bdd = $this->bdd;
        $query = '';
        $param = array();
        $req; $data;

        if (!empty($this->id)) {

            $query = $SELECT . 'id = ?';
            $param[] = $this->id;

        } else if (!empty($this->name)) {

            $query = $SELECT . 'name = ?';
            $param[] = $this->name;

        } else {
            $errorMsg = 'Tag category has no id and no name';

            throw new ExceptionExtended(
                array(
                    'publicMessage' => $errorMsg,
                    'message' => $errorMsg,
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        $req = $bdd->prepare($query);
        $req->execute($param);

        $data = $req->fetch(PDO::FETCH_ASSOC);

        if (
            (empty($options['shouldNotHydrate']) || $options['shouldNotHydrate'] !== true) &&
            $data !== false
        ) {
            $this->hydrate($data);
        }

        $req->closeCursor();

        return $data;
    }

    public function add(Array $options = array())
    {
        $bdd = $this->bdd;

        if (!empty($this->id)) {
            return $this->update();
        }

        try {
            $query = 'INSERT INTO tags (id, name, color) VALUES (:id, :name, :color) ON DUPLICATE KEY UPDATE name = :name, color = :color';
            $req = $bdd->prepare($query);

            $success = $req->execute(array(
                'id' => $this->id,
                'name' => !empty($this->name) ? $this->name : $this->id,
                'color' => $this->color
            ));
        } catch (Exception $e) {
            $data = $this->fetch(array('shouldNotHydrate' => true));

            if ($data === false) {
                throw $e;
            }

            $this->setId($data['id']);
            return $this->update();
        }

        if (
            $success === false &&
            (empty($options['shouldNotUpdate']) || $options['shouldNotUpdate'] !== true)
        ) {

            $success = $this->update();

        }

        $req->closeCursor();

        return $success;
    }

    public function delete(Array $options = array())
    {
        $errorMsg;
        $bdd = $this->bdd;
        $query = 'DELETE FROM tagCategories WHERE id = ?';

        if (empty($this->id)) {
            if ($this->fetch() === false) {

                $errorMsg = 'Tag category to delete is not in the Bdd.';

                throw new ExceptionExtended(
                    array(
                        'publicMessage' => $errorMsg,
                        'message' => $errorMsg,
                        'severity' => ExceptionExtended::SEVERITY_INFO
                    )
                );
                return true;
            }
        }

        $req = $bdd->prepare($query);

        $result = $req->execute(array($this->id));

        $req->closeCursor();

        return $result;
    }

    public function update()
    {
        if (empty($this->id)) {
            return $this->add(array('shouldNotUpdate' => true));
        }

        $bdd = $this->bdd;
        $query = 'UPDATE tagCategories SET name = ?, color = ? WHERE id = ?';
        $req = $bdd->prepare($query);

        $result = $req->execute(array($this->name, $this->color, $this->id));

        $req->closeCursor();

        return $result;
    }
}
