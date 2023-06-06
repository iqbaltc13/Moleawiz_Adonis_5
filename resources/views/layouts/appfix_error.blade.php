<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  @php
    $publicUrl = url('/').'/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/'
  @endphp
  <meta charset="UTF-8">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>{{ config('app.name', 'Starter Project Artcak') }} @yield('title') Error Page</title>
  <meta name="description" content="Scutum Admin Template"/>

  <link rel="apple-touch-icon" sizes="180x180" href="{{$publicUrl}}assets/img/fav/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="{{$publicUrl}}assets/img/fav/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="{{$publicUrl}}assets/img/fav/favicon-16x16.png">
  <link rel="mask-icon" href="{{$publicUrl}}assets/img/fav/safari-pinned-tab.svg" color="#5bbad5">

  <link rel="manifest" href="{{$publicUrl}}manifest.json">
  <meta name="theme-color" content="#607D8B">

  <style>
    .appLoading {
      background: #f5f5f5
    }

    .appLoading body {
      visibility: hidden;
      overflow: hidden;
      max-height: 100%;
    }
  </style>
  <script>
    var html = document.getElementsByTagName('html')[0];
    html.className += ' appLoading';
  </script>

  <!-- polyfills -->
  <script src="{{$publicUrl}}assets/js/vendor/polyfills.min.js"></script>

  <!-- UIKit js -->
  <script src="{{$publicUrl}}assets/js/uikit.min.js"></script>
</head>
@yield('body')
</html>
