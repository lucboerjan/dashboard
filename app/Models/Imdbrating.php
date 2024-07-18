<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Imdbrating extends Model
{
    use HasFactory;
    protected $table = 'imdbrating';

    public function imdbratings()
    {
        $dbSql = sprintf('
            SELECT id, titel, jaar, imdburl, imdbrating
            FROM imdbrating
            ORDER BY titel
        ');

        return DB::select($dbSql);
    }

    public function setImdbRecord($titel, $filmjaar, $imdburl, $imdbrating)
    {
        $dta = [];
        $imdbrecord = new Imdbrating();
        $imdbrecord->titel = $titel;
        $imdbrecord->jaar = $filmjaar;
        $imdbrecord->imdburl = $imdburl;
        $imdbrecord->imdbrating = $imdbrating;
        $imdbrecord->save();

        $dta['imdbratingID'] = $imdbrecord->id;
        $dta['filmtitel'] = $titel;
        $dta['filmjaar'] = $filmjaar;
        $dta['imdburl'] = $imdburl;
        $dta['imdbrating'] = $imdbrating;
        return $dta;

    }

    public function imdbOverzicht($pagina, $aantalImdbRatingsPerPagina)
    {
        $json = ['succes' => true];
        $tmp = $this->zoekImdbRatings($tel = true, 1e6, 0, $aantalImdbRatingsPerPagina);
        $aantal = $tmp['aantal'];
        $json['aantal'] = $tmp['aantal'];
        $json['aantalPaginas'] = $tmp['aantalPaginas'];

        $imdboverzicht = $this->zoekImdbRatings($tel = false, $aantal, $pagina, $aantalImdbRatingsPerPagina);
        $json['imdboverzicht'] = $imdboverzicht;
        return $json;

    }

    public function zoekImdbRatings($tel = false, $aantal, $pagina, $aantalImdbRatingsPerPagina)
    {
        if ($tel) {
            $dbSql = sprintf('SELECT COUNT(*) AS aantal FROM imdbrating');
            $aantal = DB::SELECT($dbSql)[0]->aantal;
            $aantalPaginas = ceil($aantal / $aantalImdbRatingsPerPagina);

            return [
                'aantal' => $aantal,
                'aantalPaginas' => $aantalPaginas,
                'sql_aantal' => $dbSql
            ];
        } else {
            // --- limit
            $aantalPaginas = ceil($aantal / $aantalImdbRatingsPerPagina);
            if ($pagina > $aantalPaginas)
                $pagina = $aantalPaginas;
            $dbLimit = sprintf("LIMIT %s,%s", $pagina * $aantalImdbRatingsPerPagina, $aantalImdbRatingsPerPagina);

            $dbSql = sprintf('
            SELECT id, titel, jaar, imdbrating, imdburl
            FROM imdbrating 
            ORDER BY titel
            %s
        
                ', $dbLimit);
        }
        //echo($dbSql); die();
        return DB::select($dbSql);

    }

    public function bewaarImdbRecord($id,$titel,$jaar,$url,$rating) {
        $imdbrating = $transactie = Imdbrating::find($id);
        $imdbrating->titel = $titel;
        $imdbrating->jaar = $jaar;
        $imdbrating->imdburl = $url;
        $imdbrating->imdbrating = $rating;
        $imdbrating->save();

    }
}