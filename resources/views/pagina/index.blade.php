@extends('layout.app')

@section('content')
    <h1>{{ __('boodschappen.titel') }}</h1>
    <p>taal: {{ session()->get('taal') }}</p>
@endsection