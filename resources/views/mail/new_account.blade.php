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
  <img src="{{ $message->embed(public_path() . '/assets/img/aset_selamat_datang.png') }}" width="40%" height="40%"
       style="padding-left:170px"/>
  <br/>
  <p>

    Selamat datang <b>{{$dataParse->nama_nasabah}}</b>!
  </p>
  <p>
    Kamu telah menjadi bagian dari keluarga besar
    MyDuma. Sebuah platform digital layanan perencanaan dana dan pelaksanaan
    Umrah/Haji pertama di Indonesia. Bekerjasama dengan Bank Mega Syariah, MyDuma
    akan memberikan pelayanan terbaik untuk persiapan hingga pelaksanaan ibadah
    Kamu.
  </p>
  <br/>
  <p>
    Dengan melakukan registrasi di akun MyDuma artinya kamu sudah memulai
    langkah awal untuk usaha penyempurnaan agama. Yuk, wujudkan ibadah impian kamu
    dengan mulai melakukan setoran awal di MyDuma. #NiatinAjaDulu, semoga Allah SWT
    senantiasa memudahkan ikhtiar kamu untuk menjadi tamuNya di Baitullah.
    #StartYourHijrah lebih aman dan nyaman bersama MyDuma.
  </p>
  <p>Salam, </p>
  <p>MyDuma Team.</p>

  @include('beautymail::templates.sunny.contentEnd')




@stop
