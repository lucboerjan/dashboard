<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// TOEVOEGEN BEGIN
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
// TOEVOEGEN EINDE

class Zonnepanelen extends Model
{
    use HasFactory;
    protected $table = 'zonnepanelen';

   /**
     * 
     */
    public function lijst($pagina, $aantalPerPagina) {
        $dta = false;
        $maandOverzicht = [];
		$jaarOverzicht = [];

        $dbSql = sprintf('
            SELECT COUNT(1) AS aantal
            FROM zonnepanelen
        '); 
        
        $aantal = DB::SELECT($dbSql)[0]->aantal;
        $aantalPaginas = ceil($aantal / $aantalPerPagina);
        $dta['aantalpaginas'] = $aantalPaginas;

         // --- limit
         $aantalPaginas = ceil($aantal / $aantalPerPagina);
         if ($pagina > $aantalPaginas)
             $pagina = $aantalPaginas;
         $dbLimit = sprintf("LIMIT %s,%s", $pagina * $aantalPerPagina, $aantalPerPagina);

         $dbSql = sprintf('
         SELECT id, DATE_FORMAT(datum ,"%%d-%%m-%%Y") as sortedDate, tellerstand, ABS(LAG(tellerstand) OVER (ORDER BY tellerstand ASC) -tellerstand) as dagopbrengst
         FROM zonnepanelen
         ORDER BY tellerstand DESC %s
         ', $dbLimit);
        $tellerstanden = DB::select($dbSql);

        $dta['tellerstanden'] = $tellerstanden;

        //we hebben alle dagopbrengsten nodig om het YTD te berekenen
        $dbSql = sprintf('
        SELECT id, DATE_FORMAT(datum ,"%%d-%%m-%%Y") as sortedDate, tellerstand, ABS(LAG(tellerstand) OVER (ORDER BY tellerstand ASC) -tellerstand) as dagopbrengst
        FROM zonnepanelen
        ORDER BY tellerstand DESC
        ');
        $tellerstanden = DB::select($dbSql);
        //YTD voor elk kalenderjaar berekenen
        $dbSql = "
            SELECT year(datum) as jaar
            FROM zonnepanelen
            GROUP BY year(datum) ORDER BY datum DESC
        ";
        $jaren=DB::select($dbSql);
        $ytd=[];
        foreach($jaren as $jaar) {
            array_push($ytd,$jaar->jaar);
            $ytd[$jaar->jaar] = 0;
        }
       
        //YTD bijwerken
        $refmaand = date('m');
        $refdag = date('d');
          
        foreach($tellerstanden as $tellerstand=>$value) {
            $datum=$value->sortedDate;   
            $dagOpbrengst = $value->dagopbrengst;      
            $dd = intval(substr($datum, 0, 2));
            $mm = intval(substr($datum, 3, 2));
            $jj = intval(substr($datum, 6, 4));
            if ($mm == $refmaand ) {
				if ($dd<=$refdag) {
					$ytd[$jj] += $dagOpbrengst;
				}
			}
			if ($mm < $refmaand ) {
					$ytd[$jj] += $dagOpbrengst;
			} 
        }    
        
        //jaaroverzicht berekenen
        $dbSql = "SELECT month(datum) AS maand,
                    year(datum) AS jaar,
                    IFNULL((MAX(tellerstand)-LAG(MAX(tellerstand)) OVER (ORDER BY datum)),0) AS maandObrengst
                    FROM zonnepanelen
                    GROUP BY year(datum), month(datum) 
                    ORDER BY datum DESC";

        $jaarLijst = DB::select($dbSql);

        foreach($jaarLijst as $maandRecord=>$value) {
          
             $jaar = $value->jaar;
			 $maand = $value->maand;
			 $waarde = $value->maandObrengst;
             if (!in_array($jaar,$maandOverzicht)) {
				 $maandOverzicht['jaar'] = $jaar;
				 $maandOverzicht['jaarTotaal'] = 0;
					
			 }
			$maandOverzicht[$maand] = $waarde;
           // $waarde = number_format($waarde,0);
            $maandOverzicht['jaarTotaal'] += $waarde;
			if ($maand==1) {
                $maandOverzicht['jaarTotaal'] = number_format($maandOverzicht['jaarTotaal'],0);
                $maandOverzicht['ytd'] = number_format($ytd[$jaar],0);
                array_push($jaarOverzicht,$maandOverzicht);
                $maandOverzicht = [];
                
            }
			if ($maand==5 && $jaar==2011) {
				$maandOverzicht[1] = null;
				$maandOverzicht[2] = null;
				$maandOverzicht[3] = null;
				$maandOverzicht[4] = null;
                $maandOverzicht['jaarTotaal'] = number_format($maandOverzicht['jaarTotaal'],0);
                $maandOverzicht['ytd'] = number_format($ytd[$jaar],0);
				array_push($jaarOverzicht,$maandOverzicht);
                $maandOverzicht = [];
			}
        } 

                

        $jaarLijst = DB::select($dbSql);
        $dta['jaarOverzicht'] = $jaarOverzicht;
    
    
        //laatste stand ophalen
        $dbSql = "SELECT MAX(tellerstand) AS actuelestand
                  FROM zonnepanelen";
        $dta['actuelestand'] = DB::select($dbSql)[0]->actuelestand;
        return $dta;
    }


    public function getTellerstand($id) {
        return DB::select(sprintf("
            SELECT id, datum, tellerstand
            FROM zonnepanelen
            WHERE id=%d
            ", $id))[0];
    }        

   /**
     * 
     */
    public function verwijderTellerstand($tellerstandID) {
        $dta = ['succes' => false, 'boodschap' => ''];

        Zonnepanelen::where('id', '=', $tellerstandID)->delete();
        $dta['succes'] = true;
        return $dta;
    }

        /**
     * 
     */
    public function setTellerstand($tellerstandID, $datum, $tellerstand) {
        //controle of de opgegeven tellerstand kan geaccepteerd worden

        $dta = ['succes' => false, 'boodschap' => ''];
        
        $prevValue =  DB::select(sprintf("SELECT tellerstand FROM zonnepanelen WHERE datum < '%s' ORDER BY datum DESC LIMIT 1",$datum ));

        if ($prevValue[0]->tellerstand >= $tellerstand) {
            $dta['boodschap'] = 'De opgeven tellerstand kan niet geaccepteerd worden';

        }

        elseif ($tellerstandID == 0) {
            if (count(DB::select(sprintf('SELECT 1 FROM zonnepanelen WHERE datum="%s"', $datum))) == 0) {

                $record = new Zonnepanelen();
                $record->datum = $datum;
                $record->tellerstand = $tellerstand;
                $record->save();
                $dta['tellerstandID'] = $record->id;
                $dta['succes'] = true;
            
            }
                else {
                    $dta['boodschap'] = 'Er bestaat reeds een record voor de gekozen datum';
                }    
        }    
        else {
                $record = Zonnepanelen::find($tellerstandID);
                $record->datum = $datum;
                $record->tellerstand = $tellerstand;
                $record->update();   
                $dta['succes'] = true; 
                $dta['boodschap'] = 'Record werd succesvol toegevoegd of bijgewerkt.';
            }
 
        return $dta;
    }
}

