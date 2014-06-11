<?php
/**
 * Root class.
 *
 * PHP version 5
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

namespace DS;

/**
 * Root class.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
abstract class Root
{
    /**
     * Root constructor.
     *
     * @param {array} $data : Root data.
     */
    public function __construct(array $data = array())
    {
        $this->hydrate($data);
    }

    /**
     * Hydrate the instance.
     *
     * @param {array} $data : Data.
     *
     * @return null
     */
    public function hydrate(array $data = array())
    {
        foreach ($data as $key => $value) {
            $method = 'set' . ucfirst($key);

            if (method_exists($this, $method)) {
                $this->$method($value);
            }
        }
    }

    /**
     * To string : debug function to print instance object content.
     *
     * @return {string} List of attributs.
     */
    public function __toString()
    {
        $result = '';
        foreach ($this as $attr => $val) {
            $result .= $attr . ' => "' . $val . '" | ';
        }

        return $result;
    }
}
