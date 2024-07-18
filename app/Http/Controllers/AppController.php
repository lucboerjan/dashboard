<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

// -- toevoegen begin --
use Auth;
use App\Http\Middleware\Instelling;
use App\Http\Controllers\TaalController;
// -- toevoegen einde --

class AppController extends Controller
{
    /**
     * staat in voor zetten taal interface
     * en controle op aangemeld
     * toont weergave homepage (indien aangemeld en taal)
     */
    public function index() {
        // zet taal interface
        TaalController::taal();

        // redirect naar login indien niet aangemeld
        if (!Auth::check()) return redirect('login');

        // anders toon pagina
        return view('pagina.index');
    }
}