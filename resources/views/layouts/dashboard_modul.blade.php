@extends('layouts.appfix')
@section('body')
  @php
    $publicUrl 	= url('/').'/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/';
    $assetUrl 	= url('/').'/assets/img/'
  @endphp
  <link href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/css/plugins/datatables.min.css"
        rel="stylesheet"/>
  <link
    href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/node_modules/flatpickr/dist/flatpickr.min.css"
    rel="stylesheet"/>
  <link href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/css/plugins/flatpickr.min.css"
        rel="stylesheet"/>
  <link href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/css/materialdesignicons.min.css"
        rel="stylesheet"/>
  <link
    href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/css/themes/themes_combined.min.css"
    rel="stylesheet"/>
  <link
    href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/css/fonts/sourceCodePro_base64.css"
    rel="stylesheet"/>
  <link href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/css/fonts/roboto_base64.css"
        rel="stylesheet"/>
  <link href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/css/fonts/mdi_fonts.css"
        rel="stylesheet"/>
  <link href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/css/main.min.css"
        rel="stylesheet"/>
  <link
    href="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/css/plugins/style_switcher.min.css"
    rel="stylesheet"/>


  <link href="{{url('/')}}/JS/enhanced-switch-control/css/jquery.enhanced-switch-pingpong.css" rel="stylesheet"/>
  <link href="{{url('/')}}/JS/animated-ios-swtich-netliva/src/css/netliva_switch.css" rel="stylesheet"/>
  <link href="{{url('/')}}/JS/summernote/summernote-lite.css" rel="stylesheet"/>

  <script src="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/js/vendor.min.js"></script>

  <script
    src="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/js/style_switcher.min.js"></script>
  @stack('styles')
  @stack('headScripts')

  <body>
  <script>
    // prevent FOUC
    var html = document.getElementsByTagName('html')[0];
    html.style.backgroundColor = '#f5f5f5';
    document.body.style.visibility = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.apacity = '0';
    document.body.style.maxHeight = "100%";
  </script>
  <header id="sc-header">
    <nav class="uk-navbar uk-navbar-container" data-uk-navbar="mode: click; duration: 360">
      <div class="uk-navbar-left nav-overlay-small uk-margin-right uk-navbar-aside">
        <a href="#" id="sc-sidebar-main-toggle"><i class="mdi mdi-backburger sc-menu-close" style="color: black;"></i><i
            class="mdi mdi-menu sc-menu-open"></i></a>
        <div class="sc-brand uk-visible@s">
          <span style="color:Black;">{{ env('APP_NAME','Laravel') }}</span>
        </div>
      </div>
      {{-- <div class="nav-overlay nav-overlay-small uk-navbar-right uk-flex-1" hidden>
        <a class="uk-navbar-toggle uk-visible@m" data-uk-toggle="target: .nav-overlay; animation: uk-animation-slide-top" href="#"><i class="mdi mdi-close sc-icon-24"></i></a>
        <a class="uk-navbar-toggle uk-hidden@m uk-padding-remove-left" data-uk-toggle="target: .nav-overlay-small; animation: uk-animation-slide-top" href="#"><i class="mdi mdi-close sc-icon-24"></i></a>
      </div> --}}

      <div class="nav-overlay nav-overlay-small uk-navbar-right">
        <ul class="uk-navbar-nav">
          <li>

            @if(!empty($sidebar) )
              @if($sidebar == 'beranda')
                <a href="{{route('home')}}" class="underline-success">
                  Beranda
                </a>
              @else
                <a href="{{route('home')}}">
                  Beranda
                </a>
              @endif
            @endif

          </li>
          {{-- <li>

            @if(!empty($sidebar) )
              @if($sidebar == 'paket_tabungan')
              <a href="{{route('dashboard.paket-tabungan.haji.index')}}" class="underline-success">
                Paket Tabungan
              </a>
              @else
              <a href="{{route('dashboard.paket-tabungan.haji.index')}}">
                Paket Tabungan
              </a>
              @endif
            @endif

          </li> --}}
          <li>
            @if(!empty($sidebar) )
              @if($sidebar == 'pembayaran')
                <a href="{{route('dashboard.master.pembayaran.index')}}" class="underline-success">
                  Pembayaran
                </a>
              @else
                <a href="{{route('dashboard.master.pembayaran.index')}}">
                  Pembayaran
                </a>
          @endif
          @endif
          <li>
          <li class="sc-has-submenu">

            @if(!empty($sidebar) )
              @if($sidebar == 'master')
                <a href="{{route('dashboard.master.faq.index')}}" class="underline-success">
                  Master
                </a>
              @else
                <a href="{{route('dashboard.master.faq.index')}}">
                  Master
                </a>
              @endif
            @endif
          </li>
          {{-- <li >
    <a href="{{route('dashboard.user.index')}}">
      @if(!empty($sidebar) )
        @if($sidebar == 'pengaturan')
          <b>Pengaturan</b>
        @else
          Pengaturan
        @endif
      @endif
    </a>
          </li> --}}
          <li>
            <a href="#"><img src="{{$assetUrl}}user.png" alt=""></a>
            <div class="uk-navbar-dropdown uk-dropdown-small">
              <ul class="uk-nav uk-nav-navbar">
                <li><a href="{{route('dashboard.profil.index')}}">Profile</a></li>
                <li><a href="{{route('dashboard.profil.edit')}}">Edit Profile</a></li>
                <li><a href="{{route('dashboard.profil.change-password')}}">Change Password</a></li>
                <li><a href="{{ route('logout') }}"
                       onclick="event.preventDefault();
								document.getElementById('logout-form').submit();">Log Out</a>
                  <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                    @csrf
                  </form>
                </li>
              </ul>
            </div>
          </li>
        </ul>
        <a href="#" class="sc-js-offcanvas-toggle md-color-white uk-margin-left uk-hidden@l"><i
            class="mdi mdi-menu sc-offcanvas-open"></i><i class="mdi mdi-arrow-right sc-offcanvas-close"></i></a>
      </div>
    </nav>
  </header>
  @if(!empty($sidebar))
    @php
      $sidebarView = 'layouts.sidebar.sidebar_'.$sidebar
    @endphp
    @include($sidebarView)
  @endif
  <div id="sc-page-wrapper">
    <div id="sc-page-content">
      {{-- Blank template --}}
      @yield('content')
    </div>
  </div>

  <!-- async assets-->
  <script>
    // loadjs.js (assets/js/vendor/loadjs.js)
    loadjs = function () {
      function v(a, d) {
        a = a.push ? a : [a];
        var c = [], b = a.length, e = b, g, k;
        for (g = function (a, b) {
          b.length && c.push(a);
          e--;
          e || d(c)
        }; b--;) {
          var h = a[b];
          (k = n[h]) ? g(h, k) : (h = p[h] = p[h] || [], h.push(g))
        }
      }

      function r(a, d) {
        if (a) {
          var c = p[a];
          n[a] = d;
          if (c) for (; c.length;) c[0](a, d), c.splice(0, 1)
        }
      }

      function t(a, d) {
        a.call && (a = {success: a});
        d.length ? (a.error || q)(d) : (a.success || q)(a)
      }

      function u(a, d, c, b) {
        var e = document, g = c.async, k = c.preload;
        try {
          var h = document.createElement("link").relList.supports("preload")
        } catch (y) {
          h = 0
        }
        var l =
          (c.numRetries || 0) + 1, p = c.before || q, m = a.replace(/^(css|img)!/, "");
        b = b || 0;
        if (/(^css!|\.css$)/.test(a)) {
          var n = !0;
          var f = e.createElement("link");
          k && h ? (f.rel = "preload", f.as = "style") : f.rel = "stylesheet";
          f.href = m
        } else /(^img!|\.(png|gif|jpg|svg)$)/.test(a) ? (f = e.createElement("img"), f.src = m) : (f = e.createElement("script"), f.src = a, f.async = void 0 === g ? !0 : g);
        f.onload = f.onerror = f.onbeforeload = function (e) {
          var g = e.type[0];
          if (n && "hideFocus" in f) try {
            f.sheet.cssText.length || (g = "e")
          } catch (w) {
            18 != w.code && (g = "e")
          }
          if ("e" == g &&
            (b += 1, b < l)) return u(a, d, c, b);
          k && h && (f.rel = "stylesheet");
          d(a, g, e.defaultPrevented)
        };
        !1 !== p(a, f) && (n ? e.head.insertBefore(f, document.getElementById("main-stylesheet")) : e.head.appendChild(f))
      }

      function x(a, d, c) {
        a = a.push ? a : [a];
        var b = a.length, e = b, g = [], k;
        var h = function (a, c, e) {
          "e" == c && g.push(a);
          if ("b" == c) if (e) g.push(a); else return;
          b--;
          b || d(g)
        };
        for (k = 0; k < e; k++) u(a[k], h, c)
      }

      function l(a, d, c) {
        var b;
        d && d.trim && (b = d);
        var e = (b ? c : d) || {};
        if (b) {
          if (b in m) throw"LoadJS";
          m[b] = !0
        }
        x(a, function (a) {
          t(e, a);
          r(b, a)
        }, e)
      }

      var q =
        function () {
        }, m = {}, n = {}, p = {};
      l.ready = function (a, d) {
        v(a, function (a) {
          t(d, a)
        });
        return l
      };
      l.done = function (a) {
        r(a, [])
      };
      l.reset = function () {
        m = {};
        n = {};
        p = {}
      };
      l.isDefined = function (a) {
        return a in m
      };
      return l
    }();
  </script>
  <script>
    var html = document.getElementsByTagName('html')[0];
    var publicUrlAsset = "{{$publicUrl}}";

    var scutum = {
      config: {
        gmapsKey: "AIzaSyC2FodI8g-iCz1KHRFE7_4r8MFLA7Zbyhk",
        customScrollbar: !1,
        hiResImages: !0,
        publicUrlAsset: "{{$publicUrl}}",
      }
    };

    loadjs(publicUrlAsset + 'node_modules/uikit/dist/css/uikit.min.css', {
      preload: true
    });

    loadjs(publicUrlAsset + 'assets/js/scutum_common_laravel.min.js', function () {

      scutum.init();
      loadjs(publicUrlAsset + 'assets/js/views/components/modals_dialogs.min.js', {
        success: function () {
          $(function () {
            scutum.components.modalsDialogs.init()
          });
        }
      })
      // show page
      setTimeout(function () {
        // clear styles (FOUC)
        $(html).css({
          'backgroundColor': '',
        });
        $('body').css({
          'visibility': '',
          'overflow': '',
          'apacity': '',
          'maxHeight': ''
        });
      }, 100);
      // style switcher

    });


    loadjs([publicUrlAsset + 'assets/js/style_switcher.min.js', publicUrlAsset + 'assets/css/plugins/style_switcher.min.css'], {
      success: function () {
        $(function () {
          scutum.styleSwitcher();
        });
      }
    });


  </script>


  <div id="sc-style-switcher">
    <a href="#" class="sc-sSw-toggle"><i class="mdi mdi-tune"></i></a>
    <p class="sc-text-semibold uk-margin-top-remove uk-margin-bottom">Themes</p>
    <ul class="sc-sSw-theme-switcher">
      <li class="active">
        <a href="#" class="sc-sSw-theme-switch sc-sW-theme-default" data-theme="">
          <span class="sc-sSw-theme-switch-color-1"></span>
          <span class="sc-sSw-theme-switch-color-2"></span>
        </a>
      </li>
      <li>
        <a href="#" class="sc-sSw-theme-switch sc-sW-theme-a" data-theme="sc-theme-a">
          <span class="sc-sSw-theme-switch-color-1"></span>
          <span class="sc-sSw-theme-switch-color-2"></span>
        </a>
      </li>
      <li>
        <a href="#" class="sc-sSw-theme-switch sc-sW-theme-b" data-theme="sc-theme-b">
          <span class="sc-sSw-theme-switch-color-1"></span>
          <span class="sc-sSw-theme-switch-color-2"></span>
        </a>
      </li>
      <li>
        <a href="#" class="sc-sSw-theme-switch sc-sW-theme-c" data-theme="sc-theme-c">
          <span class="sc-sSw-theme-switch-color-1"></span>
          <span class="sc-sSw-theme-switch-color-2"></span>
        </a>
      </li>
      <li>
        <a href="#" class="sc-sSw-theme-switch sc-sW-theme-d" data-theme="sc-theme-d">
          <span class="sc-sSw-theme-switch-color-1"></span>
          <span class="sc-sSw-theme-switch-color-2"></span>
        </a>
      </li>
      <li>
        <a href="#" class="sc-sSw-theme-switch sc-sW-theme-e" data-theme="sc-theme-e">
          <span class="sc-sSw-theme-switch-color-1"></span>
          <span class="sc-sSw-theme-switch-color-2"></span>
        </a>
      </li>
      <li>
        <a href="#" class="sc-sSw-theme-switch sc-sW-theme-f" data-theme="sc-theme-f">
          <span class="sc-sSw-theme-switch-color-1"></span>
          <span class="sc-sSw-theme-switch-color-2"></span>
        </a>
      </li>
      <li>
        <a href="#" class="sc-sSw-theme-switch sc-sW-theme-g" data-theme="sc-theme-g">
          <span class="sc-sSw-theme-switch-color-1"></span>
          <span class="sc-sSw-theme-switch-color-2"></span>
        </a>
      </li>
      <li>
        <a href="#" class="sc-sSw-theme-switch sc-sW-theme-h" data-theme="sc-theme-h">
          <span class="sc-sSw-theme-switch-color-1"></span>
          <span class="sc-sSw-theme-switch-color-2"></span>
        </a>
      </li>
    </ul>
    <p class="sc-text-semibold uk-margin-large-top uk-margin-bottom">Main Menu</p>
    <div class="uk-flex uk-flex-middle uk-margin-small-bottom">
      <input type="checkbox" id="sc-menu-scroll-to-active" data-sc-icheck><label for="sc-menu-scroll-to-active">Scroll
        to active</label>
    </div>
    <div class="uk-flex uk-flex-middle">
      <input type="checkbox" id="sc-menu-accordion-mode" data-sc-icheck><label for="sc-menu-accordion-mode">Accordion
        mode</label>
    </div>
  </div>
  </body>
  <script
    src="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/node_modules/flatpickr/dist/plugins/rangePlugin.js"></script>
  <script
    src="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/node_modules/flatpickr/dist/plugins/confirmDate/confirmDate.js"></script>
  <script
    src="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/node_modules/flatpickr/dist/flatpickr.min.js"></script>
  <script
    src="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/node_modules/datatables.net-responsive/js/dataTables.responsive.min.js"></script>
  <script
    src="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/node_modules/datatables.net/js/jquery.dataTables.min.js"></script>
  <script
    src="{{url('/')}}/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/assets/js/vendor/datatables/dataTables.uikit.min.js"></script>


  <script src="{{url('/')}}/JS/vue/dist/vue.js"></script>
  <script src="{{url('/')}}/JS/vue/dist/vue.min.js"></script>
  <script src="{{url('/')}}/JS/axios/dist/axios.js"></script>
  <script src="{{url('/')}}/JS/axios/dist/axios.min.js"></script>
  <script src="{{url('/')}}/JS/enhanced-switch-control/js/jquery.enhanced-switch.js"></script>
  <script src="{{url('/')}}/JS/animated-ios-swtich-netliva/src/js/netliva_switch.js"></script>



  @stack('scripts')
@endsection
