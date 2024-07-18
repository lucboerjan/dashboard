<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

//begin toevoegen
use Auth;
use Carbon\Carbon;
use App\Http\Middleware\Instelling;
use App\Models\Zonnepanelen;
//einde toevoegen
class ZonnepanelenController extends Controller
{
    /**
     * constructor
     */
    public function __construct() {
        $this->_oZonnepanelen = new Zonnepanelen();
    }

    /**
     * controle op aangemeld
     * toont weergave homepage (indien aangemeld en taal)
     */
    public function index() {
        // redirect naar login indien niet aangemeld
        if (!Auth::check()) return redirect('login');

        // anders toon pagina
        return view('pagina.zonnepanelen.index');
    }


    /**
     * public function jxZonnepanelenLijst($request)
     * haalt lijst met tellerstanden op (paginering)
     * @param $request formulierdata: pagina
     * @return json
     */
    public function jxZonnepanelenLijst(Request $request) {
        $json = ['succes' => false];
        $pagina = $request->pagina;
        $aantaPerPagina = Instelling::get('paginering')['aantaltellerstandenzonnepanelenperpagina'];
        try {
            $dta = $this->_oZonnepanelen->lijst($pagina, $aantaPerPagina);
            $json['tellerstanden'] = $dta['tellerstanden'];
            $json['jaarOverzicht'] = $dta['jaarOverzicht'];
            $json['actuelestand'] = $dta['actuelestand'];
            $json['pagina'] = $pagina;
            $json['aantalpaginas'] = $dta['aantalpaginas'];
            $json['knoppen'] = Instelling::get('paginering')['knoppen'];
		    
            $json['succes'] = true;
        }
        catch(Exception $ex) {
        }
        return response()->json($json);
    }

    /**
     * public function jxtellerstandGet($request)
     * haalt gegevens van 1 record op
     * @param $request formulierdata: id, mode
     * @return json
     */
    public function jxtellerstandGet(Request $request) {
        $mode = $request->mode;
        $json = [
            'succes' => false,
            'mode' => $mode
        ];
        $id = intval($request->id);
        if ($id == 0) {
            $oDatum = Carbon::today()->timezone('Europe/Brussels');
            $json['tellerstand'] = [
                'id' => 0,
                'datum' => $oDatum->format('Y-m-d'),

            ];
        }
        else {
            $json['tellerstand'] = $this->_oZonnepanelen->getTellerstand($id);
        }
        
        $json['succes'] = true;
        return response()->json($json);           

    }

    public function jxTellerstandZonnepanelenBewaar(Request $request) {
        $json = ['succes' => false];
        
        $tellerstandID = $request->tellerstandID;
        $datum = $request->datum;
        $tellerstand = $request->tellerstand;
        $mode = $request->mode;
        
        $json['mode'] = $mode;
        $json['datum'] = $datum;
        $json['tellerstand'] = $tellerstand;

        
       // try {
            if ($mode == 'verwijder') {
                $dta = $this->_oZonnepanelen->verwijderTellerstand($tellerstandID);
            }
            else {
                $dta = $this->_oZonnepanelen->setTellerstand($tellerstandID, $datum, $tellerstand);
                if ($mode == 'nieuw' && $dta['succes']) $json['tellerstandID'] = $dta['tellerstandID'];
            }

            $json['succes'] = $dta['succes'];
            $json['boodschap'] = $dta['boodschap'];
       //}
        // catch(Exception $ex) {

        // }

        return response()->json($json);
    }
}    

