@extends('layout.app');

@section('content')
<div id="beheerOmschrijvingenIndex" class="container-fluid">
    <h1>Beheren omschrijvingen transacties</h1>
        <hr>

        <div class="row mb-5">
            <div class="col-5">
                <div class="input-group">
                    <input type="text" class="form-control" id="transactieOmschrijvingZoek">
                    <button class="btn btn-primary" id="transactieOmschrijvingFilter">
                        <i class="bi bi-search"></i>
                    </button>
                    <button class="btn btn-secondary" id="transactieOmschrijvingZoekAnnuleer">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
            <div class="col-7">
                <div class="btn-group btn-group-toggle" data-toggle="buttons">
                    <div id="togglebuttoninkomsten" class="image inkomsten" style="display: none">Inkomsten</div>
                    <div id="togglebuttonuitgaven" class="image uitgaven">Uitgaven</div>
                </div>  
                <button class="btn btn-primary float-end" id="transactieOmschrijvingNieuw" type="button">
                    <i class="bi bi-journal-plus"></i>
                    Omschrijving toevoegen
                </button>
                <button class="btn btn-primary float-end me-1" id="transactieOmschrijvingMerge" type="button" disabled>
                    <i class="bi bi-journals"></i>
                    Omschrijvingen samenvoegen 
                </button>
            </div>
        </div>
        <div class="row mb-3" id="transactieOmschrijvingLijst"></div>
</div>

@endsection