<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;


//begin toevoegen
 use Auth;
use Carbon\Carbon;
use App\Http\Middleware\Instelling;
use App\Http\Controllers\TaalController;
//einde toevoegen

class DashboardController extends Controller
{
     /**
     * controle op aangemeld
     * toont weergave homepage (indien aangemeld en taal)
     */
    public function index() {
        // zet taal interface
        TaalController::taal();


        // redirect naar login indien niet aangemeld
        if (!Auth::check()) return redirect('login');
        
        // anders toon pagina
        return view('pagina.dashboard.index');
    }
}
