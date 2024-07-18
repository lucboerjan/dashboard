<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Spelmain extends Model
{
    use HasFactory;
    protected $table = 'spelmain';

    public function spelInfoMainOverzicht() {

        $dbSql = sprintf('  
            SELECT          
                sm.spelID, 
                sm.datum, 
                sm.omschrijving, 
                sm.aantalSpelers, 
                DATE_FORMAT(sm.datum, "%%d-%%m-%%Y") AS weergavedatum, 
                CAST(COUNT(sr.spelID) / sm.aantalSpelers AS UNSIGNED) AS aantalSpelletjes
            FROM spelmain sm
            LEFT JOIN spelrondes sr ON sm.spelID = sr.spelID
            GROUP BY sm.spelID, sm.datum, sm.omschrijving, aantalSpelers
            ORDER BY sm.datum DESC;
        ');


        return DB::select($dbSql);
    }

    public function spelmainInfo($spelID){
        $dbSql = sprintf('
            SELECT spelID, datum, omschrijving, aantalSpelers
            FROM spelmain
            WHERE spelID=%d'
            , $spelID);

        return DB::select($dbSql)[0];
    }


    public function spelInfo($spelID){
        
        $dbSql = sprintf('
        SELECT sd.id, sp.spelerID, sp.naam, sd.score, sd.volgorde
        FROM speldetails sd
        INNER JOIN spelers sp ON sd.id = sp.spelerID
        WHERE sd.spelID=%d
        ORDER BY sd.volgorde
        
    ', $spelID);
    return DB::select($dbSql);
    }

    public function voegSpelToe() {
        $datum = date('Y-m-d');
        $dbSql = sprintf('
        INSERT INTO `spelmain` (`datum`, `omschrijving`, `aantalSpelers`)
        VALUES ("%s", "",0)
    ', $datum);

    DB::select($dbSql);

    return [DB::getPdo()->lastInsertId(), $datum];
    }

    public function spelmainbewaar($spelID, $datum, $omschrijving, $aantalSpelers) {
        $dbSql = sprintf('
            UPDATE spelmain
            SET datum = "%s", omschrijving = "%s", aantalSpelers = %d
            WHERE spelID = %d
        ', $datum, $omschrijving, $aantalSpelers, $spelID);

        DB::select($dbSql);

    }

    public function spelmainVerwijder($spelID) {
        $dbSql = sprintf('
            DELETE FROM spelmain
            WHERE spelID = %d
        ', $spelID);
        DB::select($dbSql);
        
        $dbSql = sprintf('
            DELETE FROM speldetails
            WHERE spelID = %d
        ', $spelID);
        DB::select($dbSql);
    }

}
