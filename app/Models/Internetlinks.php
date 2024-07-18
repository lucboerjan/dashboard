<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Internetlinks extends Model
{
    use HasFactory;
    protected $table = 'internetlinks';

    public function InternetlinksLijst($groepID) {
        $dbSql = sprintf('
            SELECT *
            FROM internetlinks
            WHERE groepID=%d

            ', $groepID);
    
    return DB::select($dbSql);

    }

    public function getInternetLink($id) {

        // Sanitize the input
        $id = (int)$id;
        
        // Prepare the SQL query
        $dbSql = sprintf("
            SELECT *
            FROM internetlinks
            WHERE id = %d        
            ", $id);
        
            // Execute the query
       // print($dbSql); die();

            return DB::select($dbSql)[0];
    }

    public function bewaarInternetLink($id, $groepID, $url, $omschrijving) {
        $dta = ['succes' => false, 'boodschap' => ''];

        if ($id == 0) {

            $link = new internetLinks();
            $link->id = $id;
            $link->groepID = $groepID;
            $link->url = $url;
            $link->omschrijving = $omschrijving;
            $link->save();
            $dta['id'] = $link->id;
            $dta['succes'] = true;
        } else {

        $dbSql = sprintf('
            UPDATE internetlinks
            SET  groepID = %d, url="%s", omschrijving = "%s"
            WHERE id = %d
            ', $groepID, $url, $omschrijving, $id);

            DB::select($dbSql);
            $dta['succes'] = true;
        }
        return $dta;
    }

    public function VerwijderInternetLink($id) {
        $dbSql = sprintf('
            DELETE FROM internetlinks
            WHERE id = %d
        ', $id);

        DB::select($dbSql);

    }
}
