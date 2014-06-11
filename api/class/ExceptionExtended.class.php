<?php
/**
 * ExceptionExtend class.
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


// PHP
use \Exception;


/**
 * Class Exception.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class ExceptionExtended extends Exception
{
    const SEVERITY_WARNING = 'warning';
    const SEVERITY_ERROR = 'error';
    const SEVERITY_INFO = 'info';

    protected $publicMessage = '';
    protected $severity;

    /**
     * Exception constructor.
     *
     * @param {array} $data : Exception data.
     * * param {String}    [data.publicMessage] : .
     * * param {String}    [data.severity] : .
     * * param {String}    [data.message] : .
     * * param {Integer}   [data.code=0] : .
     * * param {PHPException} [data.previous=null] : .
     */
    public function __construct(array $data = array())
    {
        $publicMessage = !empty($data['publicMessage']) ? $data['publicMessage'] : '';
        $severity = !empty($data['severity']) ? $data['severity'] : '';
        $message = !empty($data['message']) ? $data['message'] : '';
        $code = !empty($data['code']) ? $data['code'] : 0;
        $previous = !empty($data['previous']) ? $data['previous'] : null;

        $this->setPublicMessage($publicMessage);
        $this->setSeverity($severity);

        parent::__construct($message, $code, $previous);
    }

    /**
     * Getter publicMessage.
     *
     * @return {String} Public message.
     */
    public function getPublicMessage()
    {
        return $this->publicMessage;
    }

    /**
     * Setter publicMessage.
     *
     * @param {String} $publicMessage : Item publicMessage.
     *
     * @return null
     */
    public function setPublicMessage($publicMessage = '')
    {
        $this->publicMessage = $publicMessage;
    }

        /**
     * Getter severity.
     *
     * @return {String} Return severity.
     */
    public function getSeverity()
    {
        return $this->severity;
    }

    /**
     * Setter severity.
     *
     * @param {String} $severity : Exception severity.
     *
     * @return null
     */
    public function setSeverity($severity = self::SEVERITY_ERROR)
    {
        $severity = strtolower($severity);

        if ($severity !== self::SEVERITY_ERROR && $severity !== self::SEVERITY_WARNING && $severity !== self::SEVERITY_INFO) {
            $severity = self::SEVERITY_ERROR;
        }

        $this->severity = $severity;
    }
} // End Class Exception
