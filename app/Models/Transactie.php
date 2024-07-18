<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Http\Middleware\Instelling;


class Transactie extends Model
{
    use HasFactory;
    protected $table = 'transactie';

           /**
     * transactieOverzichtzOEK($rekeningID, *ZOEKtERM $pagina)
     * @param $rekeningID int
     * @param $zoekTerm string
     * @param $pagina int
     * @return lijst met transactie die de zoekTerm bevatten
     */

     
       /**
     * transactieOverzicht($rekeningID, $pagina)
     * @param $rekeningID int
     * @param $pagina int
     * @return lijst met transactie
     */

     public function transactieOverzicht($rekeningID, $pagina) {

        $aantal =  DB::select(sprintf("
            SELECT COUNT(1) AS aantal
            FROM transactie
            WHERE rekening_id = %d
        ", $rekeningID));
        $aantal = $aantal[0]->aantal;

        $aantalPerPagina = Instelling::get('paginering')['transacties_per_pagina'];
        $aantalPaginas = ceil($aantal / $aantalPerPagina);
        if ($pagina > $aantalPaginas) $pagina = $aantalPaginas;

       $transactiesSOM = DB::select(
            sprintf("
                SELECT SUM(bedrag)
                FROM (
                    SELECT t.bedrag
                    FROM transactie t
                    LEFT OUTER JOIN categorie c
                    ON t.categorie_id = c.id
                    WHERE t.rekening_id = %d
                    ORDER BY t.omzetnummer DESC
                    LIMIT %d, %d
                )
                AS totaal
            ", $rekeningID, $pagina*$aantalPerPagina)
        );
        $som = $transactiesSOM[0]->{'SUM(bedrag)'};

        $transactieOverzicht = DB::select(
            sprintf("
                SELECT t.id, DATE_FORMAT(t.datum, '%%d-%%m-%%Y') AS datum, t.bedrag, t.omschrijving as detail, t.categorie_id, c.omschrijving, t.omzetnummer
                FROM transactie t
                LEFT OUTER JOIN categorie c
                ON t.categorie_id = c.id
                WHERE t.rekening_id = %d
                ORDER BY t.datum DESC
                LIMIT %d, %d
            ", $rekeningID, $pagina * $aantalPerPagina, $aantalPerPagina)
        );

        return [
            'transactieOverzicht' => $transactieOverzicht,
            'transactieSom' => $som,
            'transactieOverzicht' => $transactieOverzicht,
            'pagina' => $pagina,
            'aantalPaginas' => $aantalPaginas
        ];
    }

    public function getTransactie($id) {

            // Sanitize the input
            $id = (int)$id;
        
            // Prepare the SQL query
            $dbSql = sprintf("
                SELECT t.id, t.datum, DATE_FORMAT(t.datum, '%%d-%%m-%%Y') AS displaydatum, t.bedrag, t.omschrijving as detail, t.categorie_id, c.omschrijving, t.omzetnummer
                FROM transactie t
                LEFT OUTER JOIN categorie c
                ON t.categorie_id = c.id
                WHERE t.id = %d        
            ", $id);
        
            // Execute the query
            $result = DB::select($dbSql);
        
            // Check if any result is returned
            if (count($result) > 0) {
                // Return the first row of the result
                return $result[0];
            } else {
                // Return null or handle the case where no result is found
                return null;
            }
        
        

    }

    public function getLastDate() {
        $dbSql=sprintf('
            SELECT datum
            FROM transactie
            ORDER BY datum DESC
            LIMIT 1
        ');
        return DB::select($dbSql)[0];
    }

    public function getCategorien() {
        $dbSql = sprintf('
            SELECT id, omschrijving, richting
            FROM categorie
            ORDER BY id

        ');

        return DB::select($dbSql);

    }

    public function getCategorieID($categorie) {
        $dbSql = sprintf('
        SELECT id
        FROM categorie
        WHERE omschrijving = "%s"

    ', $categorie);

    return DB::select($dbSql)[0]->id;

    }

     /**
     * public function lijstTransacties()
     * haalt de lijst met transacties op voor de betreffende rekening
     * @param $$pagina
     * @param $aantaltransactiesperpagina
     * @param $where (rekeningID)
     * @return array
     */

     public function lijstTransacties($pagina,$aantaltransactiesperpagina,$where) { 
        $tmp = $this->zoekLijstTransacties($tel = true, 1e6, 0, $aantaltransactiesperpagina, $where);
        $aantal = $tmp['aantal'];
        $aantalPaginas = $tmp['aantalPaginas'];
        
        $transactiesRslt = $this->zoekLijstTransacties($tel = false, $aantal, $pagina, $aantaltransactiesperpagina, $where);


        return [
            'aantal' =>$aantal,
            'aantalPaginas' => $aantalPaginas,
            'transacties' => $transactiesRslt
        ];
     }

     public function zoekLijstTransacties($tel = false, $aantal, $pagina, $aantaltransactiesperpagina, $dbWhere) {
        if ($tel) {
             //$dbSql = sprintf('SELECT COUNT(*) AS aantal FROM transactie WHERE %s', $where);

             $dbSql = sprintf('
                SELECT COUNT(*) AS aantal FROM transactie t 
                INNER JOIN categorie c ON t.categorie_id = c.id
                 %s', $dbWhere);
                 
            // print($dbSql); die();
             //empty($dbWhere) ? '' : "WHERE " . implode(' AND ', $dbWhere)
 
             $aantal = DB::SELECT($dbSql)[0]->aantal;
             $aantalPaginas = ceil($aantal / $aantaltransactiesperpagina);
 
             return [
                 'aantal' => $aantal,
                 'aantalPaginas' => $aantalPaginas,

             ];
         } else {
                     // order by 
                     $dbOrder = 'ORDER BY t.datum DESC';

                     // --- limit
                     $aantalPaginas = ceil($aantal / $aantaltransactiesperpagina);
                     if ($pagina > $aantalPaginas)
                         $pagina = $aantalPaginas;
                     $dbLimit = sprintf("LIMIT %s,%s", $pagina * $aantaltransactiesperpagina, $aantaltransactiesperpagina);
         
                     $dbSql = sprintf('
                     SELECT t.id, t.rekening_id, DATE_FORMAT(t.datum, "%%d-%%m-%%Y") AS weergavedatum, t.datum, t.omschrijving as detail, t.bedrag, t.categorie_id, c.omschrijving
                     FROM transactie t
                     INNER JOIN categorie c on c.id = t.categorie_id
                        %s
                        %s
                        %s', $dbWhere, $dbOrder, $dbLimit);
                    return DB::SELECT($dbSql);                 }
     }

          /**
     * public function rekeningSaldo()
     * haalt het saldo op voor de betreffende rekening
     * @param $rekeningID
     * @return array
     */

     public function rekeningSaldo($rekeningID) { 
        $dbSql = sprintf('
        SELECT ROUND(SUM(bedrag), 2) as saldo
        FROM transactie
        WHERE rekening_id=%d
    ', $rekeningID);
    
        $rekeningSaldo =  DB::select($dbSql)[0]->saldo;
        $rekeningSaldo = str_replace(',', '', $rekeningSaldo);
        $rekening = Rekening::find($rekeningID);
        $rekening->saldo = $rekeningSaldo == "0" ? 0 : $rekeningSaldo;
        $rekening->save();

        return $rekeningSaldo;
     }

              /**
     * public function rekeningInfo()
     * haalt de info op voor de betreffende rekening
     * @param $rekeningID
     * @return array
     */

     public function rekeningInfo($rekeningID) { 
        $dbSql = sprintf('
        SELECT referentie, omschrijving
        FROM rekening
        WHERE id=%d
    ', $rekeningID);
    return DB::select($dbSql);

     }

     public function setTransactie($id, $datum, $categorie_id, $omschrijving, $bedrag, $rekening_id, $richting) {
        if ($richting == 'Uit') {
            $bedrag = abs($bedrag) * -1;
        }

        if ($id == 0) {
            $transactie = new Transactie;
            $transactie->datum = $datum;
            $transactie->categorie_id = $categorie_id;
            $transactie->omschrijving = $omschrijving;
            $transactie->bedrag = $bedrag;
            $transactie->rekening_id = $rekening_id;
            $transactie->save();
            $dta['id'] = $transactie->id;
        }
        else {
            $transactie = Transactie::find($id);
            $transactie->datum = $datum;
            $transactie->categorie_id = $categorie_id;
            $transactie->omschrijving = $omschrijving;
            $transactie->bedrag = $bedrag;
            $transactie->rekening_id = $rekening_id;
            $transactie->update();     
            $dta['id'] = $id;       
        }

        //nieuw saldo bereken
        $dta['rekeninginfo'] = $this->rekeningInfo($rekening_id);
        $dta['rekeningsaldo'] = $this->rekeningSaldo($rekening_id);
        
        return $dta;
     }

     public function verwijderTransactie($transactieID) {
        $dbSql = sprintf('
            DELETE FROM transactie
            WHERE id=%d
        ', $transactieID);
        
        DB::select($dbSql);
     }


     public function zoekOpdracht($frmDta, $pagina, $aantaPerPagina)
     {

         // aantal items zoekenresultaat
         $tmp = $this->zoekTransacties($frmDta, $tel = true, 1e6, 0, $aantaPerPagina);
         $aantal = $tmp['aantal'];
         $aantalPaginas = $tmp['aantalPaginas'];
         $dbRslt = $this->zoekTransacties($frmDta, $tel = false, $aantal, $pagina, $aantaPerPagina);
 
         return [
             'aantal' => $aantal,
             'aantalPaginas' => $aantalPaginas,
             'dbRslt' => $dbRslt,
         ];
 
     }


     public function zoekTransacties($frmDta, $tel, $aantal, $pagina, $aantalPerPagina)
     {
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
 
         if ($tel) {
             $dbSql = sprintf("
             SELECT COUNT(1) AS aantal FROM transactie t 
             INNER JOIN categorie c on c.id=t.categorie_id
             %s", empty ($dbWhere) ? '' : "WHERE " . implode(' AND ', $dbWhere));

             $aantal = DB::SELECT($dbSql)[0]->aantal;
             $aantalPaginas = ceil($aantal / $aantalPerPagina);
 
             return [
                 'aantal' => $aantal,
                 'aantalPaginas' => $aantalPaginas,
             ];
         } else {
             // order by
             $dbOrder = 'ORDER BY datum DESC, t.id DESC';
 
             // --- limit
             $aantalPaginas = ceil($aantal / $aantalPerPagina);
             if ($pagina > $aantalPaginas)
                 $pagina = $aantalPaginas;
             $dbLimit = sprintf("LIMIT %s,%s", $pagina * $aantalPerPagina, $aantalPerPagina);
 
             $dbSql = sprintf('
             SELECT t.id, t.rekening_id, DATE_FORMAT(t.datum, "%%d-%%m-%%Y") AS weergavedatum, t.datum, t.omschrijving as detail, t.bedrag, t.categorie_id, c.omschrijving
             FROM transactie t
             INNER JOIN categorie c on c.id = t.categorie_id
                %s
                %s
                %s', empty ($dbWhere) ? '' : "WHERE " . implode(' AND ', $dbWhere), $dbOrder, $dbLimit);
            return DB::SELECT($dbSql);
 
         }
     }

     public function statistiekJaren() {
        $dbSql = sprintf('
            SELECT YEAR(datum) AS jaar
            FROM transactie
            GROUP BY jaar
             ORDER BY jaar DESC
        ');
        return DB::select($dbSql);
     }
 
     public function statistiekCategorieen() {
        $dbSql = '
            SELECT t.categorie_id, c.omschrijving 
            FROM transactie t
            INNER JOIN categorie c on t.categorie_id = c.id
           
            GROUP BY t.categorie_id, c.omschrijving
            ORDER BY c.omschrijving
        ';
        return DB::select($dbSql);
     }

     public function statistiekToon($maanden, $items, $gemiddelde, $som, $jaren, $categorieen) {
        
        $qryJaren = strlen($jaren) > 0 ? "YEAR(t.datum) IN ({$jaren})": '';
        $qryCategorieen = strlen($categorieen) > 0 ? "AND t.categorie_id IN ({$categorieen})": '';
        
        $groupBy = boolval($maanden) ? ', MONTH(t.datum)': '';

        $dbRslt = DB::select(
            sprintf("
                SELECT YEAR(t.datum) AS jaar,
                       MONTH(t.datum) AS maand,
                       c.omschrijving,
                       SUM(t.bedrag) AS bedrag
                FROM transactie t
                LEFT OUTER JOIN categorie c
                ON t.categorie_id = c.id       
                WHERE %s
                      %s    
                GROUP BY t.categorie_id, YEAR(t.datum) %s,  c.omschrijving   
                ORDER BY t.datum DESC      
            ", $qryJaren, $qryCategorieen, $groupBy)
        );
        return $dbRslt;
     }
 
     public function transactieJaarOverzicht($jaar, $richting) {
        $dbSql = sprintf('
            SELECT ABS(SUM(bedrag)) AS bedrag, c.omschrijving, DATE_FORMAT(t.datum, "%%m-%%Y") AS periode
            FROM transactie t
            INNER JOIN categorie c on t.categorie_id = c.id
            WHERE YEAR(t.datum) = %s AND c.exclude = False AND c.richting="%s"
            GROUP BY c.omschrijving, periode
        ', $jaar, $richting);

        //print($dbSql); die();

        return DB::select($dbSql);
     }
 
     public function lijstOmschrijvingen($richting) {
        $dbSql = sprintf('
            SELECT t.omschrijving, COUNT(t.id) AS aantal, ABS(SUM(t.bedrag)) as bedrag
            FROM transactie t
            
            JOIN categorie c ON c.id = t.categorie_id
            WHERE c.richting = "%s"
            GROUP BY omschrijving
            ORDER BY omschrijving
        ',$richting);

        //print($dbSql); die();

        return DB::select($dbSql);
     }

     public function updateTransactieOmschrijving($omschrijving, $omschrijving2update) {
        $dbSql = sprintf('
            UPDATE transactie
            SET omschrijving = "%s"
            WHERE omschrijving = "%s"
        ', $omschrijving, $omschrijving2update);

        //print($dbSql); die();

        return DB::select($dbSql);
     }

    public function mergeLijstOmschrijvingen($omschrijvingen, $richting) {
        $dbSql = sprintf('
            SELECT t.omschrijving, COUNT(DISTINCT t.id) AS aantal
            FROM transactie t
            INNER JOIN categorie c on t.categorie_id = c.id
            WHERE t.omschrijving IN ("%s") AND c.richting = "%s"
            GROUP BY t.omschrijving
            ORDER BY t.omschrijving
        ', $omschrijvingen, $richting);
       //print($dbSql); die();
        return DB::select($dbSql);
    }
    
}