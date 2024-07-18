<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Speldetail extends Model
{
    use HasFactory;
    protected $table = 'speldetails';


public function verwijderSpelerVanSpel($spelID, $spelerID) {

    $dbSql = sprintf('
        DELETE FROM speldetails
        WHERE spelID=%d AND spelerID=%d
    ', $spelID, $spelerID);
    DB::select($dbSql);
    
    
    }

public function voegSpelerToeAanSpel($spelID, $spelerID) {
    //volgorde speler bepalen
    $dbSql = sprintf('
        SELECT MAX(volgorde) as volgorde
        FROM speldetails
        WHERE spelID = %d
    ', $spelID);
    $volgordeResult = DB::select($dbSql);
    
    // Handle the case where $volgorde might be NULL
    $volgorde = $volgordeResult[0]->volgorde;
    if ($volgorde === null) {
        $volgorde = 1;
    } else {
        $volgorde += 1;
    }
    
    // Insert the new record into speldetails
    $dbSql = sprintf('
        INSERT INTO `speldetails` (`spelID`, `spelerID`, `score`, `volgorde`)
        VALUES (%d, %d, 0, %d)
    ', $spelID, $spelerID, $volgorde);
    DB::select($dbSql);
    
    return $volgorde;
    
    }

    public function spelersPerSpel($spelID) {
        $dbSql = sprintf('
            SELECT sp.naam, sd.volgorde
            FROM speldetails sd
            INNER JOIN spelers sp ON sp.spelerID=sd.spelerID
            WHERE sd.spelID = %d
        ', $spelID);
        return DB::select($dbSql);
    }
    

}
