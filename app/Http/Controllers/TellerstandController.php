<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use App\Http\Middleware\Instelling;
use App\Models\Tellerstand;

class TellerstandController extends Controller
{
        /**
     * constructor
     */
    public function __construct() {
        $this->_oTellerstand = new Tellerstand();
    }

    public function tellerstandOverzicht($rekeningID=null)
    {
        // redirect login indien niet aangemeld
        if (!Auth::check()) {
            return redirect('login');
        }
        $dta = [];
        return view('pagina.tellerstand.index')->with($dta);

    }

    public function jxTellerstandOverzicht(Request $request) {
        $json = [
            'succes' => false,
            'mode' => $request->mode
        ];

       // try {
            $json['tellerstanden'] = $this->_oTellerstand->tellerstandOverzicht();
            $json['succes'] = true;
        //} catch (\Exception $ex) {
            
        //}
        return response()->json($json);           


    }

    public function jxTellerstandGet(Request $request) {
        $mode = $request->mode;
        $json = ['succes' => false,
                 'mode' => $mode  
                ];
        $id = $request->id;
        
        $labels = [];
        foreach (explode(',', __('boodschappen.tellerstandBewerk')) as $item) {
            
            $tmp = explode(':', $item);
            $labels[$tmp[0]] = $tmp[1];
        }
        $json['labels'] = $labels;

        if ($request->mode == 'nieuw') {
            $json['tellerstand'] = [
                'id' => 0,
                'datum' => '',
                'dag' => 0,
                'nacht' => 0,
                'dagteller_in' => 0,
                'dagteller_uit' => 0,
                'nachtteller_in' => 0,
                'nachtteller_uit' => 0,
                'zon' => 0,
                'water' => 0,
                'gas' => 0
            ];
        }
        else {
            $json['tellerstand'] = $this->_oTellerstand->getTellerstand($id);
        }
        $json['succes'] = true;
        return response()->json($json);           
    }

    public function jxTellerstandBewaar(Request $request) {

        $json = ['succes' => false];
        $mode = $request->mode;
        $id = $request->id;
        $json['mode'] = $mode;

        $datum = $request->datum;
        $dag = $request->dag;
        $nacht = $request->nacht;
        $dagteller_in = $request->dagteller_in;
        $dagteller_uit = $request->dagteller_uit;
        $nachtteller_in = $request->nachtteller_in;
        $nachtteller_uit = $request->nachtteller_uit;
        $zon = $request->zon;
        $water = $request->water;
        $gas = $request->gas;

        try {
            if ($mode == 'verwijder') {
                $dta = $this->_oTellerstand->verwijderTellerstand($id);
            }
            else {
                $dta = $this->_oTellerstand->tellerstandBewaar($id, $datum, $dag, $nacht, $dagteller_in, $nachtteller_in, $dagteller_uit, $nachtteller_uit, $zon, $water, $gas);
                
                $json['id'] = $dta['id'];
            }
            $json['succes'] = $dta['succes'];
        } catch (\Exception $ex) {
            
        }

        return response()->json($json);           
    }

    public function totaalOverzicht()
    {
        // redirect login indien niet aangemeld
        if (!Auth::check()) {
            return redirect('login');
        }
        $dta = [];
        return view('pagina.tellerstand.overzicht')->with($dta);

    }
}

