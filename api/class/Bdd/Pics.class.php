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
require_once dirname(__FILE__) . '/Pic.class.php';

// PHP
use \Exception;
use \PDO;

// DS
use DS\Root;
use DS\ExceptionExtended;

// Bdd
use Bdd\BddConnector;
use Bdd\Pic;


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

    protected $typeToExtensionMap = array(
        Pic::TYPE_JPG => 'JPG',
        Pic::TYPE_GIF => 'GIF',
        Pic::TYPE_PNG => 'PNG',
        Pic::TYPE_WEBM => 'WEBM',
        Pic::TYPE_MP4 => 'MP4',
        Pic::TYPE_MKV => 'MKV',
    );

    protected $extensionToTypeMap = array(
        'JPG' => Pic::TYPE_JPG,
        'GIF' => Pic::TYPE_GIF,
        'PNG' => Pic::TYPE_PNG,
        'WEBM' => Pic::TYPE_WEBM,
        'MP4' => Pic::TYPE_MP4,
        'MKV' => Pic::TYPE_MKV,
    );

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
        $tagsWhere = '';
        $typesWhere = '';
        $typesId = array();
        $pics = array();

        $bdd = $this->bdd;
        $query = 'SELECT * FROM pics WHERE ';
        $req; $data;

        $tags = !empty($options['tags']) ? $options['tags'] : array();
        $tagsOperator = !empty($options['tagsOperator']) ? $options['tagsOperator'] : '';
        $tagsOperator = $tagsOperator === 'OR' ? ' OR ' : ' AND ';
        $types = !empty($options['types']) ? $options['types'] : array();

        // Tags filter.
        if (!empty($tags)) {
            $tags = array_map(function ($tag) {
                return '%;' . $tag . ';%';
            }, $tags);

            foreach ($tags as $tag) {
                $tagsWhere .= '(tags LIKE ?) ' . $tagsOperator;
            }

            $where .= '(' . rtrim($tagsWhere, $tagsOperator) . ')';
        }

        // Types filter.
        if (!empty($types)) {
            foreach ($types as $type) {

                if (!array_key_exists($type, $this->extensionToTypeMap)) {
                    throw new ExceptionExtended(
                        array(
                            'publicMessage' => 'Type not found: ' . $type,
                            'message' => 'Type not found: ' . $type,
                            'severity' => ExceptionExtended::SEVERITY_ERROR
                        )
                    );
                }

                $typesId[] = $this->extensionToTypeMap[$type];

                $typesWhere .= ' type = ? OR';
            }

            // Add a AND in where if needed.
            $where .= !empty($where) ? ' AND ' : '';

            // Remove last OR.
            $where .= '(' . rtrim($typesWhere, 'OR') . ')';
        }

        // If no where return empty array.
        if (empty($where)) {
            return $pics;
        }

        $req = $bdd->prepare($query . $where);
        $req->execute(array_merge($tags, $typesId));

        while ($data = $req->fetch(PDO::FETCH_ASSOC)) {
            $data['extension'] = $this->typeToExtensionMap[intval($data['type'], 10)];
            $pics[] = $data;
        }

        $req->closeCursor();

        return $pics;
    }
}
