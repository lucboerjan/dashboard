<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;


use Auth;
use App\Http\Middleware\Instelling;

use App\Models\Rekening;
use App\Models\Transactie;
use App\Models\Categorie;
use App\Models\Statistiek;

class FinancieelController extends Controller
{
    public function __construct()
    {
        $this->_oRekening = new Rekening();
        $this->_oTransactie = new Transactie();
        $this->_oStatistiek = new Statistiek();
        $this->_oCategorie = new Categorie();
    }

        /**
     * public function jxTransactieBoodschappen()
     * haalt boodschappen op mbt verwijderen van persoon
     * @return string (csv)
     */
    public function jxTransactieBoodschappen(Request $request) {
        $json = [
            'bewaar' => trans('boodschappen.transacties_boodschappen_bewaar'),
            'acties' => trans('boodschappen.transacties_boodschappen_acties'),
            'verwijder' => trans('boodschappen.transacties_boodschappen_verwijder'),
            'succes' => true
        ];

        return response()->json($json);
    }

    /**
     * public function rekeningen()
     * staat in voor het weergeven van het overzicht van de rekeningen (na aanmelden)
     * @return financieel.rekeningen.php
     */
    public function rekeningOverzicht()
    {
        // redirect login indien niet aangemeld
        if (!Auth::check()) {
            return redirect('login');
        }

        $dta = [];
        $rslt = $this->_oRekening->lijst();
        $dta['rekeningOverzicht'] = $rslt['rekeningOverzicht'];
        $dta['totaalBedrag'] = $rslt['totaalBedrag'];
        $dta['saldoVerschil'] = $rslt['saldoVerschil'];

        return view('pagina.financieel.rekeningen')->with($dta);
    }


        /**
     * rekeningOverzichtSorteer(Request $request)
     * update volgnummer van rekeningen
     */
    public function rekeningOverzichtSorteer(Request $request) {
        $json = ['succes' => false];
        $lijst = $request->lijst;
        $this->_oRekening->rekeningOverzichtSorteer($lijst);
        $json['lijst'] = $lijst;
        
        $json['succes'] = true;


        return response()->json($json);
    }

    public function transactieOverzicht($rekeningID=null)
    {
        // redirect login indien niet aangemeld
        if (!Auth::check()) {
            return redirect('login');
        }
        $dta = ['rekeningID' => $rekeningID];

        return view('pagina.financieel.transacties')->with($dta);

    }
    public function transactiejaaroverzicht()
    {
        // redirect login indien niet aangemeld
        if (!Auth::check()) {
            return redirect('login');
        }

        $dta = [''];
        $dta['jaren'] =  $this->_oTransactie->statistiekJaren();

        return view('pagina.financieel.transactiejaaroverzicht')->with($dta);

    }

    public function jxGetTransactie(Request $request) {
        $json = ['succes' => false];
        $id = $request->id;
        $mode = $request->mode;
        $json['id'] = $id;
        $json['mode'] = $mode;
        
        try {
            
            $rslt = $this->_oTransactie->getTransactie($id);

            $json['categorie'] = $rslt->omschrijving;
            $json['omschrijving'] = $rslt->detail;
            $json['bedrag'] = $rslt->bedrag;
            if ($mode=='dupliceer') {$json['datum'] = $this->_oTransactie->getLastDate()->datum;}
            else {$json['datum'] = $rslt->datum;}

            $json['succes'] = true;
        } catch (\Exception $ex) {
            //throw $th;
        }
        return response()->json($json);

    }


    /**
     * public function jxLijstTransacties()
     * haalt de lijst met transacties op voor de betreffende rekening
     * @param $rekeningID
     * @param $pagina
     * @return array
     */

    public function jxLijstTransacties(Request $request) {
        $json = ['succes' => true];

        //

        $json['bewaar'] = trans('boodschappen.transacties_boodschappen_bewaar');
        $json['acties'] = trans('boodschappen.transacties_boodschappen_acties');
        $json['verwijder'] = trans('boodschappen.transacties_boodschappen_verwijder');
        $json['categorien']=$this->_oTransactie->getCategorien();

        $lijstofzoek=  $request->lijstofzoek;
        if ($lijstofzoek == 'lijst') {
            $rekeningID = $request->rekeningID;
            $json['rekeningID'] = $rekeningID;
            $json['rekeningsaldo']=$this->_oTransactie->rekeningSaldo($rekeningID);
            $json['rekeninginfo']=$this->_oTransactie->rekeningInfo($rekeningID);
            $rekeningID = $request->rekeningID;
            $dbWhere = sprintf('WHERE rekening_id=%d', $rekeningID);
        }
        else {
            $categorie = $request->categorie;
            $omschrijving = $request->omschrijving;
            $bedrag = $request->bedrag;

            $dbWhere = [];
            // categorie
            if ($categorie > 0)
                $dbWhere[] = sprintf("(c.omschrijving LIKE '%%%1\$s%%')", $categorie);
            //omschrijving
            if (!empty ($omschrijving))
                $dbWhere[] = sprintf("(t.omschrijving LIKE '%%%1\$s%%')", $omschrijving);
            //bedrag
            if (!empty ($bedrag))
                $dbWhere[] = sprintf("(bedrag LIKE '%%%1\$s%%')", $bedrag);
            $dbWhere = empty ($dbWhere) ? '' : "WHERE " . implode(' AND ', $dbWhere) ;  

        }

        $pagina = $request->pagina;
        $aantaltransactiesperpagina = Instelling::get('paginering')['aantaltransactiesperpagina'];
        
        $json['pagina'] = $pagina;
        
       // try {
            $json['succes'] = true;
            $dta = $this->_oTransactie->lijstTransacties($pagina,$aantaltransactiesperpagina,$dbWhere);
            $json['transacties']= $dta['transacties'];
            $json['aantal']= $dta['aantal'];
            $json['aantalpaginas']= $dta['aantalPaginas'];

            $json['aantaltransactiesperpagina']=$aantaltransactiesperpagina;
            $json['knoppen'] = Instelling::get('paginering')['knoppen'];

        // } catch (\Exception $ex) {
            
        // }


        return response()->json($json);


    }

    public function jxGetCategorien() {
        $json = ['succes' => true];
        $json['categorien']=$this->_oTransactie->getCategorien();


        return response()->json($json);

    }

    /**
     * public function jxTransactieBewaar()
     * bewaren transactie
     * @param id
     * @param categorie
     * @param omschrijving
     * @param bedrag
     * @return array
     */
    public function jxTransactieBewaar(Request $request) {
        $frmDta = $request->frmDta;
        $json = ['succes' => false];
        $id = $frmDta['id'];
        $categorie = $frmDta['categorie'];
        $datum = $frmDta['datum'];
        $omschrijving = $frmDta['omschrijving'];
        $bedrag = $frmDta['bedrag'];
        $rekening_id = $frmDta['rekening_id'];


        
        $categorie_id = $this->_oCategorie->getCategorieID($categorie)->id;
        $richting = $frmDta['richting'];


        $rslt = $this->_oTransactie->setTransactie($id, $datum, $categorie_id, $omschrijving, $bedrag, $rekening_id, $richting);

        $json['id'] = $rslt['id'];
        $json['rekeninginfo'] = $rslt['rekeninginfo'];
        $json['rekeningsaldo'] = $rslt['rekeningsaldo'];
        $json['datum'] = $datum;
        $json['categorie'] = $categorie;
        $json['omschrijving'] = $omschrijving;
        $json['bedrag'] = $bedrag;
        $json['categorie_id'] = $categorie_id;
        $json = ['succes' => true];


        return response()->json($json);


    }
    public function jxTransactieVerwijder(Request $request) {

        $frmDta = $request->frmDta;
        $json = ['succes' => false];
        $transactieID = $frmDta['transactieID'];

        try {
            $this->_oTransactie->verwijderTransactie($transactieID);
            $json['succes'] = true;
            $json['transactieID'] = $transactieID;
            
        } catch (\Exception $ex) {
            //throw $th;
        }


        return response()->json($json);
    }

    public function jxTransactiesZoeken(Request $request) {
        $json = ['succes' => false,
                 'pagina' => $request->pagina
        ];
        $frmDta = [
            'categorie' => $request->categorie,
            'omschrijving' => $request->omschrijving,
            'bedrag' => $request->bedrag
        ];

        $pagina=0;
        $aantaltransactiesperpagina = Instelling::get('paginering')['aantaltransactiesperpagina'];
                  // ---where criteria
                  $dbWhere = [];
                  // categorie
                  if ($frmDta['categorie'] > 0)
                      $dbWhere[] = sprintf("(c.omschrijving LIKE '%%%1\$s%%')", $frmDta['categorie']);
                  //omschrijving
                  if (!empty ($frmDta['omschrijving']))
                      $dbWhere[] = sprintf("(t.omschrijving LIKE '%%%1\$s%%')", $frmDta['omschrijving']);
                  //bedrag
                  if (!empty ($frmDta['bedrag']))
                      $dbWhere[] = sprintf("(bedrag LIKE '%%%1\$s%%')", $frmDta['bedrag']);
                  $dbWhere = empty ($dbWhere) ? '' : "WHERE " . implode(' AND ', $dbWhere) ;  
       
        //$rslt = $this->_oTransactie->zoekopdracht($frmDta,$pagina, $aantaPerPagina); $
        $rslt = $this->_oTransactie->lijstTransacties($pagina,$aantaltransactiesperpagina,$dbWhere);
           

        $json['aantal'] = $rslt['aantal'];
        $json['aantalpaginas'] = $rslt['aantalPaginas'];
        $json['aantaltransactiesperpagina'] = $aantaltransactiesperpagina;
        $json['knoppen'] = Instelling::get('paginering')['knoppen'];
        $json['transacties']= $rslt['transacties'];

        return response()->json($json);
    }

    //STATISTIEK
    
    public function statistiek()
    {
        
        // redirect login indien niet aangemeld
        if (!Auth::check()) {
            return redirect('login');
           
        }
    
        $dta = []; return view('pagina.financieel.statistiek')->with($dta);
    }
    public function samenvatting()
    {
        
        // redirect login indien niet aangemeld
        if (!Auth::check()) {
            return redirect('login');
           
        }
        $dta = []; 
        return view('pagina.financieel.samenvatting')->with($dta);
    }
    public function transactiebeheeromschrijvingen()
    {
        
        // redirect login indien niet aangemeld
        if (!Auth::check()) {
            return redirect('login');
           
        }
        $dta = []; 
        return view('pagina.financieel.transactiebeheeromschrijvingen')->with($dta);
    }

    public function jxLaadOverzicht() {
        $json = ['succes' => false];
        // try {
            $rslt = $this->_oStatistiek->laadOverzicht();
            $json['succes'] = true;
            $json['standen'] = $rslt['data'];
            $json['totaal'] = $rslt['totaal'];
            $json['periode'] = $rslt['periode'];
        // } catch (\Exception $Ex) {
        //     //throw $th;
        // }
        return response()->json($json);

    }

    public function standenHistoriek() {

        $this->_oRekening->standenBijwerken();

    }

    public function jxGetStatistiekParameters(Request $request) {
        $json = ['succes' => false];        


        try {
            $json['jaren'] = $this->_oTransactie->statistiekJaren();
            $json['categorieen'] = $this->_oTransactie->statistiekCategorieen();
            $json['succes'] = true;

        } 
        catch (Exception $ex) {
            
        }


        return response()->json($json);
    }

    public function jxStatistiekToon(Request $request) {
        $json = ['succes' => false];     
        $items = $request->items;
        $maanden = $request->maanden;
        $gemiddelde = $request->gemiddelde;
        $som = $request->som;
        $jaren = $request->jaren;
        $categorieen = $request->categorieen;
        $json['cijfers'] = $request->cijfers;
        $json['grafiek'] = $request->grafiek;   


        try {
            $json['rslt'] = $this->_oTransactie->statistiekToon($maanden, $items, $gemiddelde, $som, $jaren, $categorieen);

            $json['succes'] = true;

        } 
        catch (Exception $ex) {
            
        }


        return response()->json($json);
    }

    public function jxGetTransactieJaarOverzicht(Request $request) {
        $json = ['succes' => false];     
        $jaar = $request->jaar;

        $rslt = $this->_oTransactie->transactieJaarOverzicht($jaar, 'In');
        $json['inkomsten'] = $rslt;
        $rslt = $this->_oTransactie->transactieJaarOverzicht($jaar, 'Uit');
        $json['uitgaven'] = $rslt;
        $json['jaar'] = $jaar;
       
        $json['succes'] = true;     
        
       
        return response()->json($json); 
    }

    public function jxTransactieOmschrijvingenLijst(Request $request) {
        $richting = $request->richting;  
        $json = ['succes' => false];   
        $json = ['richting' => false];   
        

        try {
            $json['omschrijvingen'] = $this->_oTransactie->lijstOmschrijvingen($richting);
            $json['succes'] = true;
        }
        catch(Exception $ex) {

        }  
        
       
        return response()->json($json); 
    }


    public function jxTransactiOmschrijvingUpdate(Request $request) {
        $json = ['succes' => false];     
        $omschrijving = $request->omschrijving;
        $omschrijving2update = $request->omschrijving2update;
       

        try {
            $this->_oTransactie->updateTransactieOmschrijving($omschrijving, $omschrijving2update);
            $json['omschrijvingen'] = $this->_oTransactie->lijstOmschrijvingen();
            $json['succes'] = true;
        }
        catch(Exception $ex) {

        }  
        
        return response()->json($json); 
    }

    public function jxtransactieOmschrijvingenMergeLijst(Request $request) {
        $json = ['succes' => false];     
        $omschrijvingen = $request->omschrijvingen;
        $richting = $request->richting;

        $omschrijvingen = $this->_joinOmschrijvingen($omschrijvingen);

        try {
            $json['omschrijvingen'] = $this->_oTransactie->mergeLijstOmschrijvingen($omschrijvingen, $richting);
            $json['richting'] = $richting;
            $json['boodschap'] = __('boodschappen.transactieOmschrijving_dlgsamenvoegen');

            $json['succes'] = true;
        }
        catch(Exception $ex) {

        }  
        
        return response()->json($json); 
    }


    public function jxTransactiesOmschrijvingMergeUitvoeren(Request $request) {
        $json = ['succes' => false];     
        $omschrijvingen = $request->omschrijvingen;
        $omschrijvingen2change = $this->_joinOmschrijvingen($omschrijvingen);
        $omschrijving2keep = $request->omschrijving2keep;
        $richting = $request->richting;
        try {
            $json['omschrijvingen2change'] = $omschrijvingen2change;
            $json['omschrijving2keep'] = $omschrijving2keep;
            $json['omschrijvingen'] = $this->_oTransactie->lijstOmschrijvingen($richting);
            $json['succes'] = true;
        }
        catch(Exception $ex) {

        }  

        return response()->json($json); 

    }

    private function _joinOmschrijvingen($omschrijvingen) {
                // Convert the comma-separated string to an array
                $omschrijvingenArray = explode(',', $omschrijvingen);
                // Escape each item in the array to prevent SQL injection
                $escapedOmschrijvingen = array_map(function($item) {
                    return addslashes(trim($item));
                }, $omschrijvingenArray);
                // Join the escaped items into a comma-separated string, each item quoted
                
                return (implode('","', $escapedOmschrijvingen));
        
    }
}
