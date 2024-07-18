@extends('layout.app')

@section('content')
    <div class="row">
        <div class= "col-md-12">
			
            <div class="card card-body">
                <div class="card-title dataToepassingen"><strong><h4>Data toepassingen</h4></strong></div>
				<div class="row">
                    <div class="col-lg-2 card-dashboard text-center">
                            <div class="card">
                                @if (isset(App\Http\Middleware\Instelling::get('app')['zonnepanelen']))
                                    @php
                                        $logo = App\Http\Middleware\Instelling::get('app')['zonnepanelen'];
                                    @endphp
                                    <div
                                        class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">
    
                                        <img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-zonnepanelen"
                                            alt="Zonnepanelen" style="width: 64px;height: auto;">
                                    </div>
                                @endif
    
                                <div class="card-body card-body-dashboard text-center">
                                    <a href="zonnepanelen" class="btn btn-primary stretched-link">Zonnepanelen</a>
                                </div>
                            </div>
                        </div>
                    <div class="col-lg-2 card-dashboard text-center">
                            <div class="card">
                                @if (isset(App\Http\Middleware\Instelling::get('app')['meterstand']))
                                    @php
                                        $logo = App\Http\Middleware\Instelling::get('app')['meterstand'];
                                    @endphp
                                    <div
                                        class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">
    
                                        <img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-meterstand"
                                            alt="meterstand" style="width: 64px;height: auto;">
                                    </div>
                                @endif
    
                                <div class="card-body card-body-dashboard text-center">
                                    <a href="meterstand" class="btn btn-primary stretched-link">Meterstanden</a>
                                </div>
                            </div>
                        </div>
                    {{-- <div class="col-lg-2 card-dashboard text-center">
                            <div class="card">
                                @if (isset(App\Http\Middleware\Instelling::get('app')['tankbeurten']))
                                    @php
                                        $logo = App\Http\Middleware\Instelling::get('app')['tankbeurten'];
                                    @endphp
                                    <div
                                        class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">
    
                                        <img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-tankbeurten"
                                            alt="Tankbeurten" style="width: 64px;height: auto;">
                                    </div>
                                @endif
    
                                <div class="card-body card-body-dashboard text-center">
                                    <a href="https:\\tankbeurten.ok29.online" target="_blank"
                                        class="btn btn-primary stretched-link">Tankbeurten</a>
                                </div>
                            </div>
                        </div> --}}
                    <div class="col-lg-2 card-dashboard text-center">
                            <div class="card">
                                @if (isset(App\Http\Middleware\Instelling::get('app')['aandelen']))
                                    @php
                                        $logo = App\Http\Middleware\Instelling::get('app')['aandelen'];
                                    @endphp
                                    <div
                                        class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">
    
                                        <img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-aandelen" alt="Aandelen"
                                            style="width: 64px;height: auto;">
                                    </div>
                                @endif
    
                                <div class="card-body card-body-dashboard text-center">
                                    <a href="aandelen" target="_self" class="btn btn-primary stretched-link">Aandelen</a>
                                </div>
                            </div>
                        </div>
                    <div class="col-lg-2 card-dashboard text-center">
                            <div class="card">
                                @if (isset(App\Http\Middleware\Instelling::get('app')['tvaanbod']))
                                    @php
                                        $logo = App\Http\Middleware\Instelling::get('app')['tvaanbod'];
                                    @endphp
                                    <div
                                        class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">
    
                                        <img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-tvaanbod" alt="tvaanbod"
                                            style="width: 64px;height: auto;">
                                    </div>
                                @endif
    
                                <div class="card-body card-body-dashboard text-center">
                                    <a href="tvvertoningen" target="_self" class="btn btn-primary stretched-link">TV Aanbod</a>
                                </div>
                            </div>
                        </div>
                    <div class="col-lg-2 card-dashboard text-center">
                            <div class="card">
                                @if (isset(App\Http\Middleware\Instelling::get('app')['financieel']))
                                    @php
                                        $logo = App\Http\Middleware\Instelling::get('app')['financieel'];
                                    @endphp
                                    <div
                                        class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">
                                        <img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-financieel"
                                            alt="financieel" style="width: 64px;height: auto;">
                                    </div>
                                @endif
    
                                <div class="card-body card-body-dashboard text-center">
                                    <a href="rekeningen" target="_self" class="btn btn-primary stretched-link">Financieel</a>
                                </div>
                            </div>
                        </div>
                </div>
			</div>	
				
            <div class="card card-body">
                <div class="card-title dataToepassingen"><strong><h4>Andere toepassingen</h4></strong></div>
				<div class="row">

					<div class="col-lg-2 card-dashboard text-center">
						<div class="card">
							@if (isset(App\Http\Middleware\Instelling::get('app')['internetlinks']))
								@php
									$logo = App\Http\Middleware\Instelling::get('app')['internetlinks'];
								@endphp
								<div
									class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">
										<img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-internetlinks"
										alt="internetlinks" style="width: 64px;height: auto;">
								</div>
							@endif
							<div class="card-body card-body-dashboard text-center">
								<a href="Internetlinks" class="btn btn-primary stretched-link">Internetlinks</a>
							</div>
						</div>
					</div>
					<div class="col-lg-2 card-dashboard text-center">
						<div class="card">
							@if (isset(App\Http\Middleware\Instelling::get('app')['puntentelling']))
								@php
									$logo = App\Http\Middleware\Instelling::get('app')['puntentelling'];
								@endphp
								<div
									class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">
									<img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-puntentelling"
										alt="Puntentelling" style="width: 64px;height: auto;">
								</div>
							@endif

							<div class="card-body card-body-dashboard text-center">
								<a href="Puntentelling" class="btn btn-primary stretched-link">Puntentelling</a>
							</div>
						</div>
					</div>                    
                </div>
            </div>

            <div class="card card-body">
                <div class="card-title dataToepassingen"><strong><h4>Toepassingen op subdomeinen</h4></strong></div>
				<div class="row">
                    <div class="col-lg-2 card-dashboard text-center">
                        <div class="card">
                            @if (isset(App\Http\Middleware\Instelling::get('app')['tankbeurten']))
                                @php
                                    $logo = App\Http\Middleware\Instelling::get('app')['tankbeurten'];
									$url = url()->current();
									$tankbeurten = str_replace("dashboard","tankbeurten",$url);

                                @endphp
                                <div
                                    class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">

                                    <img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-tankbeurten"
                                        alt="Tankbeurten" style="width: 64px;height: auto;">
                                </div>
                            @endif

                            <div class="card-body card-body-dashboard text-center">
                                <a href="{{ URL::to($tankbeurten) }}" target="_blank"
                                    class="btn btn-primary stretched-link">Tankbeurten</a>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-2 card-dashboard text-center">
                        <div class="card">
                            @if (isset(App\Http\Middleware\Instelling::get('app')['lottobingo']))
                                @php
                                    $logo = App\Http\Middleware\Instelling::get('app')['lottobingo'];
									$url = url()->current();
									$lottobingo = str_replace("dashboard","lottobingo",$url);
                                @endphp
                                <div
                                    class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">

                                    <img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-lottobingo"
                                        alt="lottobingo" style="width: 64px;height: auto;">
                                </div>
                            @endif

                            <div class="card-body card-body-dashboard text-center">
                                <a href="{{ URL::to($lottobingo) }}" target="_blank"
                                    class="btn btn-primary stretched-link">Lottobingo</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-2 card-dashboard text-center">
                        <div class="card">
                            @if (isset(App\Http\Middleware\Instelling::get('app')['stamboom']))
                                @php
                                    $logo = App\Http\Middleware\Instelling::get('app')['stamboom'];
									$url = url()->current();
									$stamboom = str_replace("dashboard","stamboom",$url);
                                @endphp
                                <div
                                    class="card-body card-body-dashboard d-flex justify-content-center "style="margin-bottom:-20px;">

                                    <img src="{{ URL::to($logo) }}" class="logo-dashboard" id="logo-stamboom"
                                        alt="stamboom" style="width: 64px;height: auto;">
                                </div>
                            @endif

                            <div class="card-body card-body-dashboard text-center">
                                <a href="{{ URL::to($stamboom) }}" target="_blank"
                                    class="btn btn-primary stretched-link">Stamboom</a>
                            </div>
                        </div>
                    </div>

                </div>
                
            </div>
        </div>
    </div>
@endsection
