<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Aandelen extends Model
{
    use HasFactory;
    protected $table = 'aandelen_aankopen';
    protected $table1 = 'aandelen_koersen';
    protected $table2 = 'aandelen_fondsen';

    public function fondsenLijst()
    {

        $fondsenLijst = DB::select(
            "SELECT f.id, f.isin, f.naam, f.url, SUM(a.aantal) AS aantal, f.fondsType, ROUND(SUM(a.aantal*a.aankoopprijs),3) as aankoopbedrag FROM aandelen_fondsen f
             JOIN aandelen_aankopen a ON a.fondsID = f.id GROUP BY f.id,f.isin,f.naam, f.url, f.fondsType,a.fondsID
            "
        );

        $fondsen = DB::select("SELECT id FROM aandelen_fondsen ORDER BY id");
        $i = 0;
        $samenvatting = [];
        $samenvatting['aandelenWaarde'] = 0;
        $samenvatting['aandelenAankoopWaarde'] = 0;
        $samenvatting['aandelenOpbrengst'] = 0;
        $samenvatting['pensioensparenWaarde'] = 0;
        $samenvatting['pensioensparenAankoopWaarde'] = 0;
        $samenvatting['pensioensparenOpbrengst'] = 0;
        $samenvatting['totaalOpbrengst'] = 0;

        foreach ($fondsen as $fondsrec) {
            $id = $fondsrec->id;

            $minKoers = DB::select(sprintf("SELECT MIN(dagkoers) AS minKoers FROM aandelen_koersen WHERE fondsID=%d;", $id));
            $maxKoers = DB::select(sprintf("SELECT MAX(dagkoers) AS maxKoers FROM aandelen_koersen WHERE fondsID=%d;", $id));
            $laatsteKoers = DB::select(sprintf("SELECT dagkoers FROM aandelen_koersen WHERE fondsID=%d ORDER BY datum DESC LIMIT 1;", $id));

            $minWaarde = $minKoers[0]->minKoers * $fondsenLijst[$i]->aantal;
            $maxWaarde = $maxKoers[0]->maxKoers * $fondsenLijst[$i]->aantal;
            $waarde = $laatsteKoers[0]->dagkoers * $fondsenLijst[$i]->aantal;

            $fondsenLijst[$i]->laatsteKoers = number_format($laatsteKoers[0]->dagkoers, 2, '.', '');
            $fondsenLijst[$i]->minWaarde = number_format($minWaarde, 2, ',', '');
            $fondsenLijst[$i]->maxWaarde = number_format($maxWaarde, 2, ',', '');
            $fondsenLijst[$i]->waarde = number_format($waarde, 2, ',', '');

            $opbrengstEuro = ($laatsteKoers[0]->dagkoers * $fondsenLijst[$i]->aantal) - $fondsenLijst[$i]->aankoopbedrag;
            $opbrengstPercent = $opbrengstEuro * 100 / $fondsenLijst[$i]->aankoopbedrag;

            $breakEven = $fondsenLijst[$i]->aankoopbedrag / $fondsenLijst[$i]->aantal;

            $fondsenLijst[$i]->opbrengstEuro = number_format($opbrengstEuro, 2);
            $fondsenLijst[$i]->opbrengstPercent = number_format($opbrengstPercent, 2, ',', '');
            $fondsenLijst[$i]->breakEven = number_format($breakEven, 2);

            if ($fondsenLijst[$i]->fondsType == "Aandeel") {
                $samenvatting['aandelenWaarde'] += $waarde;
                $samenvatting['aandelenAankoopWaarde'] += $fondsenLijst[$i]->aankoopbedrag;
                $samenvatting['aandelenOpbrengst'] += ($waarde - $fondsenLijst[$i]->aankoopbedrag);
                $samenvatting['totaalOpbrengst'] += ($waarde - $fondsenLijst[$i]->aankoopbedrag);
            } else {
                $samenvatting['pensioensparenWaarde'] += $waarde;
                $samenvatting['pensioensparenAankoopWaarde'] += $fondsenLijst[$i]->aankoopbedrag;
                $samenvatting['pensioensparenOpbrengst'] += ($waarde - $fondsenLijst[$i]->aankoopbedrag);
                $samenvatting['totaalOpbrengst'] += ($waarde - $fondsenLijst[$i]->aankoopbedrag);
            }


            $i++;
        }
        return [
            'fondsenLijst' => $fondsenLijst,
            'samenvatting' => $samenvatting,
        ];

    }

    public function getAankoop($id)
    {
        return DB::select(sprintf("
            SELECT id, datum, aantal, aankoopprijs
            FROM aandelen_aankopen
            WHERE id=%d
        ", $id))[0];
    }

    
    public function getFondsNaam($fondsID) {
        $dbSql = sprintf('
            SELECT isin, naam 
            FROM aandelen_fondsen
            WHERE id=%d
        ', $fondsID);

        return DB::select($dbSql)[0];
    }

    public function getAankopen($fondsID) {
        $dbSql = sprintf('
            SELECT id, fondsID, DATE_FORMAT(datum, "%%d-%%m-%%Y") AS weergavedatum, datum, aantal, aankoopprijs
            FROM aandelen_aankopen
            WHERE fondsID=%d
            ORDER BY datum DESC
        ', $fondsID);
        return DB::SELECT($dbSql);
    }
    public function getDagkoersen($fondsID) {
        $dbSql = sprintf('
            SELECT id, fondsID, DATE_FORMAT(datum, "%%d-%%m-%%Y") AS weergavedatum, datum, dagkoers
            FROM aandelen_koersen
            WHERE fondsID=%d
            ORDER BY datum DESC
        ', $fondsID);
        return DB::SELECT($dbSql);
    }

    private function getNotering2duplicate($datum, $fondsID)
    {
        $date2use = explode('-', $datum);
        $dd = $date2use[2];
        $mm = $date2use[1];
        $yy = $date2use[0];
        return DB::SELECT(sprintf("SELECT id FROM aandelen_koersen WHERE DAY(datum)=%d AND Month(datum)=%d AND Year(datum)=%d AND fondsID=%d LIMIT 1", $dd, $mm, $yy, $fondsID))[0];
    }

    public function verwijderAankoop($id)
    {
        $dta = ['succes' => false, 'boodschap' => ''];

        AandelenAankopen::where('id', '=', $id)->delete();
        $dta['succes'] = true;

        return $dta;
    }

    public function setAankoop($id, $datum, $aantal, $koers, $fondsID)
    {
        $dta = ['succes' => false, 'boodschap' => ''];

        if ($id == 0) {

            $aandeel = new AandelenAankopen();
            $aandeel->id = $id;
            $aandeel->fondsID = $fondsID;
            $aandeel->datum = $datum;
            $aandeel->aantal = $aantal;
            $aandeel->aankoopprijs = $koers;
            $aandeel->save();
            $dta['id'] = $aandeel->id;
            $dta['succes'] = true;
        } else {
            $aandeel = AandelenAankopen::find($id);
            //$aandeel->id = $id;
            $aandeel->datum = $datum;
            $aandeel->aantal = $aantal;
            $aandeel->aankoopprijs = $koers;
            $aandeel->update();
            $dta['succes'] = true;

        }

        return $dta;
    }

    public function aandelenAankopen()
    {
        $dbSql = "SELECT a.id, DATE_FORMAT(a.datum,'%d-%m-%Y') as datum, a.aantal, a.aankoopprijs, f.naam from aandelen_aankopen a 
        INNER JOIN aandelen_fondsen f ON  a.fondsID=f.id ORDER BY a.datum desc";

        return DB::select($dbSql);

    }

    public function aandelenNoteringen()
    {
        $dbSql = "SELECT k.id, DATE_FORMAT(k.datum,'%d-%m-%Y') as datum, k.dagkoers, f.naam from aandelen_koersen k 
             INNER JOIN aandelen_fondsen f ON  k.fondsID=f.id ORDER BY k.datum desc";

        return DB::select($dbSql);

    }

    public function getNotering($id)
    {
        return DB::select(sprintf("
        SELECT id, datum, dagkoers
        FROM aandelen_koersen
        WHERE id=%d
    ", $id))[0];
    }

    public function verwijderNotering($id, $fondsID, $datum, $dupliceer_naar)
    {
        $dta = ['succes' => false, 'boodschap' => ''];

        AandelenKoersen::where('id', '=', $id)->delete();
        $dta['succes'] = true;
        if ($dupliceer_naar > 0 ) {
            $id = $this->getNotering2duplicate($datum, $dupliceer_naar);
            AandelenKoersen::where('id', '=', $id->id)->delete();

        }

        return $dta;
    }

    public function setNotering($id, $datum, $koers, $fondsID, $dupliceer_naar)
    {
        $dta = ['succes' => false, 'boodschap' => ''];
        $dta['dupliceer_naar_fonds'] = $dupliceer_naar;
        

        if ($id == 0) {

            $notering = new AandelenKoersen();
            $notering->id = $id;
            $notering->fondsID = $fondsID;
            $notering->datum = $datum;
            $notering->dagkoers = $koers;
            $notering->save();
            $dta['id'] = $notering->id;
            $dta['succes'] = true;
            if ($dupliceer_naar > 0) {
                $notering = new AandelenKoersen();
                $notering->id = $id;
                $notering->fondsID = $dupliceer_naar;
                $notering->datum = $datum;
                $notering->dagkoers = $koers;
                $notering->save();
                $dta['gedupliceerd'] = true;
            }
        } else {
            $notering = AandelenKoersen::find($id);
            $notering->datum = $datum;
            $notering->dagkoers = $koers;
            $notering->update();

            if ($dupliceer_naar > 0) {
                $id = $this->getNotering2duplicate($datum, $dupliceer_naar);
                $dta['dupliceerID'] = $id->id;
                $dta['gedupliceerd'] = true;
                $notering = AandelenKoersen::find($id->id);
                $notering->datum = $datum;
                $notering->dagkoers = $koers;
                $notering->update();


            }
            $dta['succes'] = true;
        }

        return $dta;
    }

    public function aandelenFondsen()
    {
        $dbSql = "SELECT f.id, f.isin, f.naam, f.url, SUM(a.aantal) AS aantal, f.fondsType, ROUND(SUM(a.aantal*a.aankoopprijs),3) as aankoopbedrag FROM aandelen_fondsen f
        JOIN aandelen_aankopen a ON a.fondsID = f.id GROUP BY f.id,f.isin,f.naam, f.url, f.fondsType,a.fondsID";

        return DB::select($dbSql);

    }

}