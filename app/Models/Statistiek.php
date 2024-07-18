<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Http\Middleware\Instelling;

class Statistiek extends Model
{
    use HasFactory;
    protected $table = 'rekeningstand';

    public function laadOverzicht() {

        //haal de periodes op om te vullen
        $dbSql = sprintf('
            SELECT DATE_FORMAT(datum, "%%m-%%Y") AS periode
            FROM rekeningstand
            GROup BY periode
            ORDER BY datum DESC
        '); 
        $maanden = DB::select($dbSql);

        $dbSql = sprintf("SELECT s.stand, DATE_FORMAT(s.datum, '%%mY-%%Y') AS periode, r.omschrijving
        FROM rekeningstand s
        JOIN rekening r ON s.rekening_id = r.id 
        ORDER BY periode DESC");

        $data = DB::select($dbSql);

        $dbSql = sprintf("SELECT SUM(stand) AS totaal, DATE_FORMAT(datum, '%%Y-%%m') AS periode
        FROM rekeningstand s
        GROUP BY periode
        ORDER BY periode DESC");

        $totaal = DB::select($dbSql);

        return [
                'periode' => $maanden,
                'data' => $this->standenHistoriekData(),
                'totaal' => $totaal
        ];
    }



    public function standenHistoriekData() {
        //voor de rekeningen, de historiek ophalen en in een json object teruggeven
        
        $dbSql = sprintf('SELECT * FROM rekening ORDER BY id');
        $rekeningen = DB::select($dbSql);
        
        $result = [];
        
        foreach ($rekeningen as $rekening) {
            $rekening_id = $rekening->id;
            $omschrijving = $rekening->omschrijving;
            
            $overzicht = [
                'rekening_id' => $rekening_id,
                'omschrijving' => $omschrijving,
            ];
        
            $dbSql = sprintf('SELECT * FROM rekeningstand WHERE rekening_id=%d ORDER BY datum DESC', $rekening_id);
            $standen = DB::select($dbSql);
        
            foreach ($standen as $stand) {
                $overzicht[$stand->datum] = number_format((float) $stand->stand, 2, '.', '');
            }
        
            $result[] = $overzicht;
        }
        

        
                // $totaal['rekening_id'] = '';
                // $totaal['omschrijving'] = 'Totaal';
        
                // $verschil['rekening_id'] = '';
                // $verschil['omschrijving'] = 'Verschil met vorige maand';
        
                // $cumul['rekening_id'] = '';
                // $cumul['omschrijving'] = 'Gecumuleerd saldo';
        
        //         foreach ($result as $rekening) {
        //             while (list($key, $val) = each($rekening)) {
        //                 if ($key == 'rekening_id' || $key == 'omschrijving') {
                            
        //                 } else {
        //                     $totaal[$key] += $val;
        //                     $totaal[$key] = number_format((float) $totaal[$key], 2, '.', '');
        //                 }
        //             }
        //         }
        //         $idx = 0;
        // //while (list($key, $val) = each(number_format((float) $totaal, 2, '.', ''))) {
        //         while (list($key, $val) = each($totaal)) {
        //             $idx++;
        //             if ($idx <= 1) {
        //                 $mnd0 = $val;
        //                 $key0 = $key;
        //             } else {
        //                 if ($idx == 30) {
        //                     $mnd0 = $val;
        //                     $verschil[$key] = '-----------------';
        //                     $cumul[$key] = '-----------------';
        //                 } else {
        //                     $mnd1 = $val;
        //                     $key1 = $key;
        //                     $saldoVerschil = ($mnd0 - $mnd1);
        // //__debug($mnd1 . " " . $mnd0 ." " .$saldoVerSchil);
        
        //                     $verschil[$key0] = number_format((float) $saldoVerschil, 2, '.', '');
        //                     $saldoCumul += ($mnd0 - $mnd1);
        //                     $cumul[$key0] = number_format((float) $saldoCumul, 2, '.', '');
        //                     $mnd0 = $mnd1;
        //                     $key0 = $key1;
        //                 }
        //             }
           //     }
                // $verschil['omschrijving'] = 'Verschil met vorige maand';
                // array_push($result, $totaal);
                // array_push($result, $verschil);
        //array_push($result, $cumul);
        
                return $result;
            }
        
}
