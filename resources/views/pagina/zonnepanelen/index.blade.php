@extends('layout.app')

@section('content')
    <div id="zonnepanelenIndex">
        <div class="container">
            <div class="row">
                <div id="" class="row col-4">
                    <div class="card card-body me-1 card-zp" id="overzichtDagelijks">
                    </div>    
                </div>
                <div id="overzichtJaarlijks" class="row col-8">
                    <div class="card card-body card-zp"  style="height:min-content;">
                        <div id="headerOverzicht">
                        
                        </div>
                    </div>    
                    <div id="jaarOverzicht" class="card card-body card-zp">
                        {{-- <div id="jaarOverzicht">
                            
                        </div> --}}
                    </div>    
                </div>
            </div>
        </div>
    </div>
@endsection