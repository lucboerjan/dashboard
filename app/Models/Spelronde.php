<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Spelronde extends Model
{
    use HasFactory;
    protected $table = 'spelrondes';

    public function spelRondes($spelID) {
        $dbSql = sprintf('
            SELECT sr.spelrondeID, sr.spelrondespelID, sr.score, sp.spelerID, sp.naam
            FROM spelrondes sr
            INNER JOIN spelers sp ON sr.spelerID=sp.spelerID
            WHERE sr.spelID=%d
            ORDER BY sr.spelrondeID DESC
        ', $spelID);

        return DB::select($dbSql);

    }
    public function spelScore($spelID) {
        $dbSql = sprintf('
        SELECT sr.spelerID, sp.naam, SUM(sr.score) AS score
        FROM spelrondes sr 
        INNER JOIN spelers sp ON sp.spelerID = sr.spelerID
        WHERE sr.spelID=%d
		         GROUP BY sr.spelerID, sp.naam
		         
    ', $spelID);

    return DB::select($dbSql);
    }


    public function spelInfo($spelID) {
        $dbSql = sprintf('


        SELECT sr.spelerID, sp.naam, SUM(sr.score) AS totalScore, sd.volgorde
FROM spelrondes sr
INNER JOIN spelers sp ON sp.spelerID = sr.spelerID
INNER JOIN speldetails sd ON sd.spelerID = sr.spelerID AND sd.spelID = sr.spelID
WHERE sr.spelID = %d
GROUP BY sr.spelerID, sp.naam, sd.volgorde
ORDER BY sd.volgorde

		', $spelID);

      // print($dbSql); die();
    
        return DB::select($dbSql);
    }

    public function spelRondeInfo($spelID) {
        $dbSql = sprintf('
        SELECT sd.id AS spelrondespelID, 
        MAX(CASE WHEN sp.naam = sr.naam THEN sr.score ELSE NULL END) AS score
        FROM (
            SELECT sd.id, sp.spelerID, sp.naam, sd.score, sd.volgorde
            FROM speldetails sd
            INNER JOIN spelers sp ON sd.id = sp.spelerID
            WHERE sd.spelID=%d
            ) AS sd
        LEFT JOIN spelrondes sr ON sd.id = sr.spelrondespelID
        GROUP BY sd.id
 
        ', $spelID);
   // print($dbSql);die();

        return DB::select($dbSql);
    }

    public function bewerkSpelronde($spelID, $spelrondeSpelID){

        //nieuw spelletje => record aanmaken in spelrondes
        if ($spelrondeSpelID == 0) { 
            //spelrondeSpelID berekenen
            $dbSql = sprintf('
                SELECT MAX(spelrondeSpelID) as spelrondeSpelID
                FROM spelrondes
                WHERE spelID=%d
            ', $spelID);
            $dbRslt = DB::select($dbSql);
            if (count($dbRslt)== 0) {
                $spelrondeSpelID = 1;
            }
            else {
                $spelrondeSpelID = $dbRslt[0]->spelrondeSpelID + 1;
            }

            //deelnemende spelers uit speldetails halen
            $dbSql = sprintf('
                SELECT spelerID, COALESCE(volgorde,0) AS volgorde
                FROM speldetails
                WHERE spelID=%d
                ORDER BY volgorde
            ', $spelID);
            $dbRslt = DB::select($dbSql);

            foreach ($dbRslt as $dbRij) {
                $spelerID = intval($dbRij->spelerID);
                $volgorde = intval($dbRij->volgorde);
                $dbSql = sprintf('
                    INSERT into spelrondes (spelID, spelerID, spelrondeSpelID, volgorde, score)
                    VALUES (%d, %d, %d, %d, 0)
                    ', $spelID, $spelerID, intval($spelrondeSpelID), $volgorde
                );
                //print($dbSql); die();
                DB::select($dbSql);
            }
        }
        //haal de spelrondes op voor het geselecteerde spel
        $dbSql = sprintf('
            SELECT sp.spelerID, sp.naam, sr.spelID, sr.score, sr.spelrondeID, sr.volgorde
            FROM spelrondes sr
            INNER JOIN spelers sp ON sp.spelerID = sr.spelerID

            WHERE sr.spelrondeSpelID=%d AND sr.spelID=%d
            ORDER BY sr.spelrondeSpelID DESC
        ', $spelrondeSpelID, $spelID);

        //print($dbSql);die();
        return DB::select($dbSql);

    }

    public function bewaarSpelronde($spelrondeID, $spelerID, $score) {
        $dbSql = sprintf('
            UPDATE spelrondes
            SET score=%d
            WHERE spelrondeID=%d AND spelerID=%d
        ', $score, $spelrondeID, $spelerID);

        DB::select($dbSql);
        return $dbSql;
    }

    public function verwijderSpelrondespel($spelID, $spelrondeSpelID) {
        $dbSql = sprintf('
            DELETE
            FROM spelrondes
            WHERE spelID=%d AND spelrondeSpelID=%d
        ', $spelID, $spelrondeSpelID);
        DB::select($dbSql);
    }

    public function spelScores() {

        $dbSql = sprintf('
            SELECT sr.spelID, SUM(score) AS score, sp.naam
            FROM spelrondes sr
            JOIN spelers sp ON sp.spelerID = sr.spelerID
            GROUP BY sr.spelID, sr.spelerID, sp.naam
            ORDER BY sr.spelID DESC, score ASC

        ');

        return DB::select($dbSql);

    }
    
}
