@extends('layout.app');

@section('content')

        <div id="rekeningIndex">
            <div class="container">
                <div class="row">
                    <div id="overzichtRekeningen" class="row col-7 me-1">
                        <ul id="rekeningOverzichtLijst">

                            @if (count($rekeningOverzicht) == 0)
                                <div class="alert alert-info">
                                    <h4 class="alert-heading">
                                        Rekeningen
                                    </h4>
                                    <p>
                                        Geen rekeningen in database aangetroffen. Maak een nieuwe rekening aan...
                                    </p>
                                </div>
                            @else
                                {{-- <ul id="rekeningOverzichtLijst"> --}}
                                @foreach ($rekeningOverzicht as $rekening)
                                    @php
                                        $saldo = $rekening->saldo ? $rekening->saldo : '0.00';
                                    @endphp
                                    <li class="mb-2" data-rid="{{ $rekening->id }}" data-vnr="{{ $rekening->volgnummer }}">
                                        <div class="card">
                                            <div class="card-header">
                                                <div class=containerRekeningen>




                                                    <div class="box">
                                                        <h5>
                                                            <i class="bi bi-arrows-expand rekeningOverzichtSorteer"></i>
                                                            &euro;
                                                            {{ number_format($saldo, $decimals = 2, $decimals_seperator = ',', $thousands_separator = '.') }}
                                                        </h5>
                                                    </div>
                                                    <div class="box">
                                                        <strong>
                                                            {{ $rekening->referentie }}

                                                        </strong><br>
                                                        {{ $rekening->omschrijving }}
                                                    </div>


                                                    <div class="float-end">
                                                    <div class="btn-group mr-2" role="group"> 
                                                        <button class="btn btn-primary rekeningOverzichtBewerk rekeningAction"
                                                            type="button">
                                                            <i class="bi bi-pencil"></i>
                                                        </button>
                                                        <button class="btn btn-warning rekeningOverzichtVerwijder rekeningAction"
                                                            type="button">
                                                            <i class="bi bi-scissors"></i>
                                                        </button>
                                                        <button class="btn btn-success transactieOverzicht rekeningAction" id="rid_{{ $rekening->id }}"
                                                            type="button">
                                                            <i class="bi i bi-rocket-takeoff"></i>
                                                        </button>
                                                        {{-- <a href="/transactieOverzicht/{{ $rekening->id }}/0" class="btn btn-primary rekeningAction me-1">
                                                            <i class="bi bi-rocket-takeoff"></i>
                                                        </a> --}}
                                                    </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </li>
                                @endforeach
                            @endif

                        </ul>


                    </div>

                    <div id="detailsRekening" class="row col-5">
                        <div class="card">
                            <div class="alert alert-dark mt-3">
                                @php
                                    $totaalBedrag = $totaalBedrag ? $totaalBedrag : '0.00';
                                    $saldoVerschil = $saldoVerschil ? $saldoVerschil : '0.00';
                                @endphp
                                Totaal (# vorige maand) 
                                &euro;
                                {{ number_format($totaalBedrag, $decimals = 2, $decimals_seperator = ',', $thousands_separator = '.') }}
                                ( € {{ number_format($saldoVerschil, $decimals = 2, $decimals_seperator = ',', $thousands_separator = '.') }})
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
@endsection
