<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Instelling
{
    // bevat inhoud instellingen (json)
    private $_instellingen = [];
    // bevat verwijzing naar zichzelf (object)
    private static $_dit = null;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }


    // klassieke methoden --
    // constructor, private zodat geen instatie van buitenaf aangemaakt kan worden
    private function __construct() {
        // inlezen configuratiebestand instelling.json
        try {
            $this->_instellingen = json_decode(file_get_contents(sprintf('%s/%s', storage_path(), 'instelling.json')), true);
        } catch (\Exception $ex) {

        }
    }

    /**
     * ophalen waarde instelling
     * private function get()
     * @param $instellingID string
     * @return string
     */
    private function _get($instellingID) {
        $instellingID = strtolower(trim($instellingID));
        if (isset($this->_instellingen[$instellingID]))
            return $this->_instellingen[$instellingID];
        else
            return '';    
    }

    /**
     * ophalen waarde instelling
     * private function _set()
     * @param $instellingID string
     * @param $waarde string|getal|boolean
     * @return void
     */
    private function _set($instellingID, $waarde) {
        $instellingID = strtolower(trim($instellingID));

        // sleutel kan niet leeg zijn
        if (empty($instellingID)) return;

        // toekennen waarde + wegschrijven
        try {
            $this->_instellingen[$instellingID] = $waarde;

            file_put_contents(sprintf('%s/%s', storage_path(), 'instelling.json'), json_encode($this->_instellingen));
        } catch(\Exception $ex) {

        }
    }

 /**
     * verwijderen instelling + wegschrijven
     * private function _del()
     * @param $instellingID string
     * @return void
     */
    private function _del($instellingID) {
        $instellingID = strtolower(trim($instellingID));

        // verwijderen waarde + wegschrijven
        try {
            unset($this->_instellingen[$instellingID]);

            file_put_contents(sprintf('%s/%s', storage_path(), 'instelling.json'), json_encode($this->_instellingen));
        } catch(\Exception $ex) {

        }

    }

    // -- statische methoden
    /**
     *  ophalen waarde van instelling
     *  public static function get()

     */
    public static function get($instellingID='') {
        // controleer of eigenschap $_dit een instantie bevat van klasse
        // indien niet, maak instantie klasse aan en ken toe aan eigenschap $_dit
        if (!(self::$_dit instanceof self)) {
            self::$_dit = new self();
        }

        // ophalen en terugsturen waarde bij $instellingID
        return self::$_dit->_get($instellingID);
    }

     /**
     *  toekennen waarde van instelling + wegschrijven naar instelling.json
     *  public static function set()
     * @param $instellingID string
     * @param $waarde string|getal|boolean
     * @return string
     */
    public static function set($instellingID='', $waarde='') {
        // controleer of eigenschap $_dit een instantie bevat van klasse
        // indien niet, maak instantie klasse aan en ken toe aan eigenschap $_dit
        if (!(self::$_dit instanceof self)) {
            self::$_dit = new self();
        }

        // toekennen en wegschrijvenen waarde voor instelling
        return self::$_dit->_set($instellingID, $waarde);
    }

      /**
     *  verwijderen instelling + wegschrijven naar instelling.json
     *  public static function del()
     * @param $instellingID string
     * @return string
     */
    public static function del($instellingID='') {
        // controleer of eigenschap $_dit een instantie bevat van klasse
        // indien niet, maak instantie klasse aan en ken toe aan eigenschap $_dit
        if (!(self::$_dit instanceof self)) {
            self::$_dit = new self();
        }

        // verwijderen + wegschrijvenen instelling
        return self::$_dit->_del($instellingID);
    }
}
