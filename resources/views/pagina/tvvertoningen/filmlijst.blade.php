@extends('layout.app')

@section('content')
    <div id="filmLijstIndex">
        <h1>{{ __('boodschappen.filmlijst_titel') }}</h1>
        <hr>

        <div class="row mb-5">
            <div class="col-6">
                <div class="input-group">
                    <input type="text" class="form-control" id="filmlijstZoek">
                    <button class="btn btn-primary" id="filmlijstFilter">
                        <i class="bi bi-search"></i>
                    </button>
                    <button class="btn btn-secondary" id="filmlijstZoekAnnuleer">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
            <div class="col-6">
                <button class="btn btn-primary float-end me-1" id="filmlijstMerge" type="button" disabled>
                    <i class="bi bi-person-bounding-box"></i>
                    {{ __('boodschappen.filmlijst_samenvoegen') }}
                </button>
            </div>
        </div>
        <div class="row mb-3" id="inhoudFilmLijst"></div>
    </div>
@endsection