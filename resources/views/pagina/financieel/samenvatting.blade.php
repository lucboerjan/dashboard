@extends('layout.app');

@section('content')
<style>
    table {
        border-collapse: collapse;
        width: 100%;

    }
    th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2;
    }
    .footer {
        font-weight: bold;
    }
</style>

<div id="samenvattingIndex" class="container-fluid">
    <div class="row">
        <div id="tableContainer" class="col">
            Hier komt de samenvatting van de rekeningen
           
        </div>    
    </div>
</div>
    
@endsection
