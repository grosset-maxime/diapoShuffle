<?php
/**
 * Pic item in bdd.
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
class Pic extends Root
{
    const TYPE_JPG = 1;
    const TYPE_PNG = 2;
    const TYPE_GIF = 3;

    protected $bdd = null;

    protected $id = 0;
    protected $path = '';
    protected $type = 0;
    protected $tags = '';

    /**
     * Pic constructor.
     */
    public function __construct(Array $data = array())
    {
        $this->bdd = BddConnector::getBddConnector()->getBdd();

        parent::__construct($data);

        if (!empty($data['shouldFetch']) && $data['shouldFetch'] === true) {
            $this->fetch();
        }
    }

    protected function setId($id)
    {
        $this->id = $id;
    }

    public function getId()
    {
        return $this->Id;
    }

    protected function setPath($path = '')
    {
        $this->path = $path;
    }

    public function getPath()
    {
        return $this->path;
    }

    public function getType($stringFormat = false)
    {
        $type = $this->type;

        if ($stringFormat === true) {
            if ($type === self::TYPE_JPG) {
                $type = 'jpg';
            } else if ($type === self::TYPE_PNG) {
                $type = 'png';
            } else if ($type === self::TYPE_GIF) {
                $type = 'gif';
            } else {
                $type = self::TYPE_JPG;
            }
        }

        return $type;
    }

    public function setType($type = self::TYPE_JPG)
    {
        if (is_string($type)) {
            switch ($type) {
                case 'jpeg':
                case 'jpg':
                    $type = self::TYPE_JPG;
                    break;
                case 'png':
                    $type = self::TYPE_PNG;
                    break;
                case 'gif':
                    $type = self::TYPE_GIF;
                    break;
                default:
                    $type = self::TYPE_JPG;
            }
        }

        $this->type = $type;
    }

    public function setTags($tags = '')
    {
        if (is_array($tags) && !empty($tags)) {

            $tags = implode(';', $tags);

        } if (empty($tags)) {
            $tags = '';
        }

        $tags = rtrim($tags, ';');
        $tags = trim($tags, ';');

        $this->tags = $tags;
    }

    public function getTags($arrayFormat = false)
    {
        $tags = html_entity_decode($this->tags);

        if ($arrayFormat === true) {
            if (empty($tags)) {
                $tags = array();
            } else {
                $tags = explode(';', $tags);
            }
        }

        return $tags;
    }

    public function fetch(Array $options = array())
    {
        $SELECT = 'SELECT * FROM pics WHERE ';

        $bdd = $this->bdd;
        $query = '';
        $param = array();
        $req; $data;

        if (!empty($this->id)) {

            $query = $SELECT . 'id = ?';
            $param[] = $this->id;

        } else if (!empty($this->path)) {

            $query = $SELECT . 'path = ?';
            $param[] = $this->path;

        } else {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Pic has no id and no path',
                    'message' => 'Pic has no id and no path',
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

        if (empty($this->tags)) {
            return true;
        }

        try {
            $query = 'INSERT INTO pics (path, type, tags) VALUES (:path, :type, :tags) ON DUPLICATE KEY UPDATE tags = :tags';
            $req = $bdd->prepare($query);

            $success = $req->execute(array(
                'path' => $this->path,
                'type' => $this->type,
                'tags' => ';' . $this->tags . ';'
            ));
        } catch (Exception $e) {
            $data = $this->fetch(array('shouldNotHydrate' => true));

            if ($data === false) {
                throw $e;
            }

            $this->setId($data['id']);
            return $this->update();
        }

        if ($success === true) {

            $this->id = $bdd->lastInsertId();

        } else if (
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
        $bdd = $this->bdd;
        $query = 'DELETE FROM pics WHERE id = ?';

        if (empty($this->id)) {
            if ($this->fetch() === false) {
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => 'Pic to delete is not in the Bdd.',
                        'message' => 'Pic to delete is not in the Bdd.',
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

        if (empty($this->tags)) {
            return $this->delete();
        }

        $bdd = $this->bdd;
        $query = 'UPDATE pics SET tags = ? WHERE id = ?';
        $req = $bdd->prepare($query);

        $result = $req->execute(array(
            ';' . $this->tags . ';',
            $this->id
        ));

        $req->closeCursor();

        return $result;
    }
}
