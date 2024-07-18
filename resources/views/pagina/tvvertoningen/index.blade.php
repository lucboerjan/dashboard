@extends('layout.app')

@section('content')

    <div id="tvvertoningen">

        <ul>
            <li><a href="#vertoningenIndex"><span>Vertoningen</span></a></li>
            <li><a href="#imdbratingIndex"><span><span>IMDB</span></a></li>
            <li><a href="#zenderIndex"><span><span>Zenders</span></a></li>
        </ul>

        <div id="vertoningenIndex">
            <div class="container">
                <div class="row">
                    <div id="overzichtVertoningen" class="row col-8 me-2"></div>

                    <div id="detailsVertoningen" class="row col-4" style="height:fit-content"></div>
                </div>
            </div>
        </div>

        <div id="imdbratingIndex">
            <div class="container">
                <div class="row">
                    <div id="overzichtImdbRaitings" class="row col-8 me-1"></div>

                    <div id="detailsImdbRaitings" class="row col-4"></div>
                </div>
            </div>
        </div>





        <div id="zenderIndex">
            Zender info
        </div>
    </div>
@endsection
