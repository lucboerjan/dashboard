@extends('layout.app')

@section('content')
    <div id="transactiejaaroverzichtIndex" class="container">
        <div class="row align-items-center mb-3">
            <div class="col-auto">
                <h5>Selecteer het jaar voor de samenvatting</h5>
            </div>
            <div class="col-auto">
                <select name="jaar" id="jaarSelectie" class="form-control">
                    @foreach ($jaren as $jaar)
                        <option value="{{ $jaar->jaar }}">{{ $jaar->jaar }}</option>
                    @endforeach
                </select>
            </div>
        </div>
        <div class="row mb-3 transactieJaaroverzichtTabel" id="">
            <table id="inkomstenTabel"></table>
            
        </div>
        <div class="row mb-3 transactieJaaroverzichtTabel" id="">
            <table id="uitgavenTabel"></table>
        </div>
        <div class="row mb-3 transactieJaaroverzichtTabel" id="">
            <table id="saldoTabel"></table>
        </div>
    </div>
@endsection
