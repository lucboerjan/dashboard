<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Tvzender extends Model
{
    use HasFactory;

    public function tvZenders() {
        $dbSql = sprintf('
            SELECT id, naam
            FROM tvzender
            ORDER BY naam
        ');

        return DB::select(($dbSql));
    }

    public function getZenderID($zender) {
        $dbSql = sprintf('
            SELECT id
            FROM tvzender
            WHERE naam = "%s"
        ', $zender);
    
    return DB::select($dbSql)[0]->id;
    }
}
