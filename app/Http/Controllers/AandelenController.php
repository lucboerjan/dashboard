<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;

//begin toevoegen
use App;
use Auth;
use Carbon\Carbon;
use App\Http\Middleware\Instelling;
use App\Http\Controllers\TaalController;
use App\Models\Aandelen;

//einde toevoegen

class AandelenController extends Controller
{
    /**
     * constructor
     */
    public function __construct()
    {
        $this->_oAandelen = new Aandelen();
    }

    /**
     * controle op aangemeld
     * toont weergave homepage (indien aangemeld en taal)
     */
    public function index()
    {
        // zet taal interface
        TaalController::taal();
        // redirect naar login indien niet aangemeld
        if (!Auth::check())
            return redirect('login');

        // anders toon pagina
        return view('pagina.aandelen.index');
    }


    public function jxFondsenLijst()
    {
        $json = ['succes' => false];

        try {
            $dta = $this->_oAandelen->fondsenLijst();
            $json['fondsenLijst'] = $dta['fondsenLijst'];
            $json['samenvatting'] = $dta['samenvatting'];
            //$json['aankopenLijst'] = $dta['aankopenLijst'];
            //$json['noteringenLijst'] = $dta['noteringenLijst'];
            $json['succes'] = true;
        } catch (Exception $ex) {
        }
        return response()->json($json);
    }

    /**
     * public function jxAandeelAankoopGet($request)
     * haalt info aankoop op
     * @param $request: form data
     * @return json
     */
    public function jxAandeelAankoopGet(Request $request)
    {
        $fondsID = $request->fondsID;
        $json = [
            'succes' => false,
            'mode' => $request->mode,
            'fondsID' => $fondsID
        ];

        // vertalingen
        $labels = [];
        //        dd (request()->session()->get('taal'));
        foreach (explode(',', __('boodschappen.aandeelAankoopBewerk')) as $item) {
            $tmp = explode(':', $item);
            $labels[$tmp[0]] = $tmp[1];
        }
        $json['labels'] = $labels;
        $json['geduld'] = __('boodschappen.geduld');
        $json['fout'] = __('boodschappen.fout');

        $json['fondsInfo'] = $this->_oAandelen->getFondsNaam($fondsID);
        $oDatum = Carbon::today()->timezone('Europe/Brussels');
        $id = intval($request->id);
        if ($id == 0) {
            $json['aankoop'] = [
                'id' => 0,
                'datum' => $oDatum->format('Y-m-d'),
                'aantal' => 0,
                'aankoopprijs' => 0
            ];
        } else {
            $json['aankoop'] = $this->_oAandelen->getAankoop($id);
        }

        $json['succes'] = true;

        return response()->json($json);
    }
/**
     * public function jxAankopenPerFonds($request)
     * haalt aankopen voor opgegeven fondsID op
     * @param $fondsID
     * @return json
     */
    public function jxAankopenPerFonds(Request $request) {
        $json = ['succes' => false];
        $fondsID = $request->fondsID;

        $json['fondsID'] = $fondsID;
        try {
            $json['aankopen'] = $this->_oAandelen->getAankopen($fondsID);
            $json['succes'] = true;
        } catch (Exception $ex) {
        }

        return response()->json($json);

    }
    
    /** public function jxDagkoersenPerFonds($request)
     * haalt aankopen voor opgegeven fondsID op
     * @param $fondsID
     * @return json
     */
    public function jxDagkoersenPerFonds(Request $request) {
        $json = ['succes' => false];
        $fondsID = $request->fondsID;

        $json['fondsID'] = $fondsID;
        try {
            $json['dagkoersen'] = $this->_oAandelen->getDagkoersen($fondsID);
            $json['succes'] = true;
        } catch (Exception $ex) {
        }

        return response()->json($json);

    }

    

    public function jxAandeelAankoopBewaar(Request $request)
    {
        $json = [
            'succes' => false,
        ];
        $mode = $request->mode;
        $json['mode'] = $mode;

        $id = $request->id;
        $fondsID = $request->fondsID;
        $datum = $request->datum;
        $aantal = $request->aantal;
        $koers = $request->koers;


        try {
            if ($mode == 'verwijder') {
                $dta = $this->_oAandelen->verwijderAankoop($id);
            } else {
                $dta = $this->_oAandelen->setAankoop($id, $datum, $aantal, $koers, $fondsID);
                if ($mode == 'nieuw' && $dta['succes'])
                    $json['id'] = $dta['id'];
            }
            $json['succes'] = $dta['succes'];
            $json['boodschap'] = $dta['boodschap'];
        } catch (Exception $ex) {

        }

        return response()->json($json);
    }

    /**
     * jxAandelenAankopen()
     * @return json
     */
    public function jxAandelenAankopen()
    {
        $json = [
            'succes' => true,
            'aandelenAankopen' => $this->_oAandelen->aandelenAankopen()
        ];

        return response()->json($json);
    }

    /**
     * jxAandelenNoteringen()
     * @return json
     */
    public function jxAandelenNoteringen()
    {
        $json = [
            'succes' => true,
            'aandelenNoteringen' => $this->_oAandelen->aandelenNoteringen()
        ];

        return response()->json($json);
    }


    public function jxAandeelNoteringGet(Request $request)
    {   $fondsID = $request->fondsID;
        $json = [
            'succes' => false,
            'mode' => $request->mode,
            'fondsID' => $fondsID
        ];

        // vertalingen
        $labels = [];
        //        dd (request()->session()->get('taal'));
        foreach (explode(',', __('boodschappen.aandeelNoteringBewerk')) as $item) {
            $tmp = explode(':', $item);
            $labels[$tmp[0]] = $tmp[1];
        }
        $json['labels'] = $labels;
        $json['geduld'] = __('boodschappen.geduld');
        $json['fout'] = __('boodschappen.fout');
        $json['fondsInfo'] = $this->_oAandelen->getFondsNaam($fondsID);
        $id = intval($request->id);
        if ($id == 0) {
            $oDatum = Carbon::today()->timezone('Europe/Brussels');
            $json['notering'] = [
                'id' => 0,
                'datum' => $oDatum->format('Y-m-d'),
                'dagkoers' => 0,
            ];
        } else {
            $json['notering'] = $this->_oAandelen->getNotering($id);
        }
        $json['succes'] = true;

        return response()->json($json);
    }

    public function jxAandeelNoteringBewaar(Request $request)
    {
        $json = [
            'succes' => false,
            'fondsID' => $request->fondsID,
            'gedupliceerd' => false
        ];
        $mode = $request->mode;
        $json['mode'] = $mode;

        $id = $request->id;
        $fondsID = $request->fondsID;
 
        $datum = $request->datum;
        $koers = $request->koers;
        $dupliceer_naar = 0;

        $optielijst = Instelling::get('aandelen_noteringen');        
        foreach ($optielijst as $row => $value) {

            if (intval($row) == intval($fondsID)) {
                    $dupliceer_naar = intval($value);
                }
            // foreach ($value as $rij => $waarde) {
            //     if (intval($waarde[0]) == intval($fondsID)) {
            //         $dupliceer_naar = $waarde[1];
            //     }
            // }
        }
        

        try {
            if ($mode == 'verwijder') {
                $dta = $this->_oAandelen->verwijderNotering($id, $fondsID, $datum, $dupliceer_naar);
            } else {
                $dta = $this->_oAandelen->setNotering($id, $datum, $koers, $fondsID, $dupliceer_naar);
                if ($mode == 'nieuw' && $dta['succes'])
                    $json['id'] = $dta['id'];
            }
            $json['succes'] = $dta['succes'];
            $json['boodschap'] = $dta['boodschap'];
            $json['gedupliceerd'] = $dta['gedupliceerd'];
            $json['dupliceerID'] = $dta['dupliceerID'];
           
        } catch (Exception $ex) {

        }

        return response()->json($json);
    }

    public function jxAandelenFondsen()
    {
        $json = [
            'succes' => true,
            'aandelenFondsen' => $this->_oAandelen->aandelenFondsen()
        ];

        return response()->json($json);
    }
}