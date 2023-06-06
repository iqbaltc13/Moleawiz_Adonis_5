@extends('layouts.appfix')
@section('body')
  @php
    $publicUrl = url('/').'/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/'
  @endphp
  <body>
  <style>
    .appLoading {
      background: #bdbdbd
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

  <!-- UIkit js -->
  <script src="{{$publicUrl}}assets/js/uikit.min.js"></script>

  <div class="uk-flex uk-flex-center uk-flex-middle sc-login-page-wrapper">
    <div class="uk-width-2-3@s uk-width-1-2@m uk-width-1-3@l uk-width-1-4@xl">
      <div class="uk-card">
        <div class="uk-card-body">
          <div class="sc-login-page-logo">
            <img src="{{$publicUrl}}assets/img/logo_alt.png" alt="">
          </div>

          <div id="sc-register-form" class="sc-toggle-login-register">
            <form method="POST" action="{{ route('register') }}">
              @csrf
              <div class="sc-login-page-inner">
                <div class="uk-margin-medium">
                  <label for="sc-register-name">Name</label>
                  <input id="sc-register-name" name="name" type="text" class="uk-input" required autocomplete="name"
                         autofocus data-sc-input>
                  @error('name')
                  <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                  @enderror
                </div>
                <div class="uk-margin-medium">
                  <label for="sc-register-username">Username</label>
                  <input id="sc-register-username" name="username" onpaste="return false;" type="text" class="uk-input"
                         value="{{ old('name') }}" required data-sc-input>
                  @error('username')
                  <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                  @enderror
                </div>

                <div class="uk-margin-medium">
                  <label for="sc-register-email">Email</label>
                  <input id="sc-register-email" name="email" type="email" class="uk-input" data-sc-input
                         value="{{ old('email') }}" required autocomplete="email">
                  @error('email')
                  <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                  @enderror
                </div>
                <div class="uk-margin-medium">
                  <label for="sc-register-password">Password</label>
                  <input id="sc-register-password" type="password" class="uk-input" data-sc-input name="password"
                         required autocomplete="new-password">
                  @error('password')
                  <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                  @enderror
                </div>
                <div class="uk-margin-medium">
                  <label for="sc-register-confirm-password">Confirm Password</label>
                  <input id="sc-register-confirm-password" type="password" class="uk-input" data-sc-input
                         name="password_confirmation" required autocomplete="new-password">
                </div>
                <div class="uk-margin-large-top">
                  <button type="submit" class="sc-button sc-button-large sc-button-block sc-button-primary">Sign Up
                  </button>
                  <div class="uk-margin-large-top uk-flex uk-flex-middle uk-flex-center">
                    <a href="{{ route('login') }}" class="sc-text-semibold">Back to login form</a>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div id="sc-password-form" class="sc-toggle-login-password" hidden>
            <div class="sc-login-page-inner">
              <div class="uk-margin-medium">
                Please enter your email address. You will receive a link to reset your password.
              </div>
              <div class="uk-margin-medium">
                <label for="sc-reset-email">Email</label>
                <input id="sc-reset-email" type="text" class="uk-input" data-sc-input>
              </div>
              <div class="uk-margin-large-top">
                <button class="sc-button sc-button-large sc-button-block sc-button-primary">Reset Password</button>
                <div class="uk-margin-large-top uk-flex uk-flex-middle uk-flex-center">
                  <a href="#" class="sc-text-semibold"
                     data-uk-toggle="target: .sc-toggle-login-password; animation: uk-animation-scale-up">Back to login
                    form</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- async assets-->
  <script src="{{$publicUrl}}assets/js/vendor/loadjs.min.js"></script>
  <script>
    var html = document.getElementsByTagName('html')[0];
    var publicUrlAsset = "{{$publicUrl}}";
    // ----------- CSS
    loadjs([publicUrlAsset + 'node_modules/uikit/dist/css/uikit.min.css', publicUrlAsset + 'assets/css/login_page.min.css'], {
      success: function () {
        let publicUrlAsset = "{{$publicUrl}}";
        // add id to main stylesheet
        let linkMainCss = publicUrlAsset + 'assets/css/login_page.min.css';

        var mainCSS = document.querySelectorAll("link[href='{{$publicUrl}}assets/css/login_page.min.css']");
        mainCSS[0].setAttribute('id', 'main-stylesheet');
        // show page
        setTimeout(function () {
          html.className = html.className.replace(/(?:^|\s)appLoading(?!\S)/g, '');
        }, 100);
        // mdi icons CSS
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
    loadjs([publicUrlAsset + 'assets/css/fonts/mdi_fonts.css', publicUrlAsset + 'assets/css/fonts/roboto_base64.css']);
    // vendor
    loadjs(publicUrlAsset + 'assets/js/vendor.min.js', {
      success: function () {
        // scutum common functions/helpers
        loadjs(publicUrlAsset + 'assets/js/scutum_common_laravel.min.js', {
          success: function () {
            scutum.init();
          }
        });
      }
    });
  </script>

  </body>
@endsection

