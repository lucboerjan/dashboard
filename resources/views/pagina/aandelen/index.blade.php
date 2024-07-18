@extends('layout.app')

@section('content')
{{-- <link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
<script src="https://code.jquery.com/jquery-3.6.0.js"></script>
<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script> --}}

<div id="aandelenIndex">  

    
        <ul>
            <li><a href="#fondenOverzicht"><span>Fondsen</span></a></li>
            <li><a href="#dataVerwerking"><span><span>Dataverwerking</span></a></li>
            <li><a href="#koersGrafiek"><span><span>Koersgrafiek</span></a></li>
        </ul>

        <div id="fondenOverzicht">
           
                
        </div>

        <div id="dataVerwerking">
        </div>

        <div id="koersGrafiek">
            <h5><strong>Hier komt een lijngrafiek</strong></h5>
        </div>
    </div>  

    
@endsection
