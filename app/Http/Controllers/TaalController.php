<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

// -- toevoegen begin --
use App;
Use App\Http\Middleware\Instelling;
// -- toevoegen einde --

class TaalController extends Controller
{
    /**
     * public function zetTaal()
     * @param $Request array 
     * @param $taal string, default null
     * return void
     */
    public function zetTaal(Request $request, $taal=null) {
        // valideer $taal
        if ($taal) {
            $taal = strtolower(trim($taal));
            if (! array_key_exists($taal, Instelling::get('talen')))
                $taal = Instelling::get('taal');


        }
        else {
            $taal = Instelling::get('taal');
        }

        // zet taal
        $request->session()->put('taal', $taal);
        App::setLocale($taal);

        // terug naar vorige pagina met nieuwe taal
        return redirect()->back();

    }
/**
         * zet standaardtaal indien niet geselecteerd
         * public static function taal()
         * @return void
         */
    public static function taal() {
        if (!session()->has('taal')) {
            $taal = Instelling::get('taal');
            session()->put('taal', $taal);
            App::setLocale($taal);
        }
    }
}
