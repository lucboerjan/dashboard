<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App;
use Auth;
use App\Http\Controllers\TaalController;
use App\Models\Spelers;
use App\Models\Spelmain;
use App\Models\Speldetail;
use App\Models\Spelronde;

class PuntentellingController extends Controller
{
     /**
     * constructor
     */
    public function __construct()
    {
        $this->_oSpeler = new Spelers();
        $this->_oSpelmain = new Spelmain();
        $this->_oSpeldetail = new Speldetail();
        $this->_oSpelronde = new Spelronde();
    }

    /**
     * controle op aangemeld
     * toont weergave homepage (indien aangemeld en taal)
     */
    public function Puntentelling()
    {
        // zet taal interface
        TaalController::taal();
        // redirect naar login indien niet aangemeld
        if (!Auth::check())
            return redirect('login');

        // anders toon pagina
        return view('pagina.puntentelling.index');
    }

    public function jxSpelInfoMainOverzicht(Request $request) {
        $json = ['succes' => false];

        try {
            $json['spelmain'] = $this->_oSpelmain->spelInfoMainOverzicht();
            $json['succes'] = true;
        } catch (\Exception $ex) {
            //throw $th;
        }

        return response()->json($json);
    }

    public function jxGetSpelInfo(Request $request) {
        $spelID = intval($request->spelID);
        $mode = $request->mode;


        $json = ['succes' => false];
        $json['spelID'] = $spelID;
        $json['mode'] = $mode;

        $labels = [];
        foreach(explode(',', __('boodschappen.spelmainBewerk')) as $item) {
            $tmp = explode(':', $item);
            $labels[$tmp[0]] = $tmp[1];
    
        }
        $json['labels'] = $labels;

        if ($mode == 'nieuw') {
            $rslt = $this->_oSpelmain->voegSpelToe();
            $json['spelmainInfo']['spelID'] = $rslt[0];
            $json['spelmainInfo']['datum'] = $rslt[1];
            $json['spelmainInfo']['omschrijving'] = '';
            $json['spelmainInfo']['aantalspelers'] = 0;
            $spelID = $rslt[0];
            
        }   
        else {
            $json['spelmainInfo'] = $this->_oSpelmain->spelmainInfo($spelID);
        }


        $json['spelRondes'] = $this->_oSpelronde->spelRondes($spelID);
        $json['spelScores'] = $this->_oSpelronde->spelScore($spelID);
        $json['spelersPerSpel'] = $this->_oSpeldetail->spelersPerSpel($spelID);
        $json['spelInfo'] = $this->_oSpelronde->spelInfo($spelID); 
        $json['spelers'] = $this->_oSpeler->spelersLijst($spelID); 
        $json['succes'] = true;
  
        return response()->json($json);
    }
    
    public function jxBewerkspelronde(Request $request) {

        $spelID = intval($request->spelID);
        $spelrondeSpelID = intval($request->spelrondeSpelID);
        $mode = $request->mode;

        $json = ['succes' => false];

        // vertalingen
        $labels = [];
        
        foreach(explode(',', __('boodschappen.spelrondeBewerk')) as $item) {
            $tmp = explode(':', $item);
            $labels[$tmp[0]] = $tmp[1];
           
        }

        $json['labels'] = $labels;

        $json['spelID'] = $spelID;
        $json['spelrondespelID'] = $spelrondeSpelID;
        $json['mode']= $mode;
        $json['test']= $mode;
        
        // try {
            $json['spelrondes'] = $this->_oSpelronde->bewerkSpelronde($spelID, $spelrondeSpelID);
            $json['succes'] = true;
        // } catch (\Exception $ex) {

        // }

        
        return response()->json($json);
    }


    public function jxBewerkBewaarSpelronde(Request $request) {
        $json = ['succes' => false];

        $spelrondeID = $request->spelrondeID;
        $spelerID = $request->spelerID;
        $score = $request->score;

        $json['spelrondeID'] = $spelrondeID;
        $json['spelerID'] = $spelerID;
        $json['score'] = $score;

        try {
            $json['sql'] = $this->_oSpelronde->bewaarSpelronde($spelrondeID, $spelerID, $score);
            $json = ['succes' => true];
        } catch (\Exception $ex) {

        }


        return response()->json($json);

    }


    public function jxBewerkVerwijderSpelronde(Request $request) {

        $json = ['succes' => false];

        $spelID = $request->spelID;
        $spelrondespelID = $request->spelrondespelID;
        
        $json['spelrondespelID'] = $spelrondespelID;

        try {
            $this->_oSpelronde->verwijderSpelrondespel($spelID, $spelrondespelID);
            $json = ['succes' => true];
            
        }
        catch (Exception $ex) {

        }

        return response()->json($json);
    }

    public function jxSelecteerSpeler(Request $request) {
        $spelerID = $request->spelerID;
        $spelID = $request -> spelID;

        $json = ['succes' => true];
        $json['volgorde'] = $this->_oSpeldetail->voegSpelerToeAanSpel($spelID, $spelerID);
        $json['spelerID'] =  $spelerID;
        $json['spelID'] =  $spelID;

        return response()->json($json);
    }

    public function jxDeselecteerSpeler(Request $request) {
        $spelerID = $request->spelerID;
        $spelID = $request -> spelID;

        $json = ['succes' => true];
        $this->_oSpeldetail->verwijderSpelerVanSpel($spelID, $spelerID);
        $json['spelerID'] =  $spelerID;
        $json['spelID'] =  $spelID;

        return response()->json($json);
    }


    public function jxSpelmainBewaar(Request $request) {
        $spelID = $request->spelID;
        $mode = $request->mode;
        $json = ['succes' => true];
        $json['mode'] = $mode;
        $json['spelID'] = $spelID;

        if ($mode == 'verwijder') {
            $rslt = $this->_oSpelmain->spelmainVerwijder($spelID);
            $json['succes'] = true;
            return response()->json($json);
        }


        $datum = $request->datum;
        $omschrijving = $request->omschrijving;
        $aantalSpelers = $request->aantalspelers;

        $this->_oSpelmain->spelmainbewaar($spelID, $datum, $omschrijving, $aantalSpelers);
        return response()->json($json);
    }

    public function jxVoegSpelerToe(Request $request) {
        $naam = $request->naam;
        $spelID = $request->spelID;
        $mode = $request->mode;

        $json = ['succes' => false];
        $json['naam'] = $naam;
        $json['spelID'] = $spelID;

       // try {
            $spelerID = $this->_oSpeler->voegSpelerToe($naam); 
            $json['spelerID'] = $spelerID;
            $json['succes'] = true;

      //  } catch (\Exception $ex) {
            
            
      //  }
        return response()->json($json);
    }
    
    // speloverzicht
    public function   speloverzicht() 
    {
        // zet taal interface
        TaalController::taal();
        // redirect naar login indien niet aangemeld
        if (!Auth::check())
            return redirect('login');

        // anders toon pagina
        return view('pagina.puntentelling.speloverzicht');
    }

    public function jxSpelOverzicht(Request $request) {
        $json = ['succes' => true];

        $json['spelscores'] = $this->_oSpelronde->spelScores();
        $json['spelinfo'] = $this->_oSpelmain->spelInfoMainOverzicht();

        return response()->json($json);
    }
}
