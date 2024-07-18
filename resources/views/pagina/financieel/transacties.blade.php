@extends('layout.app');

@section('content')
        <div id="transactieIndex">
            <div style="display:none" id="rekeningID">{{ $rekeningID }}</div>

            <div class="container">
                <div class="row">
                    <div id="overzichtTransacties" class="card card-body col-lg-8">
                        
                    </div>

                    <div class="col-lg-4">
                        <div class="card card-body mb-3" style="height:fit-content">
                            <div id="rekeningInfo">
                                Rekeninginfo
                            </div>
                        </div>
                        <div class="card card-body">
                            <div id="transactieDetails">
                                <!-- Content for transactieDetails -->
                            </div>    
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
