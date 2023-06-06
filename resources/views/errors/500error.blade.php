@extends('layouts.appfix_error')
@section('body')
  @php
    $publicUrl = url('/').'/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/'
  @endphp

  <body>

  <h1 class="sc-error-title sc-padding-large">
    <i class="mdi mdi-alert-outline"></i>
    ERROR 500
  </h1>
  <div class="sc-padding-large">
    <p class="sc-text-semibold">Oops! Something went wrong&hellip;</p>
    <p>There was an error. Please try again later.</p>
    <a href="#" onclick="history.go(-1);return false;">Go back to previous page</a>
  </div>

  <!-- async assets-->
  <script src="{{$publicUrl}}assets/js/vendor/loadjs.min.js"></script>
  <script>
    var html = document.getElementsByTagName('html')[0];
    // ----------- CSS
    let publicUrlAsset = "{{$publicUrl}}";
    loadjs([publicUrlAsset + 'node_modules/uikit/dist/css/uikit.min.css', publicUrlAsset + 'assets/css/error_page.min.css'], {
      success: function () {
        // add id to main stylesheet
        var mainCSS = document.querySelectorAll("link[href='{{$publicUrl}}assets/css/error_page.min.css']");
        mainCSS[0].setAttribute('id', 'main-stylesheet');
        // show page
        setTimeout(function () {
          html.className = html.className.replace(/(?:^|\s)appLoading(?!\S)/g, '');
        }, 100);
        // UIKit & mdi icons CSS
        loadjs(publicUrlAsset + 'assets/css/materialdesignicons.min.css', {
          before: function (path, scriptEl) {
            if (/(^css!|\.css$)/.test(path)) {
              document.head.insertBefore(scriptEl, mainCSS[0])
            }
            return false;
          }
        });
      },
      async: false
    });
    // mdi icons (base64) & google fonts (base64)
    loadjs([publicUrlAsset + 'assets/css/fonts/mdi_fonts.css', publicUrlAsset + 'assets/css/fonts/roboto_base64.css', publicUrlAsset + 'assets/css/fonts/montserrat_base64.css']);
  </script>

  </body>
@endsection
