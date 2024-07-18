<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use App\Http\Middleware\Instelling;
use App\Models\Tvvertoning;
use App\Models\Tvzender;
use App\Models\Imdbrating;

class TvvertoningenController extends Controller
{

    /**
     * constructor
     */
    public function __construct() {
        $this->_oTvvertoning = new Tvvertoning();
        $this->_oTvzender = new Tvzender();
        $this->_oImdbrating = new Imdbrating();
    }

     /**
     * public function jxImdbRatingBoodschappen()
     * haalt boodschappen op mbt verwijderen van persoon
     * @return string (csv)
     */
    public function jxImdbRatingBoodschappen(Request $request) {
        $json = [
            'bewaar' => trans('boodschappen.imdbrating_boodschappen_bewaar'),
            'acties' => trans('boodschappen.imdbrating_boodschappen_acties'),
            'verwijder' => trans('boodschappen.imdbrating_boodschappen_verwijder'),
            'succes' => true
        ];

        return response()->json($json);
    }

    public function index()
    {
        // zet taal interface
        TaalController::taal();
        // redirect naar login indien niet aangemeld
        if (!Auth::check())
            return redirect('login');

        // anders toon pagina
        return view('pagina.tvvertoningen.index');
    }

    public Function jxVertoningenOverzicht(Request $request) {
        $pagina = $request->pagina;
        $datum = $request->datum;
        $aantalVertoningenPerPagina = Instelling::get('paginering')['aantalvertoningenperpagina'];

        $where = sprintf('datum = "%s"', $datum);

        $json = ['succes' => false];
        $json['pagina'] = $pagina;
        $json['aantalvertoningenperpagina'] = $aantalVertoningenPerPagina;
        $rslt =  $this->_oTvvertoning->vertoningenOverzicht($pagina, $aantalVertoningenPerPagina, $datum, $where);
        $json['knoppen'] = Instelling::get('paginering')['knoppen'];
        $json['aantal'] = $rslt['aantal'];
        $json['sql_aantal'] = $rslt['sql_aantal'];
        $json['aantalpaginas'] = $rslt['aantalPaginas'];
        $json['vertoningen'] = $rslt['vertoningen'];
        $json['filmlijst'] = $rslt['filmlijst'];
        $json['tvzenders'] = $this->_oTvzender->tvZenders();
        $json['imdbratings'] = $this->_oImdbrating->imdbratings();

        // vertalingen
        $labels = [];
        
        foreach(explode(',', __('boodschappen.vertoningBewerk')) as $item) {
            $tmp = explode(':', $item);
            $labels[$tmp[0]] = $tmp[1];
                   
        }
        
        $json['labels'] = $labels;


        return response()->json($json);

    }

    public function jxBewaarVertoning(Request $request) {
        $json = ['succes' => false];

        $id = $request->id;
        $zender = $request->tvzender;
        $titel = $request->titel;
        $filmjaar = $request->filmjaar;
        $imdbid = $request->imdbid;
        $imdburl = $request->imdburl;
        $imdbrating = $request->imdbrating;
        $datum = $request->datum;

        //zenderid ophalen
        $zenderid = $this->_oTvzender->getZenderID($zender);
        $json['zenderid'] = $zenderid;

        //imdb record aanmaken indien nog niet bestaat
        if ($imdbid == 0 OR empty($imdbid) ) {
            $rslt = $this->_oImdbrating->setImdbRecord($titel, $filmjaar, $imdburl, $imdbrating);

            $json['imdbratingID'] = $rslt['imdbratingID'] ;
            $json['filmtitel'] = $rslt['filmtitel'] ;
            $json['filmjaar'] = $rslt['filmjaar'];
            $json['imdburl'] = $rslt['imdburl'];
            $json['imdbrating'] = $rslt['imdbrating'];
            $imdbid = $rslt['imdbratingID'] ;


        }

        //tvvertoning opslaan
        $rslt = $this->_oTvvertoning->setVertoning($id, $datum, $zenderid,$titel, $filmjaar, $imdbid );
        $json['succes'] = $rslt['succes'];

        return response()->json($json);
    }

    public function jxGetVertoning(Request $request) {
        $id = $request->vertoningID;
        $json = ['succes' => false];
        $json['id'] = $id;

        try {
            // $rslt = $this->_oTvvertoning->getVertoning($id);
            // $json['titel'] = $rslt['titel'];
            // $json['datum'] = $rslt['datumvertoning'];

            // $json['succes'] = true;
        } catch (\Exception $ex) {
            //throw $th;
        }

        $json['info']  = $this->_oTvvertoning->getVertoning($id);
      
        // $json['titel'] = $rslt['titel'];
        // $json['datum'] = $rslt['datumvertoning'];

        $json['succes'] = true;

        return response()->json($json);
    }



    //IMDBRATINGS
    public function jxImdbRatingOverzicht(Request $request) {
        $json = ['succes' => false];
        $pagina = $request->pagina;
        $json['knoppen'] = Instelling::get('paginering')['knoppen'];
       
        $aantalImdbRatingsPerPagina = Instelling::get('paginering')['aantalimdbratingsperpagina'];
        $json['pagina'] = $pagina;

        $rslt = $this->_oImdbrating->imdbOverzicht($pagina, $aantalImdbRatingsPerPagina);

        $json['aantal'] = $rslt['aantal'];       
        $json['aantalpaginas'] = $rslt['aantalPaginas'];
        $json['imdboverzicht'] = $rslt['imdboverzicht'];
 
        $json['succes'] = $rslt['succes'];
       


        return response()->json($json);
        
    }

    public function jxGetImdbRating(Request $request) {
        $id=$request->id;
        $mode = $request->mode;
        $json = ['succes' => false];
        $json['mode'] = $mode;

        try {
            $json['imdbrating'] = $this->_oTvvertoning->getImdbRating($id, $mode);
            $json['succes'] = true;
        } catch (\Exception $ex) {
            
        }


        return response()->json($json);
    }

    public function jxGetImdbRatingInfo(Request $request) {
        $imdbratingID = $request->imdbratingID;
        $json = ['succes' => false];
        $json['imdbratingID'] = $imdbratingID;

        $json['vertoningen'] = $this->_oTvvertoning->lijstVertoningenOpimdbratingID($imdbratingID);

        
 
        return response()->json($json);
    }


     public function jxVerwijderImdbRatingRecord(Request $request) {
        $imdbratingID = $request->imdbratingID;
        $json = ['succes' => false];
        $json['imdbratingID'] = $imdbratingID;

        try {
            $this->_oTvvertoning->verwijderImdbRating($imdbratingID);
            $json['succes'] = true;
        } catch (\Exception $ex) {
            
        }
        return response()->json($json);
        
     }
     public function jxZoekVertoningen(Request $request) {
        $pagina = $request->pagina;
        $aantalVertoningenPerPagina = Instelling::get('paginering')['aantalvertoningenperpagina'];
        $filmtitel = $request->filmtitel;
        $datum = "2014-01-23";

        $where = sprintf('t.titel LIKE "%%%s%%"', $filmtitel);

        $rslt =  $this->_oTvvertoning->vertoningenOverzicht($pagina, $aantalVertoningenPerPagina, $datum, $where);

        $json = ['succes' => false];
        $json['pagina'] = $pagina;
        $json['zoekwaarde'] = $filmtitel;
        $json['vertoningen'] = $rslt['vertoningen'];
        //$json['sql_vertoningen'] = $rslt['sql_vertoningen'];
       
        $json['knoppen'] = Instelling::get('paginering')['knoppen'];
        $json['aantal'] = $rslt['aantal'];
        //$json['sql_aantal'] = $rslt['sql_aantal'];
        $json['aantalpaginas'] = $rslt['aantalPaginas'];
        //$json['vertoningen'] = $rslt['vertoningen'];
        //$json['filmlijst'] = $rslt['filmlijst'];
        //$json['tvzenders'] = $this->_oTvzender->tvZenders();
       // $json['imdbratings'] = $this->_oImdbrating->imdbratings();


        return response()->json($json);

     }

     public function jxImdbRatingZoek(Request $request) {
        $json = ['succes' => false];
        $titel2find = $request->titel2find;

        $json['titel2find'] = $titel2find;
        try {
            $json['imdboverzicht'] = $this->_oTvvertoning->zoekImdbRecord($titel2find);
            $json['succes'] = true;
        } catch (\Exceprion $ex) {
            
        }

        return response()->json($json);

     }

     public function jxBewaarImdbRatingRecord(Request $request) {
        $json = ['succes' => false];
        $id = $request->imdbratingid;
        $titel = $request->imdbratingtitel;
        $jaar = $request->imdbratingjaar;
        $rating = $request->imdbratingrating;
        $url = $request->imdbratingurl;
        $json['id'] = $id;
        $json['titel'] = $titel;
        $json['jaar'] = $jaar;
        $json['rating'] = $rating;
        $json['url'] = $url;
        try {
            $this->_oImdbrating->bewaarImdbRecord($id,$titel,$jaar,$url,$rating);
            $json['succes'] = true;
        } catch (\Exceprion $ex) {
            
        }

        return response()->json($json);

     }

     public function jxVertoningVerwijder(Request $request) {

        $json = ['succes' => false];
        $id = $request->vertoningID;
        try {
            $this->_oTvvertoning->verwijderVertoning($id);
            $json['succes'] = true;
        } catch (\Exceprion $ex) {
            
        }

        return response()->json($json);

     }


     //FILMLIJST

     public function filmlijst() {
        TaalController::taal();

        if (!Auth::check()) {
            return redirect('login');
        }
        return view('pagina.tvvertoningen.filmlijst');
    }

     public function jxFilmlijst() {
        $json = ['succes' => false];
        $limit=0;

        try {
            $json['filmlijst'] = $this->_oTvvertoning->lijstFilms($limit);
            
          
            $json['succes'] = true;
        }
        catch(Exception $ex) {

        }

        return response()->json($json);
    }
}
