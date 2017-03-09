<?php
/**
 * Tag item in bdd.
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
class Tag extends Root
{
    protected $bdd = null;

    protected $id = '';
    protected $name = '';

    /**
     * Pic constructor.
     */
    public function __construct(Array $data = array())
    {
        $this->bdd = (new BddConnector())->getBdd();

        parent::__construct($data);

        if (!empty($data['shouldFetch']) && $data['shouldFetch'] === true) {
            $this->fetch();
        }
    }

    public function setId($id)
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

    public function export()
    {
        return array(
            'id' => $this->id,
            'name' => $this->name
        );
    }

    public function fetch(Array $options = array())
    {
        $SELECT = 'SELECT * FROM tags WHERE ';

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
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Tag has no id and no name',
                    'message' => 'Tag has no id and no name',
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

        return $data;
    }

    public function add(Array $options = array())
    {
        $bdd = $this->bdd;

        if (!empty($this->id)) {
            return $this->update();
        }

        try {
            $query = 'INSERT INTO tags (id, name) VALUES (:id, :name) ON DUPLICATE KEY UPDATE name = :name';
            $req = $bdd->prepare($query);

            $success = $req->execute(array(
                'id' => $this->id,
                'name' => !empty($this->name) ? $this->name : $this->id
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

        return $success;
    }

    public function delete(Array $options = array())
    {
        $bdd = $this->bdd;
        $query = 'DELETE FROM tags WHERE id = ?';

        if (empty($this->id)) {
            if ($this->fetch() === false) {
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => 'Tag to delete is not in the Bdd.',
                        'message' => 'Tag to delete is not in the Bdd.',
                        'severity' => ExceptionExtended::SEVERITY_INFO
                    )
                );
                return true;
            }
        }

        $req = $bdd->prepare($query);

        return $req->execute(array($this->id));
    }

    public function update()
    {
        if (empty($this->id)) {
            return $this->add(array('shouldNotUpdate' => true));
        }

        $bdd = $this->bdd;
        $query = 'UPDATE tags SET name = ? WHERE id = ?';
        $req = $bdd->prepare($query);

        return $req->execute(array($this->name, $this->id));
    }
}