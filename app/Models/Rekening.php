<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class rekening extends Model
{
    use HasFactory;
    protected $table = 'rekening';

    public function lijst()
    {
        $rslt = [];

        $dbSql = sprintf("
            SELECT *
            FROM rekening
            ORDER BY volgnummer
        ");


        $rslt['rekeningOverzicht'] = DB::select($dbSql);

        $dbSql = sprintf("
         SELECT SUM(saldo) AS totaalBedrag 
          FROM rekening
          ");

          $rslt['totaalBedrag'] = DB::select($dbSql)[0]->totaalBedrag;  

        $dbSql = sprintf('  
        SELECT SUM(stand) AS totaalBedrag 
          FROM rekeningstand
          GROUP BY datum
          ORDER BY datum DESC
          ');
        $rslt['saldoVerschil'] = $rslt['totaalBedrag'] - DB::select($dbSql)[0]->totaalBedrag;

        return $rslt;
    }

        /**
     * rekeningOverzichtSorteer($lijst)
     * update table 'rekeningen' met volgnummer
     * @param $lijst
     */
    public function rekeningOverzichtSorteer($lijst) {
        $lijst = explode('|', $lijst);
        foreach($lijst as $lijstItem) {
            [$volgnummer, $rid] = explode(',', $lijstItem);
            $rekening = Rekening::find($rid);
            $rekening->volgnummer = $volgnummer;
            $rekening->update();
        }
    }

    public function rekeningInfo($rekeningID) {
        $rslt = [];
        $dbSql = sprintf("
         SELECT SUM(saldo) AS totaalBedrag 
          FROM rekening
          WHERE id=%d
          ", $rekeningID);
        $rslt['totaalbedrag'] = DB::select($dbSql)[0];

        $dbSql = sprintf("
         SELECT id, referentie, omschrijving
          FROM rekening
          WHERE id=%d
          ", $rekeningID);
        
        $rslt['rekeninginfo'] = DB::select($dbSql);
        return $rslt;

    }


    public function standenBijwerken() {

        $dbSql = sprintf('
            SELECT id, saldo 
            FROM rekening
        ');

        $rekeningen = DB::select($dbSql);
        $datum = date("Y-m-d");

        foreach ($rekeningen as $rekening) {
            $id = $rekening->id;
            $saldo = $rekening->saldo;

            // $stand = new Rekeningstand;
            // $stand->datum = $datum;
            // $stand->rekening_id = $id;
            // $stand->stand = $stand;
            // $stand->save();

            
            $dbSql = sprintf('
                INSERT INTO rekeningstand (rekening_id, datum, stand)
                VALUES (%d, "%s", %f)
            ', $id, $datum, $saldo);

            DB::select($dbSql);
        }

    }
}
