<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Tellerstand extends Model
{
    use HasFactory;
    protected $table = 'tellerstand';

    public function tellerstandOverzicht() {
        $dbSql = ('
            SELECT id, datum, dag, nacht, dagteller_in, nachtteller_in, dagteller_uit, nachtteller_uit, zon, water, gas, DATE_FORMAT(datum, "%d-%m-%Y") AS weergavedatum
            FROM tellerstand
            ORDER BY datum DESC 
        ');

        return DB::select($dbSql);
    }

    public function getTellerstand($id){
        $dbSql = sprintf('
        select id, datum, dag, nacht, dagteller_in, nachtteller_in, dagteller_uit, nachtteller_uit, zon, water, gas
        FROM tellerstand
        WHERE id=%d
        ', $id);

        return DB::select($dbSql)[0];
    }

    public function tellerstandBewaar($id, $datum, $dag, $nacht, $dagteller_in, $nachtteller_in, $dagteller_uit, $nachtteller_uit, $zon, $water, $gas){
        if ($id==0) {

            $tellerstand = new Tellerstand();
            $tellerstand->datum = $datum;
            $tellerstand->dag = $dag;
            $tellerstand->nacht = $nacht;
            $tellerstand->dagteller_in = $dagteller_in;
            $tellerstand->nachtteller_in = $nachtteller_in;
            $tellerstand->dagteller_uit = $dagteller_uit;
            $tellerstand->nachtteller_uit = $nachtteller_uit;
            $tellerstand->zon = $zon;
            $tellerstand->water = $water;
            $tellerstand->gas = $gas;
            $tellerstand->save();
            $dta['id'] = $tellerstand->id;
            $dta['succes'] = true;
        }
        else {
            $tellerstand = Tellerstand::find($id);
            $tellerstand->datum = $datum;
            $tellerstand->dag = $dag;
            $tellerstand->nacht = $nacht;
            $tellerstand->dagteller_in = $dagteller_in;
            $tellerstand->nachtteller_in = $nachtteller_in;
            $tellerstand->dagteller_uit = $dagteller_uit;
            $tellerstand->nachtteller_uit = $nachtteller_uit;
            $tellerstand->zon = $zon;
            $tellerstand->water = $water;
            $tellerstand->gas = $gas;
            $tellerstand->update();
            $dta['id'] = $id;
            $dta['succes'] = true;

        }

        return $dta;
    }

    /**
     * public function verwijderTellerstand($id)
     * verwijder tellerstand'
     * @param $id: integer
     * @return array
     */
    public function verwijderTellerstand($id) {
       // $dta = ['succes' => false, 'boodschap' => ''];

        Tellerstand::where('id', '=', $id)->delete();
        $dta['succes'] = true;

        return $dta;
    }
}
