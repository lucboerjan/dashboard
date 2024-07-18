<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\DashboardController;
Route::controller(DashboardController::class)->group(function() {
    Route::get('/', 'index');
    Route::get('/home', 'index');
});


//TaalController
use App\Http\Controllers\TaalController;
Route::controller(TaalController::class)->group(function() {
    Route::get('/taal/{taal?}', 'zetTaal');
});


use App\Http\Controllers\AandelenController;
Route::controller(AandelenController::class)->group(function() {
    Route::get('/aandelen', 'index');
    Route::post('/jxFondsenLijst', 'jxFondsenLijst');
    Route::post('/jxAankopenPerFonds', 'jxAankopenPerFonds');
    Route::post('/jxDagkoersenPerFonds', 'jxDagkoersenPerFonds');
    Route::post('/jxAandeelAankoopGet', 'jxAandeelAankoopGet');   
    Route::post('/jxAandeelAankoopBewaar', 'jxAandeelAankoopBewaar');   
    Route::post('/jxAandelenAankopen', 'jxAandelenAankopen');   
    Route::post('/jxAandelenNoteringen', 'jxAandelenNoteringen');   
    Route::post('/jxAandeelNoteringGet', 'jxAandeelNoteringGet');   
    Route::post('/jxAandeelNoteringBewaar', 'jxAandeelNoteringBewaar');
    Route::post('/jxAandelenFondsen', 'jxAandelenFondsen');

});

use App\Http\Controllers\ZonnepanelenController;
Route::controller(ZonnepanelenController::class)->group(function() {
    Route::get('/zonnepanelen', 'index');
    Route::post('/jxZonnepanelenLijst', 'jxZonnepanelenLijst');
    Route::post('/jxtellerstandGet', 'jxtellerstandGet');
    Route::post('/jxTellerstandZonnepanelenBewaar', 'jxTellerstandZonnepanelenBewaar');
});

use App\Http\Controllers\TvvertoningenController;
Route::controller(TvvertoningenController::class)->group(function() {
    Route::get('/tvvertoningen', 'index');
    Route::post('/jxVertoningenOverzicht', 'jxVertoningenOverzicht');
    Route::post('/jxBewaarVertoning', 'jxBewaarVertoning');
    Route::post('/jxZoekVertoningen', 'jxZoekVertoningen');
    Route::post('/jxVertoningVerwijder', 'jxVertoningVerwijder');
    Route::post('/jxGetVertoning', 'jxGetVertoning');

    //IMDBRATING
    Route::post('/jxImdbRatingOverzicht', 'jxImdbRatingOverzicht');
    Route::post('/jxImdbRatingBoodschappen', 'jxImdbRatingBoodschappen');
    Route::post('/jxGetImdbRating', 'jxGetImdbRating');
    Route::post('/jxGetImdbRatingInfo', 'jxGetImdbRatingInfo');
    Route::post('/jxVerwijderImdbRatingRecord', 'jxVerwijderImdbRatingRecord');
    Route::post('/jxImdbRatingZoek', 'jxImdbRatingZoek');
    Route::post('/jxBewaarImdbRatingRecord', 'jxBewaarImdbRatingRecord');

    //FIMLIJST
    Route::get('/filmlijst', 'filmlijst');
    Route::post('/jxFilmlijst', 'jxFilmlijst');

});

// FINANCIEELCONTROLLER
use App\Http\Controllers\FinancieelController;

Route::controller(FinancieelController::class)->group(function () {
    Route::get('/rekeningen', 'rekeningOverzicht');
    Route::post('/jxRekeningOverzichtSorteer', 'rekeningOverzichtSorteer');
   
    Route::get('/statistiek', 'statistiek');
    Route::post('/jxLijstTransacties', 'jxLijstTransacties');
    Route::post('/jxTransactieBoodschappen', 'jxTransactieBoodschappen');
    Route::get('/transactieOverzicht/{rid?}', 'transactieOverzicht');
    Route::post('/jxGetTransactie', 'jxGetTransactie');
    Route::post('/jxTransactieBewaar', 'jxTransactieBewaar');
    Route::post('/jxGetCategorien', 'jxGetCategorien');
    Route::post('/jxTransactieVerwijder', 'jxTransactieVerwijder');
    Route::post('/jxTransactiesZoeken', 'jxTransactiesZoeken');
    //STATISTIEK
    Route::post('/jxLaadOverzicht', 'jxLaadOverzicht');
    Route::post('/jxGetStatistiekParameters', 'jxGetStatistiekParameters');
    Route::post('/jxStatistiekToon', 'jxStatistiekToon');
    Route::get('/standenHistoriek', 'standenHistoriek');
    Route::get('/samenvatting', 'samenvatting');
    Route::get('/transactiejaaroverzicht', 'transactiejaaroverzicht');
    Route::get('/transactiebeheeromschrijvingen', 'transactiebeheeromschrijvingen');
    Route::post('/jxGetTransactieJaarOverzicht', 'jxGetTransactieJaarOverzicht');
    //beheer transactie omschrijvingen
    Route::post('/jxTransactieOmschrijvingenLijst', 'jxTransactieOmschrijvingenLijst');
    Route::post('/jxTransactiOmschrijvingUpdate', 'jxTransactiOmschrijvingUpdate');
    Route::post('/jxtransactieOmschrijvingenMergeLijst', 'jxtransactieOmschrijvingenMergeLijst');
    Route::post('/jxTransactiesOmschrijvingMergeUitvoeren', 'jxTransactiesOmschrijvingMergeUitvoeren');

});

// TELLERSTANDCONTROLLER
use App\Http\Controllers\TellerstandController;
Route::controller(TellerstandController::class)->group(function () {
    Route::get('/meterstand', 'tellerstandOverzicht');
    Route::get('/overzicht', 'totaalOverzicht');
    Route::post('/jxTellerstandOverzicht', 'jxTellerstandOverzicht');
    Route::post('/jxTellerstandGet', 'jxTellerstandGet');
    Route::post('/jxTellerstandBewaar', 'jxTellerstandBewaar');
});

// INTERNETLINKS
use App\Http\Controllers\InternetlinksController;
    Route::controller(InternetlinksController::class)->group(function () {
    Route::get('/Internetlinks', 'Internetlinks');
    Route::post('/jxInternetGroepen', 'jxInternetGroepen');
    Route::post('/jxGetInternetLinks', 'jxGetInternetLinks');
    Route::post('/jxGetInternetLink', 'jxGetInternetLink');
    Route::post('/jxBewaarInternetLink', 'jxBewaarInternetLink');
    Route::post('/jxBewaarInternetGroep', 'jxBewaarInternetGroep');
    Route::post('/jxVerwijderInternetLink', 'jxVerwijderInternetLink');

});

// PUNTENTELLING
use App\Http\Controllers\PuntentellingController;
    Route::controller(PuntentellingController::class)->group(function () {
    Route::get('Puntentelling', 'Puntentelling');
    Route::get('speloverzicht', 'speloverzicht');
    Route::POSt('/jxSpelInfoMainOverzicht', 'jxSpelInfoMainOverzicht');
    Route::POSt('/jxGetSpelInfo', 'jxGetSpelInfo');
    Route::POSt('/jxBewerkspelronde', 'jxBewerkspelronde');
    Route::POSt('/jxBewerkBewaarSpelronde', 'jxBewerkBewaarSpelronde');
    Route::POSt('/jxBewerkVerwijderSpelronde', 'jxBewerkVerwijderSpelronde');
    Route::POSt('/jxSelecteerSpeler', 'jxSelecteerSpeler');
    Route::POSt('/jxDeselecteerSpeler', 'jxDeselecteerSpeler');
    Route::POSt('/jxSpelmainBewaar', 'jxSpelmainBewaar');
    Route::POSt('/jxVoegSpelerToe', 'jxVoegSpelerToe');
    //speloverzicht
    Route::POSt('/jxSpelOverzicht', 'jxSpelOverzicht');
    
});

Auth::routes();