<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App;
use Auth;
use App\Http\Controllers\TaalController;
use App\Models\Internetlinks;
use App\Models\InternetGroups;

class InternetlinksController extends Controller
{
        /**
     * constructor
     */
    public function __construct()
    {
        $this->_oInternetLinks = new Internetlinks();
        $this->_oInternetGroups = new InternetGroups();
    }

    /**
     * controle op aangemeld
     * toont weergave homepage (indien aangemeld en taal)
     */
    public function Internetlinks()
    {
        // zet taal interface
        TaalController::taal();
        // redirect naar login indien niet aangemeld
        if (!Auth::check())
            return redirect('login');

        // anders toon pagina
        return view('pagina.internetlinks.index');
    }

    public function jxInternetGroepen(Request $request) {
        $json = ['succes' => false];

        try {
            $json['internetgroepen'] = $this->_oInternetGroups->groepenLijst();
            $json['succes'] = true;
        } catch (\Rxception $er) {
            //throw $th;
        }
       
        return response()->json($json);           


    }

    public function jxGetInternetLinks(Request $request) {
        $groepID = $request->groepID;
        $json = ['succes' => false];
        try {
            $json['internetlinks'] = $this->_oInternetLinks->InternetlinksLijst($groepID);
            $json['succes'] = true;
        } catch (\Exception $ex) {
            //throw $th;
        }

        return response()->json($json);           


    }
    public function jxGetInternetLink(Request $request) {
        $id = $request->id;
        $groepID = $request->groepid;
        $mode = $request->mode;
        $json = ['succes' => false];
        $json['mode'] = $mode;
        $json['id'] = $request->id;

        if ($id == 0 ) {
            $json['groepID'] = $groepID;
            $json['url'] = '';
            $json['omschrijving'] = '';
            $json['volgorde'] = 0;
            $json['succes'] = true;
    
        }
        else {
            $rslt = $this->_oInternetLinks->getInternetlink($id);
            $json['groepID'] = $rslt->groepID;
            $json['url'] = $rslt->url;
            $json['omschrijving'] = $rslt->omschrijving;
            $json['volgorde'] =  $rslt->volgorde;
            $json['succes'] = true;
        }


        return response()->json($json);           
    }

    public function jxBewaarInternetLink(Request $request ) {
        $id = $request->id;
        $groepID = $request->groepID;
        $omschrijving = $request->omschrijving;
        $url = $request->url;

        $json = ['succes' => true];
        $json['id'] = $id;
        $json['groepid'] = $groepID;
        $json['url'] = $url;
        $json['omschrijving'] = $omschrijving;        

        $rslt = $this->_oInternetLinks->bewaarInternetLink($id, $groepID, $url, $omschrijving);
        if ($id == 0) $json['id'] = $rslt['id'];
        $json['succes'] = $rslt['succes'];

        return response()->json($json);  
    }

    public function jxBewaarInternetGroep(Request $request) {
        $groepID = $request->groepID;
        $omschrijving = $request->omschrijving;
        
        $json = ['succes' => true];
        $json['groepID'] = $groepID;
        $json['omschrijving'] = $omschrijving;        

        $rslt = $this->_oInternetGroups->bewaarInternetGroep($groepID, $omschrijving);

        return response()->json($json);  

    }

    public function jxVerwijderInternetLink(Request $request) {
        $id = $request->id;
        
        $json = ['succes' => true];
        $json['id'] = $id;

       $rslt = $this->_oInternetLinks->VerwijderInternetLink($id);

        return response()->json($json);  

    }
}
