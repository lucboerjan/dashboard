<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class InternetGroups extends Model
{
    use HasFactory;
    protected $table = 'internetgroepen';

    public function groepenLijst() {
        $dbSql = sprintf('
            SELECT *
            FROM internetgroepen
            ORDER BY volgorde
        ');

        return DB::select($dbSql);

    }

public function bewaarInternetGroep($groepID, $omschrijving) {
    $dbSql = sprintf('
        UPDATE internetgroepen
        SET omschrijving= "%s"
        WHERE id=%d
    ', $omschrijving, $groepID);

    DB::select($dbSql);

}

}
