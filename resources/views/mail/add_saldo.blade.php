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
  <img src="{{ $message->embed(public_path() . '/assets/img/aset_penambahan_saldo.png') }}" width="40%" height="40%"
       style="padding-left:170px"/>
  <br/>
  <p>

    Selamat <b>{{$dataParse->nama_nasabah}}</b>,
  </p>
  <p>
    Penambahan saldo perencanaan dana kamu telah terverifikasi pada
    tanggal <b>{{$dataParse->tanggal_transaksi}}</b>. Saat ini saldo perencanaan dana kamu
    sebesar <b>{{$dataParse->nominal_baku_transaksi}}</b>. Semangat, impian kamu untuk beribadah ke tanah suci
    semakin dekat. semoga Allah SWT senantiasa memudahkan setiap langkah kamu
    menjadi tamuNya di Baitullah. #StartYourHijrah lebih aman dan nyaman bersama
    MyDuma.
  </p>

  <p>Salam, </p>
  <p>MyDuma Team.</p>



  @include('beautymail::templates.sunny.contentEnd')



@stop
