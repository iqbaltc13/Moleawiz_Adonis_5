@extends('beautymail::templates.sunny')

@section('content')

  @include ('beautymail::templates.sunny.heading' , [
      'heading' => '',
      'level' => 'h1',
  ])

  @include('beautymail::templates.sunny.contentStart')

  <img src="{{ $message->embed(public_path() . '/assets/img/logo-duma-v2.png') }}" width="25%" height="25%"
       style="padding-left:200px"/>
  <br/>
  <br/>
  <br/>
  <img src="{{ $message->embed(public_path() . '/assets/img/assalamualaikum_duma_friends.png') }}" width="80%"
       height="80%" style="padding-left:60px"/>
  <br/>
  <br/>
  <img src="{{ $message->embed(public_path() . '/assets/img/aset_setoran_awal.png') }}" width="40%" height="40%"
       style="padding-left:170px"/>
  <br/>
  <p>

    Selamat <b>{{$dataParse->nama_nasabah}}</b>,
  </p>
  <p>
    Setoran awal kamu sudah kami terima. Dana perencanaan
    ibadah #DumaFriends akan aman bersama MyDuma di bawah pengelolaan Bank Mega
    Syariah. Tetap istiqomah dalam menabung untuk ibadah ke tanah suci ya, semoga
    Allah SWT memudahkan setiap langkah #DumaFriends menuju Baitullah.
  </p>

  <p>Salam, </p>
  <p>MyDuma Team.</p>


  @include('beautymail::templates.sunny.contentEnd')




@stop
