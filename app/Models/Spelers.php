<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class Spelers extends Model
{
    use HasFactory;
    protected $table = 'spelers';

    public function spelersLijst($spelID) {
        // $dbSql = sprintf('
        //     SELECT 
        //     sp.spelerID, sp.naam, 
        //     CASE 
        //         WHEN (SELECT COUNT(1) 
        //             FROM speldetails sd 
        //             WHERE sd.spelID = 1 AND sp.spelerID = sd.spelerID) > 0 
        //         THEN 0 
        //         ELSE 1 
        //     END AS selecteerbaar 
        // FROM spelers sp 
        // RIGHT OUTER INNER JOIN speldetails sd ON sp.spelerID = sd.spelerID 
        // ORDER BY sd.volgorde;

        // ', $spelID);
        // print($dbSql); die();


    $dbSql = sprintf('
        SELECT sp.spelerID, sp.naam, 
        CASE 
        WHEN (SELECT COUNT(1) 
                    FROM speldetails sd 
                    WHERE sd.spelID = %1$d AND sp.spelerID = sd.spelerID) > 0 
                THEN 0 
                ELSE 1 
            END AS selecteerbaar 
        FROM spelers sp 
        LEFT JOIN  speldetails sd ON sp.spelerID = sd.spelerID AND sd.spelID = %1$d
        ORDER BY 
    sd.volgorde', $spelID);

        return DB::select($dbSql);
    }

    public function voegSpelerToe($naam) {
        $dbSql = sprintf('
            INSERT INTO spelers (naam) VALUES ("%s")
        ', $naam);
        DB::select($dbSql);  
        return DB::getPdo()->lastInsertId();
    }

}
