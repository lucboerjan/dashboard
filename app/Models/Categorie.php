<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Categorie extends Model
{
    use HasFactory;
    protected $table = 'categorie';

    public function getCategorieID($categorie) {
        $dbSql = sprintf('
            SELECT id
            FROM categorie
            WHERE omschrijving="%s"
        ', $categorie);

        return DB::select($dbSql)[0];
    }
}
