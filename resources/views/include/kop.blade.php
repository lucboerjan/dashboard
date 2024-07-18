<nav class="navbar navbar-expand-md navbar-light bg-white shadow-sm">
    <div class="container">
        <a class="navbar-brand" href="{{ url('/') }}">
            @if(isset(App\Http\Middleware\Instelling::get('app')['logo']))
                @php
                    $logo = App\Http\Middleware\Instelling::get('app')['logo'];
                @endphp
                <img src="{{ URL::to($logo) }}" id="logo">
            @endif
            {{ config('app.name', 'Laravel') }}
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="{{ __('Toggle navigation') }}">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <!-- Left Side Of Navbar -->
            <ul class="navbar-nav me-auto" id="financieelMenu" style="display:none;">
                @auth
                    <!-- knop Zonnepanelen -->
                    {{-- @if (Auth::user()->level & 0x00) --}}
                        <li class="nav-item">
                            <a class="nav-link" href="../../rekeningen" role="button">
                                <i class="bi bi-table"></i>
                                Rekeningen
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../../samenvatting" role="button">
                                <i class="bi bi-file-spreadsheet"></i>
                                Samenvatting<br>rekeningen
                            </a>
                        </li>
                        
                        <li class="nav-item">
                            <a class="nav-link" href="../../statistiek" role="button">
                                <i class="bi bi-graph-up"></i>
                                Statistiek
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../../transactiejaaroverzicht" role="button">
                                <i class="bi bi-file-spreadsheet"></i>
                                Samenvatting<br>transisties
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../../transactiebeheeromschrijvingen" role="button">
                                <i class="bi bi-wrench"></i>
                                Normaliseren<br>omschrijvingen
                            </a>
                        </li>
                        
                    {{-- @endif --}}

                    
                @endauth
            </ul>
            <ul class="navbar-nav me-auto" id="puntentellingMenu" style="display:none;">
                @auth
                    {{-- @if (Auth::user()->level & 0x00) --}}
                        <li class="nav-item">
                            <a class="nav-link" href="../../Puntentelling" role="button">
                                <i class="bi bi-table"></i>
                                Spelinfo
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../../speloverzicht" role="button">
                                <i class="bi bi-file-spreadsheet"></i>
                                Speloverzicht
                            </a>
                        </li>
                        
                       
                    
                @endauth
            </ul>

            <ul class="navbar-nav me-auto" id="filmMenu" style="display:none;">
                @auth
                    {{-- @if (Auth::user()->level & 0x00) --}}
                        <li class="nav-item">
                            <a class="nav-link" href="../../tvvertoningen" role="button">
                                <i class="bi bi-table"></i>
                                TV Vertongen
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../../imdblijst" role="button">
                                <i class="bi bi-table"></i>
                                IMDB lijst
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../../filmlijst" role="button">
                                <i class="bi bi-table"></i>
                                Filmlijst
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="../../tvzenders" role="button">
                                <i class="bi bi-file-spreadsheet"></i>
                                Zenders
                            </a>
                        </li>
                        
                       
                    
                @endauth
            </ul>



            <ul class="navbar-nav me-auto" id="tellerstandMenu" style="display:none;">
                <li class="nav-item">
                    <a class="nav-link" href="../../meterstand" role="button">
                        <i class="bi bi-table"></i>
                            Tellerstanden
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../../overzicht" role="button">
                        <i class="bi bi-file-spreadsheet"></i>
                            Overzicht
                    </a>
                </li>
            </ul>

            <!-- Right Side Of Navbar -->
            <ul class="navbar-nav ms-auto">
                <!-- Authentication Links -->
                @auth
                    <li class="nav-item dropdown">
                        <a id="navbarDropdown" class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-pre>
                            {{ Auth::user()->name }}
                        </a>

                        <div class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <a class="dropdown-item" href="{{ route('logout') }}"
                                onclick="event.preventDefault();
                                                document.getElementById('logout-form').submit();">
                                {{ __('authenticatie.logout') }}
                            </a>

                            <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
                                @csrf
                            </form>
                        </div>
                    </li>
                @endauth

               <!--  DROPDOWN TALEN 

                <li class="nav-item dropdown">
                    <a id="navbarDropdownTalen" class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-pre>
                        {{ __('boodschappen.taal') }}
                    </a>

                    <div class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownTalen">
                        @foreach (App\Http\Middleware\Instelling::get('talen') as $taal => $taalOpties)
                            <a class="nav-link" href="/taal/{{ $taal }}">
                                <img src="{{ URL::to($taalOpties[1]) }}">
                                {{ $taalOpties[0] }}
                            </a>
                        @endforeach
                    </div>
                </li>-->

            </ul>
        </div>
    </div>
</nav>