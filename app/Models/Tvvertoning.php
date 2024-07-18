<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Tvvertoning extends Model
{
    use HasFactory;
    protected $table = 'tvvertoning';

    public function vertoningenOverzicht($pagina, $aantalVertoningenPerPagina, $datum, $where)
    {

        // aantal items zoekenresultaat
        $tmp = $this->zoekVertoningen($tel = true, 1e6, 0, $aantalVertoningenPerPagina, $datum, $where);

        $aantal = $tmp['aantal'];
        $aantalPaginas = $tmp['aantalPaginas'];
        $sql_aantal = $tmp['sql_aantal'];
        $vertoningenRslt = $this->zoekVertoningen($tel = false, $aantal, $pagina, $aantalVertoningenPerPagina, $datum, $where);

        $dbSql = sprintf('
        SELECT DISTINCT CONCAT(tvv.titel, " ### ", jaar, " (", COUNT(*), ")") AS titel
            FROM tvvertoning tvv
            GROUP BY tvv.titel, jaar
            ORDER BY titel
        ');

        $filmlijst = DB::select($dbSql);

        return [
            'aantal' => $aantal,
            'aantalPaginas' => $aantalPaginas,
            'vertoningen' => $vertoningenRslt['vertoningen'],
            'sql_vertoningen' => $vertoningenRslt['sql_vertoningen'],
            'filmlijst' => $filmlijst,
            'sql_aantal' => $sql_aantal,

        ];


    }

    public function zoekVertoningen($tel = false, $aantal, $pagina, $aantalVertoningenPerPagina, $datum, $where)
    {
        if ($tel) {
           // $dbSql = sprintf('SELECT COUNT(*) AS aantal FROM tvvertoning WHERE datum = "%s"', $datum);
            $dbSql = sprintf('SELECT COUNT(*) AS aantal FROM tvvertoning t WHERE %s', $where);

            $aantal = DB::SELECT($dbSql)[0]->aantal;
            $aantalPaginas = ceil($aantal / $aantalVertoningenPerPagina);

            return [
                'aantal' => $aantal,
                'aantalPaginas' => $aantalPaginas,
                'sql_aantal' => $dbSql,
            ];
        } else {
            // order by 
            $dbOrder = 'ORDER BY z.id ASC';

            // --- limit
            $aantalPaginas = ceil($aantal / $aantalVertoningenPerPagina);
            if ($pagina > $aantalPaginas)
                $pagina = $aantalPaginas;
            $dbLimit = sprintf("LIMIT %s,%s", $pagina * $aantalVertoningenPerPagina, $aantalVertoningenPerPagina);

            $dbSql = sprintf('
                SELECT t.id, t.titel, t.jaar, DATE_FORMAT(datum, "%%d-%%m-%%Y") AS datumvertoning, i.id AS imdbratingID, i.imdbrating, i.imdburl, z.naam, z.id as zenderID, t2.aantalVertoningen 
                FROM tvvertoning t 
                LEFT JOIN imdbrating i ON t.imdbratingID = i.id 
                INNER JOIN tvzender z ON t.tvzenderID = z.id 
                INNER JOIN (
                    SELECT t2.imdbratingID, COUNT(t2.titel) as aantalVertoningen 
                    FROM tvvertoning t2 
            
                    GROUP BY t2.imdbratingID
                ) t2 ON t.imdbratingID = t2.imdbratingID 
                WHERE %s 
                %s
                %s
                ', $where, $dbOrder, $dbLimit);




                // SELECT t.id, t.titel,t.jaar, DATE_FORMAT(datum, "%%d-%%m-%%Y") AS datumvertoning, i.id AS imdbratingID, i.imdbrating, i.imdburl, z.naam, z.id as zenderID,
                // t2.aantalVertoningen
                // FROM tvvertoning t
                // LEFT JOIN imdbrating i on t.imdbratingID = i.id
                // INNER JOIN tvzender z on t.tvzenderID = z.id
                // INNER JOIN (SELECT t2.id, COUNT(t2.titel) as aantalVertoningen FROM tvvertoningen t2)
                // WHERE %s
                
                // %s
                // %s
                // ', $where, $dbOrder, $dbLimit);
        }
        //print($dbSql); die();
        $rslt = [];
        $rslt['sql_vertoningen'] = $dbSql;
        $rslt['vertoningen'] = DB::select($dbSql);
        return $rslt;
    }

    public function getVertoning($id) {
        $dbSql = sprintf('
            SELECT t.id, t.titel, t.jaar, 
            t.datum, 
            i.id AS imdbratingID, i.imdbrating, i.imdburl, z.naam as zender, z.id as zenderID
            FROM tvvertoning t
            LEFT JOIN imdbrating i on t.imdbratingID = i.id
            INNER JOIN tvzender z on t.tvzenderID = z.id
            WHERE t.id = %d
            ', $id);


            //print($dbSql); die();

        return DB::select($dbSql)[0];
    }

    public function setVertoning($id, $datum, $zenderid,$titel, $filmjaar, $imdbid ) {
        if ($id == 0) {
            $vertoning = new Tvvertoning();
            $vertoning->datum = $datum;
            $vertoning->tvzenderID = $zenderid;
            $vertoning->titel = $titel;
            $vertoning->jaar = $filmjaar;
            $vertoning->imdbratingID = $imdbid;
            $vertoning->save();
            $dta['id'] = $vertoning->id;
            $dta['succes'] = true;
        }
        else {
            $vertoning = Tvvertoning::find($id);
            $vertoning->datum = $datum;
            $vertoning->tvzenderID = $zenderid;
            $vertoning->titel = $titel;
            $vertoning->jaar = $filmjaar;
            $vertoning->imdbratingID = $imdbid;
            $vertoning->update();
            $dta['succes'] = true;
        }
        return $dta;

    }

    public function lijstVertoningenOpimdbratingID($imdbratingID){
        $dbSql = sprintf('
        SELECT t.id, t.titel, DATE_FORMAT(datum, "%%d-%%m-%%Y") AS datumvertoning, i.id AS imdbratingID,  z.naam
        FROM tvvertoning t
        LEFT JOIN imdbrating i on t.imdbratingID = i.id
        INNER JOIN tvzender z on t.tvzenderID = z.id
        WHERE i.id = %s
        ORDER BY datum DESC
        ', $imdbratingID);

        return DB::select($dbSql);
    }

    public function getImdbRating ($id, $mode) {
        $dbSql = sprintf('
            SELECT id, titel, jaar, imdburl, imdbrating
            FROM imdbrating
            WHERE id=%d
        ', $id);
   
        return DB::select($dbSql);
    }

    public function zoekImdbRecord($titel2find) {
        $dbSql = sprintf("
            SELECT id, titel, jaar, imdburl, imdbrating
            FROM imdbrating
            WHERE titel LIKE '%%%s%%'
            ORDER BY titel
        ", $titel2find);

    
    return DB::select($dbSql);
    }

    public function verwijderImdbRating($imdbratingID) {
        $dbSql = sprintf('
        DELETE FROM imdbrating
        WHERE id=%d
    ', $imdbratingID);
    
    return DB::select($dbSql);

    }

    public function verwijderVertoning($id) {
       $dbSql = sprintf('
            DELETE FROM tvvertoning
            WHERE id=%d
       ', $id);
        
       return DB::select($dbSql);
    }


    public function lijstFilms() {
        $dbSql = sprintf('
        SELECT titel, jaar, COUNT(id) AS aantal
        FROM tvvertoning
        GROUP BY titel, jaar
        ORDER BY titel
    ');
    
    
        return DB::select($dbSql);
    }   
}
