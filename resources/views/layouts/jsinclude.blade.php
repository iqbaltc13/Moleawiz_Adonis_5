<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
<script>
  var scutum = {
    config: {
      gmapsKey: "AIzaSyC2FodI8g-iCz1KHRFE7_4r8MFLA7Zbyhk",
      customScrollbar: !1,
      hiResImages: !0,
      publicUrlAsset: "{{$publicUrl}}",
    }
  };
  scutum.var_body = $("body"), scutum.$html = $("html"), scutum.$doc = $(document), scutum.$win = $(window), scutum.$sidebarMain = $("#sc-sidebar-main"), scutum.$offcanvas = $("#sc-offcanvas"), scutum.$toolbar = $("#sc-toolbar"), scutum.$header = $("#sc-header"), scutum.$topBar = $("#sc-page-top-bar"), scutum.$pageContent = $("#sc-page-content"), scutum.$pageWrapper = $("#sc-page-wrapper"), scutum.easingSwiftOut = [.55, 0, .1, 1], scutum.forms = {}, scutum.pages = {}, scutum.plugins = {}, scutum.components = {}, scutum.init = function () {
    scutum.helpers.init(), scutum.sidebarMain.init(), scutum.cards.init(), scutum.forms.common.init(), scutum.toolbar.init(), scutum.headerMain.init(), scutum.offcanvas.init(), (document.documentMode || /Edge/.test(navigator.userAgent)) && $("ul.sc-js-edge-fix").each(function () {
      $(this).parent().prepend($(this).detach())
    })
  }, scutum.bundles = {
    billboard: [scutum.config.publicUrlAsset + "node_modules/billboard.js/dist/billboard.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/billboard.min.css"],
    d3: [scutum.config.publicUrlAsset + "node_modules/d3/dist/d3.min.js"],
    chartjs: [scutum.config.publicUrlAsset + "node_modules/chart.js/dist/Chart.min.js"],
    accounting: [scutum.config.publicUrlAsset + "assets/js/vendor/accounting.min.js"],
    autosize: [scutum.config.publicUrlAsset + "assets/js/vendor/autosize.min.js"],
    chained: [scutum.config.publicUrlAsset + "assets/js/vendor/jquery.chained.min.js"],
    creditCardValidator: [scutum.config.publicUrlAsset + "node_modules/jQuery-CreditCardValidator/jquery.creditCardValidator.js"],
    //daterangepicker: [scutum.config.publicUrlAsset+"node_modules/jquery-date-range-picker/dist/jquery.daterangepicker.min.js", scutum.config.publicUrlAsset+"assets/css/plugins/daterangepicker.min.css"],
    flatpickr: [scutum.config.publicUrlAsset + "node_modules/flatpickr/dist/flatpickr.min.js", scutum.config.publicUrlAsset + "node_modules/flatpickr/dist/plugins/confirmDate/confirmDate.js", scutum.config.publicUrlAsset + "node_modules/flatpickr/dist/plugins/rangePlugin.js", scutum.config.publicUrlAsset + "node_modules/flatpickr/dist/flatpickr.min.css", scutum.config.publicUrlAsset + "assets/css/plugins/flatpickr.min.css"],
    icheck: [scutum.config.publicUrlAsset + "node_modules/icheck/icheck.min.js"],
    inputmask: [scutum.config.publicUrlAsset + "node_modules/inputmask/dist/min/jquery.inputmask.bundle.min.js"],
    multiSelect: [scutum.config.publicUrlAsset + "assets/js/vendor/jquery.multi-select.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/multiselect.min.css"],
    rangeSlider: [scutum.config.publicUrlAsset + "node_modules/ion-rangeslider/js/ion.rangeSlider.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/range_slider.min.css"],
    parsleyJS: [scutum.config.publicUrlAsset + "node_modules/parsleyjs/dist/parsley.min.js"],
    raty: [scutum.config.publicUrlAsset + "node_modules/raty-js/lib/jquery.raty.js", scutum.config.publicUrlAsset + "assets/css/plugins/raty.min.css"],
    select2: [scutum.config.publicUrlAsset + "node_modules/select2/dist/js/select2.min.js", scutum.config.publicUrlAsset + "node_modules/select2/dist/css/select2.min.css", scutum.config.publicUrlAsset + "assets/css/plugins/select2.min.css"],
    steps: [scutum.config.publicUrlAsset + "assets/js/vendor/jquery.steps.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/steps.min.css"],
    switchery: [scutum.config.publicUrlAsset + "node_modules/switchery/dist/switchery.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/switchery.min.css"],
    tinymce: [scutum.config.publicUrlAsset + "node_modules/tinymce/tinymce.min.js"],
    ckeditor: [scutum.config.publicUrlAsset + "assets/js/vendor/ckeditor/build/ckeditor.js"],
    backbone: [scutum.config.publicUrlAsset + "node_modules/backbone/backbone-min.js"],
    chancejs: [scutum.config.publicUrlAsset + "assets/js/vendor/chance.min.js"],
    clipboard: [scutum.config.publicUrlAsset + "node_modules/clipboard/dist/clipboard.min.js"],
    codemirror: [scutum.config.publicUrlAsset + "node_modules/codemirror/lib/codemirror.js", scutum.config.publicUrlAsset + "node_modules/codemirror/lib/codemirror.css", scutum.config.publicUrlAsset + "assets/css/plugins/codemirror.min.css", scutum.config.publicUrlAsset + "node_modules/codemirror/theme/material.css"],
    "codemirror-modes": [scutum.config.publicUrlAsset + "node_modules/codemirror/mode/htmlmixed/htmlmixed.js", scutum.config.publicUrlAsset + "node_modules/codemirror/mode/xml/xml.js", scutum.config.publicUrlAsset + "node_modules/codemirror/mode/php/php.js", scutum.config.publicUrlAsset + "node_modules/codemirror/mode/clike/clike.js", scutum.config.publicUrlAsset + "node_modules/codemirror/mode/javascript/javascript.js"],
    "codemirror-addons": [scutum.config.publicUrlAsset + "node_modules/codemirror/addon/display/fullscreen.js", scutum.config.publicUrlAsset + "node_modules/codemirror/addon/edit/matchbrackets.js", scutum.config.publicUrlAsset + "node_modules/codemirror/addon/edit/matchtags.js", scutum.config.publicUrlAsset + "node_modules/codemirror/addon/fold/xml-fold.js", scutum.config.publicUrlAsset + "node_modules/codemirror/addon/scroll/simplescrollbars.js", scutum.config.publicUrlAsset + "node_modules/codemirror/addon/scroll/simplescrollbars.css"],
    cropper: [scutum.config.publicUrlAsset + "node_modules/cropper/dist/cropper.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/cropper.min.css"],
    datatables: [scutum.config.publicUrlAsset + "node_modules/datatables.net/js/jquery.dataTables.min.js", scutum.config.publicUrlAsset + "node_modules/datatables.net-responsive/js/dataTables.responsive.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/datatables/responsive.uikit.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/datatables/dataTables.uikit.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/datatables.min.css"],
    "datatables-buttons": [scutum.config.publicUrlAsset + "assets/js/vendor/pdfmake.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/vfs_fonts.js", scutum.config.publicUrlAsset + "assets/js/vendor/jszip.min.js", scutum.config.publicUrlAsset + "node_modules/datatables.net-buttons/js/dataTables.buttons.min.js", scutum.config.publicUrlAsset + "node_modules/datatables.net-buttons/js/buttons.html5.min.js", scutum.config.publicUrlAsset + "node_modules/datatables.net-buttons/js/buttons.print.min.js"],
    "diff-tool": [scutum.config.publicUrlAsset + "node_modules/diff/dist/diff.min.js"],
    driver: [scutum.config.publicUrlAsset + "node_modules/driver.js/dist/driver.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/driver.min.css"],
    dragula: [scutum.config.publicUrlAsset + "node_modules/dragula/dist/dragula.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/dragula.min.css"],
    fancytree: [scutum.config.publicUrlAsset + "node_modules/jquery.fancytree/dist/jquery.fancytree-all-deps.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jquery.fancytree.glyphMap.min.js", scutum.config.publicUrlAsset + "node_modules/jquery.fancytree/dist/skin-material/ui.fancytree.min.css", scutum.config.publicUrlAsset + "assets/css/plugins/fancytree.min.css"],
    "gantt-chart": [scutum.config.publicUrlAsset + "assets/js/vendor/jquery.gantt-chart.js", scutum.config.publicUrlAsset + "assets/css/plugins/gantt_chart.min.css"],
    gmaps: ["https://maps.google.com/maps/api/js?key=" + scutum.config.gmapsKey, scutum.config.publicUrlAsset + "assets/js/vendor/gmaps.min.js"],
    handlebars: [scutum.config.publicUrlAsset + "node_modules/handlebars/dist/handlebars.min.js", "handlebars/handlebars_helpers.js", scutum.config.publicUrlAsset + "node_modules/handlebars-intl/dist/handlebars-intl.min.js", scutum.config.publicUrlAsset + "node_modules/handlebars-intl/dist/locale-data/fr.js"],
    "idle-timeout": [scutum.config.publicUrlAsset + "assets/js/vendor/idle-timer.min.js"],
    imagesLoaded: [scutum.config.publicUrlAsset + "node_modules/imagesloaded/imagesloaded.pkgd.min.js"],
    intercooler: [scutum.config.publicUrlAsset + "assets/js/vendor/intercooler.min.js"],
    "jquery-ui": [scutum.config.publicUrlAsset + "assets/js/vendor/jquery-ui.min.js"],
    jqvmap: [scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/jquery.vmap.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.world.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/jqvmap.min.css"],
    "jqvmap-maps": [scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.algeria.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.argentina.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.australia.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.brazil.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.canada.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.china.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.europe.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.france.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.germany.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.greece.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.india.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.iran.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.iraq.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.poland.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.russia.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.south_america.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.tunisia.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.turkey.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.usa.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.africa.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.asia.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/jqvmap/maps/jquery.vmap.north_america.min.js"],
    highlightJS: [scutum.config.publicUrlAsset + "assets/js/vendor/highlight.js/highlight.pack.min.js", scutum.config.publicUrlAsset + "assets/js/vendor/highlight.js/styles/github.css"],
    kinetic: [scutum.config.publicUrlAsset + "assets/js/vendor/jquery.kinetic.min.js"],
    listjs: [scutum.config.publicUrlAsset + "node_modules/list.js/dist/list.min.js"],
    listnav: [scutum.config.publicUrlAsset + "assets/js/vendor/jquery-listnav.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/listnav.min.css"],
    mockjax: [scutum.config.publicUrlAsset + "node_modules/jquery-mockjax/dist/jquery.mockjax.min.js"],
    particlesJS: [scutum.config.publicUrlAsset + "assets/js/vendor/particles.min.js"],
    "perfect-scrollbar": [scutum.config.publicUrlAsset + "node_modules/perfect-scrollbar/css/perfect-scrollbar.css", scutum.config.publicUrlAsset + "node_modules/perfect-scrollbar/dist/perfect-scrollbar.min.js"],
    pushJS: [scutum.config.publicUrlAsset + "node_modules/push.js/bin/push.min.js"],
    stickyKit: [scutum.config.publicUrlAsset + "assets/js/vendor/sticky-kit.min.js"],
    screenfull: [scutum.config.publicUrlAsset + "node_modules/screenfull/dist/screenfull.js"],
    "snazzy-infowindow": [scutum.config.publicUrlAsset + "node_modules/snazzy-info-window/dist/snazzy-info-window.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/snazzy_infowindow.min.css"],
    tablesorter: [scutum.config.publicUrlAsset + "node_modules/tablesorter/dist/js/jquery.tablesorter.min.js", scutum.config.publicUrlAsset + "node_modules/tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js", scutum.config.publicUrlAsset + "node_modules/tablesorter/dist/js/jquery.tablesorter.widgets.min.js", scutum.config.publicUrlAsset + "assets/css/plugins/tablesorter.min.css"],
    "tablesorter-widgets": [scutum.config.publicUrlAsset + "node_modules/tablesorter/dist/js/widgets/widget-print.min.js"],
    "tablesorter-pagecontrols": [scutum.config.publicUrlAsset + "node_modules/tablesorter-pagercontrols/dist/js/jquery.tablesorter.pager.appendcontrols.english.min.js", scutum.config.publicUrlAsset + "node_modules/tablesorter-pagercontrols/dist/css/jquery.tablesorter.pager.appendcontrols.css"],
    "tui-calendar": [scutum.config.publicUrlAsset + "node_modules/tui-calendar/dist/tui-calendar.min.js", scutum.config.publicUrlAsset + "node_modules/tui-calendar/dist/tui-calendar.min.css", scutum.config.publicUrlAsset + "assets/css/plugins/calendar.min.css"],
    "tui-datepicker": [scutum.config.publicUrlAsset + "node_modules/tui-date-picker/dist/tui-date-picker.min.js", scutum.config.publicUrlAsset + "node_modules/tui-date-picker/dist/tui-date-picker.css"],
    "tui-grid": [scutum.config.publicUrlAsset + "node_modules/tui-grid/dist/tui-grid.min.js", scutum.config.publicUrlAsset + "node_modules/tui-grid/dist/tui-grid.min.css", scutum.config.publicUrlAsset + "assets/css/plugins/data_grid.min.css"],
    "tui-pagination": [scutum.config.publicUrlAsset + "node_modules/tui-pagination/dist/tui-pagination.min.js"],
    "tui-snippets": [scutum.config.publicUrlAsset + "assets/js/vendor/tui-code-snippet.min.js"],
    "tui-timepicker": [scutum.config.publicUrlAsset + "node_modules/tui-time-picker/dist/tui-time-picker.min.js", scutum.config.publicUrlAsset + "node_modules/tui-time-picker/dist/tui-time-picker.css"],
    quicksearch: [scutum.config.publicUrlAsset + "assets/js/vendor/jquery.quicksearch.min.js"],
    "xhr-mock": [scutum.config.publicUrlAsset + "assets/js/vendor/xhr-mock.js"],
    flagsCSS: [scutum.config.publicUrlAsset + "assets/icons/flags/flags.css"],
    uikitCSS: [scutum.config.publicUrlAsset + "node_modules/uikit/dist/css/uikit.min.css"]
  }, scutum.getBundlesFiles = function (s) {
    var e = [];
    return Object.keys(scutum.bundles).forEach(function (s) {
      scutum.bundles[s].forEach(function (s) {
        e.push(s)
      })
    }), s && (e = e.filter(function (s) {
      return -1 !== s.indexOf(scutum.config.publicUrlAsset + "node_modules")
    })), e.push(scutum.config.publicUrlAsset + "node_modules/tinymce/**/*"), e
  }, console.log(scutum.getBundlesFiles(!0)), scutum.require = function (s, e, t) {
    s.forEach(function (s) {
      s in scutum.bundles ? loadjs.isDefined(s) || loadjs(scutum.bundles[s], s, {
        async: void 0 === t
      }) : console.log("Bundle not defined: " + s)
    }), loadjs.ready(s, e)
  }, scutum.helpers = {}, scutum.helpers.init = function () {
    scutum.helpers.touchDetect(), scutum.helpers.codeHighlight(), scutum.helpers.preventLinkClick(), scutum.helpers.waves(), scutum.helpers.iCheck.toggleListItems(), scutum.helpers.iCheck.toggleSingleItem(), scutum.helpers.sequenceShow.init(), scutum.helpers.column.toggle(), scutum.helpers.sticky(), scutum.helpers.scrollbar.custom(), scutum.helpers.validation.parsleyJS(), scutum.helpers.bgGradient(), scutum.helpers.hiResImages()
  }, scutum.helpers.touchDetect = function () {
    window.addEventListener("touchstart", function s() {
      document.body.classList.add("sc-touch-device"), window.TOUCH_DETECTED = !0, window.removeEventListener("touchstart", s, !1)
    }, !1)
  }, scutum.helpers.codeHighlight = function () {
    var s = $("pre.sc-js-highlight");
    s.length && scutum.require(["highlightJS"], function () {
      s.not(".highlighted").each(function (s, e) {
        hljs.highlightBlock(e), $(this).addClass("highlighted")
      })
    })
  }, scutum.helpers.uniqueID = function () {
    for (var s = "", e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = 0; t < 6; t++) s += e.charAt(Math.floor(Math.random() * e.length));
    return s
  }, scutum.helpers.isHiRes = 1 < window.devicePixelRatio || window.matchMedia && window.matchMedia("(-webkit-min-device-pixel-ratio: 1.5),(min--moz-device-pixel-ratio: 1.5),(-o-min-device-pixel-ratio: 3/2),(min-resolution: 1.5dppx)").matches, scutum.helpers.extend = function (s, e) {
    var t, i = {};
    for (t in s) Object.prototype.hasOwnProperty.call(s, t) && (i[t] = s[t]);
    for (t in e) Object.prototype.hasOwnProperty.call(e, t) && (i[t] = e[t]);
    return i
  }, scutum.helpers.preventLinkClick = function () {
    scutum.var_body.on("click", 'a[href="#"]', function (s) {
      s.preventDefault()
    })
  }, scutum.helpers.sequenceShow = {
    settings: {
      animation: "uk-animation-scale-up",
      duration: "320",
      delay: .25,
      target: ""
    },
    init: function (s, r) {
      var e = s ? $(s) : $("[data-sc-sequence-show]");
      e.length && e.each(function () {
        var a = $(this),
          c = a.offset();
        if (!a.hasClass("sc-sequence-show-processed") && a.children().length) {
          var o = JSON.parse(JSON.stringify(scutum.helpers.sequenceShow.settings));
          "" !== a.attr("data-sc-sequence-show") && (o = $.extend(o, jQuery.parseJSON(a.attr("data-sc-sequence-show"))));
          var s = "" === o.target ? a.children() : a.find(o.target);
          s.addClass("sc-sequence-show"), setTimeout(function () {
            s.each(function (s) {
              var e = $(this),
                t = e.position(),
                i = .8 * t.left + (t.top - c.top),
                n = parseFloat(i * o.delay).toFixed(0);
              e.css("-webkit-animation-delay", n + "ms").css("animation-delay", n + "ms").css("-webkit-animation-duration", o.duration + "ms").css("animation-duration", o.duration + "ms"), a.hasClass("sc-sequence-show-manual") || a.on("inview", function () {
                scutum.helpers.sequenceShow.activate(e, o.animation)
              }), r && scutum.helpers.sequenceShow.activate(e, o.animation)
            }), a.hasClass("sc-sequence-show-manual") || "function" == typeof UIkit.scrollspy && UIkit.scrollspy(a), a.addClass("sc-sequence-show-processed")
          }, 500)
        }
      })
    },
    activate: function (s, e, t) {
      var i = s.closest(".sc-sequence-show"),
        n = e || i.attr("data-sequence-animation") || scutum.helpers.sequenceShow.settings.animation;
      i.addClass("sc-sequence-show-animate " + n), i.one("webkitAnimationEnd animationend", function () {
        $(this).css({
          "-webkit-animation-delay": "",
          "-webkit-animation-duration": "",
          "animation-duration": "",
          "animation-delay": ""
        }).removeClass("sc-sequence-show sc-sequence-show-animate").removeClass(n)
      }), "function" == typeof t && i.last().one("webkitAnimationEnd animationend", function () {
        t()
      })
    }
  }, scutum.helpers.scrollbar = {
    width: function (s) {
      var e, t;
      return void 0 === s && (s = (t = (e = $('<div style="width:50px;height:50px;overflow:auto"></div>').appendTo("body")).children()).innerWidth() - t.height(99).innerWidth(), e.remove()), s
    },
    disable: function (s) {
      scutum.$html.css({
        overflow: "hidden"
      }), scutum.var_body.css({
        "overflow-y": "scroll"
      }), scutum.$header.css({
        "margin-right": scutum.helpers.scrollbar.width()
      }), s && scutum.var_body.css({
        height: "100%"
      })
    },
    enable: function (s) {
      scutum.$html.css({
        overflow: ""
      }), scutum.var_body.css({
        "overflow-y": ""
      }), scutum.$header.css({
        "margin-right": ""
      }), s && scutum.var_body.css({
        height: ""
      })
    },
    custom: function (s) {
      if (scutum.config.customScrollbar && scutum.helpers.mq.mediumMin()) {
        var e = void 0 !== s ? $(s) : $("[data-sc-scrollbar]");
        e.length && scutum.require(["perfect-scrollbar"], function () {
          e.each(function () {
            var s = $(this),
              e = new PerfectScrollbar(s[0]);
            s.addClass("uk-position-relative").data("ps", e), "visible-y" === s.attr("data-sc-scrollbar") && s.addClass("ps--active-y ps--focus"), "visible-x" === s.attr("data-sc-scrollbar") && s.addClass("ps--active-x ps--focus")
          })
        })
      }
    }
  }, scutum.helpers.colors = {
    multi: ["#0288D1", "#FB8C00", "#689F38", "#7B1FA2", "#D32F2F", "#00796B"],
    blue: ["#01579B", "#0288D1", "#03A9F4", "#4FC3F7", "#B3E5FC"],
    green: ["#558B2F", "#689F38", "#7CB342", "#8BC34A", "#9CCC65"],
    chart_a: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
  }, scutum.helpers.hex2rgba = function (s, e) {
    var t = e || 100,
      i = s.replace("#", "");
    return "rgba(" + parseInt(i.substring(0, 2), 16) + "," + parseInt(i.substring(2, 4), 16) + "," + parseInt(i.substring(4, 6), 16) + "," + t / 100 + ")"
  }, scutum.helpers.hex2rgb = function (s) {
    return s = s.replace("#", ""), "rgba(" + parseInt(s.substring(0, 2), 16) + "," + parseInt(s.substring(2, 4), 16) + "," + parseInt(s.substring(4, 6), 16) + ")"
  }, scutum.helpers.waves = function () {
    "function" == typeof Waves.init && $(".sc-js-button-wave,.sc-js-button-light-wave,.sc-js-block-wave,.sc-js-block-light-wave").length && (Waves.attach(".sc-js-button-wave,.sc-card-actions-icon", ["waves-button"]), Waves.attach(".sc-js-button-wave-light", ["waves-button", "waves-light"]), Waves.attach(".sc-js-button-wave-primary", ["waves-button", "waves-primary"]), Waves.attach(".sc-js-button-wave-md", ["waves-button", "waves-md"]), Waves.attach(".sc-js-button-wave-warning", ["waves-button", "waves-warning"]), Waves.attach(".sc-js-button-wave-success", ["waves-button", "waves-success"]), Waves.attach(".sc-js-button-wave-danger", ["waves-button", "waves-danger"]), Waves.attach(".sc-js-block-wave", ["waves-block"]), Waves.attach(".sc-js-block-wave-light", ["waves-block", "waves-light"]), Waves.init())
  }, scutum.helpers.iCheck = {
    toggleListItems: function () {
      var s = $(".sc-main-checkbox");
      s.length && s.each(function () {
        var e = $(this),
          t = e.attr("data-group");
        e.on("ifChecked", function () {
          scutum.var_body.find(t).iCheck("check")
        }).on("ifUnchecked", function () {
          scutum.var_body.find(t).iCheck("uncheck")
        }), scutum.var_body.on("ifChanged", t, function () {
          var s = !0;
          scutum.var_body.find(t).each(function () {
            $(this).is(":checked") || (s = !1)
          }), e.prop("checked", s).iCheck("update")
        })
      })
    },
    toggleSingleItem: function () {
      var s = $(".sc-js-item-check");
      s.length && s.each(function () {
        $(this).on("ifChecked", function () {
          $(this).closest("li,tr").addClass("sc-item-checked")
        }), $(this).on("ifUnchecked", function () {
          $(this).closest("li,tr").removeClass("sc-item-checked")
        })
      })
    }
  }, scutum.helpers.overlay = {
    add: function (s, e, t) {
      var i = s ? $(s) : scutum.var_body,
        n = t ? 'style="top:' + t + 'px"' : "";
      e ? (i.append('<div class="sc-overlay" ' + n + "></div>"), setTimeout(function () {
        i.find(".sc-overlay").addClass("dimmed")
      }, 10)) : $(s).append('<div class="sc-overlay" ' + n + "></div>")
    },
    remove: function (s, e) {
      var t = (s ? $(s) : scutum.var_body).find(".sc-overlay");
      e ? (t.removeClass("dimmed"), setTimeout(function () {
        t.remove()
      }, 280)) : t.remove()
    }
  }, scutum.helpers.validation = {
    parsleyJS: function () {
      window.ParsleyConfig = {
        excluded: "input[type=button], input[type=submit], input[type=reset], input[type=hidden], input.sc-validation-exclude",
        trigger: "change",
        errorsWrapper: '<div class="sc-form-errors-list"></div>',
        errorTemplate: "<span></span>",
        errorClass: "uk-form-danger",
        successClass: "uk-form-success",
        errorsContainer: function (s) {
          var e = s.$element,
            t = e.closest(".sc-validation-wrapper");
          return e.closest(".sc-input-wrapper").length && (t = e.closest(".sc-input-wrapper").parent()), t
        },
        classHandler: function (s) {
          var e = s.$element;
          if (e.is(":checkbox") || e.is(":radio") || e.parent().is("label") || $(e).is("[data-sc-select2]")) return e.closest(".sc-validation-wrapper,.sc-input-wrapper")
        }
      }
    },
    emailAddress: function (s) {
      return new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?(25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.)((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i).test(s)
    }
  }, scutum.helpers.button = {
    replaceContent: function (s, e, t, i) {
      var n = $(s).addClass("uk-transform-origin-center"),
        a = n.html(),
        c = $('<span class="uk-invisible">' + a + "</span>");
      n.html(c);
      var o = n.children();
      t ? n.velocity({
        scale: .1,
        opacity: 0
      }, {
        duration: 140,
        easing: scutum.easingSwiftOut,
        complete: function () {
          n.velocity("reverse", {
            delay: 150
          }), i && n.addClass(i), setTimeout(function () {
            o.html(e).removeClass("uk-invisible")
          }, 200)
        }
      }) : $(s).html(e)
    },
    showLoading: function (s, e) {
      var t = $(s);
      if (!t.children(".sc-js-el-hide").length) {
        var i = $('<span class="uk-invisible">' + t.html() + "</span>"),
          n = e || t.attr("data-button-mode") ? 'style="border-color: rgba(0,0,0,.2);border-top-color: rgba(255,255,255,.9)"' : "",
          a = $('<span class="sc-spinner sc-spinner-small uk-hidden"' + n + "></span>");
        t.html(i).append(a)
      }
      var c = $("<div>", {
        class: "sc-button-wrapper",
        css: {
          width: t.outerWidth()
        }
      });
      t.wrap(c), t.velocity({
        width: t.outerHeight(),
        minWidth: t.outerHeight()
      }, {
        duration: 140,
        easing: scutum.easingSwiftOut,
        complete: function () {
          t.addClass("sc-button-round sc-button-flex uk-flex-center"), t.children(".sc-spinner").removeClass("uk-hidden"), t.children(".uk-invisible").toggleClass("uk-hidden uk-invisible")
        }
      })
    },
    hideLoading: function (s) {
      var e = $(s),
        t = e.closest(".sc-button-wrapper");
      $.Velocity.hook(e, "transition", "none"), e.velocity({
        width: t.width(),
        minWidth: t.width()
      }, {
        duration: 140,
        easing: scutum.easingSwiftOut,
        begin: function () {
          e.children(".sc-spinner").remove(), e.removeClass("sc-button-round sc-button-flex uk-flex-center")
        },
        complete: function () {
          var s = e.children();
          e.unwrap(t), $.Velocity.hook(e, "transition", ""), setTimeout(function () {
            s.replaceWith(s[0].childNodes), $.Velocity.hook(e, "width", ""), $.Velocity.hook(e, "min-width", "")
          }, 150)
        }
      })
    }
  }, scutum.helpers.hideDuringTransform = function (s, e, t) {
    $(s).addClass("sc-js-el-transform"), t && $(s).find(t).addClass("sc-js-el-transform-visible"), setTimeout(function () {
      $(s).removeClass("sc-js-el-transform"), t && $(s).find(t).removeClass("sc-js-el-transform-visible")
    }, e || 280)
  }, scutum.helpers.preloader = {
    show: function (s, e, t) {
      $(s).html('<div class="' + (t || "md-color-light-blue-500") + ' uk-flex uk-flex-center uk-flex-middle uk-height-1-1 uk-animation-fade sc-js-preloader uk-width-1-1" data-uk-spinner="ratio: ' + (e || 2) + '"></div>')
    },
    overlayShow: function (s, e, t, i) {
      var n = e || scutum.var_body,
        a = s ? '<div class="sc-spinner"></div>' : '<div class="' + (i || "md-color-light-blue-500") + '" uk-spinner="ratio: ' + (t || 1) + '"></div>',
        c = n === scutum.var_body ? " fixed" : "";
      $(n).append('<div class="sc-spinner-overlay' + c + '">' + a + "</div>"), setTimeout(function () {
        $(".sc-spinner-overlay").addClass("enter")
      }, 50)
    },
    overlayHide: function () {
      var s = $(".sc-spinner-overlay");
      s.removeClass("enter"), setTimeout(function () {
        s.remove()
      }, 300)
    }
  }, scutum.helpers.column = {
    toggle: function () {
      var s = $(".sc-js-column");
      s.length && s.each(function () {
        var t = $(this);
        t.find(".sc-js-column-collapse").on("click", function (s) {
          s.preventDefault(), scutum.helpers.hideDuringTransform(t), t.addClass("sc-column-collapsed");
          var e = $(this);
          setTimeout(function () {
            e.trigger("collapse")
          }, 300)
        }), t.find(".sc-js-column-expand").on("click", function (s) {
          s.preventDefault(), scutum.helpers.hideDuringTransform(t), t.removeClass("sc-column-collapsed");
          var e = $(this);
          setTimeout(function () {
            e.trigger("expand")
          }, 300)
        })
      })
    }
  }, scutum.helpers.findObjectByKey = function (e, t, i) {
    return Promise.resolve(function () {
      for (var s = 0; s < e.length; s++)
        if (e[s][t] === i) return e[s];
      return null
    }()).catch(function (s) {
      throw console.log("There has been a error: " + s.message), s
    })
  }, scutum.helpers.ajax = function (i, n, a, c) {
    return new Promise(function (s, e) {
      var t = new XMLHttpRequest;
      t.onreadystatechange = function () {
        t.readyState === XMLHttpRequest.DONE && (200 === t.status ? s(a && "json" === a ? JSON.parse(t.responseText) : t.responseText) : e(Error(t.statusText)))
      }, t.onerror = function () {
        e(Error("Network Error"))
      }, t.open(n, i, !0), t.responseType = "text", t.send(c)
    }).catch(function (s) {
      throw console.log("There has been a error: " + s.message), s
    })
  }, scutum.helpers.escapeHTML = function (s) {
    var e = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
      "`": "&#x60;",
      "=": "&#x3D;"
    };
    return String(s).replace(/[&<>"'/]/g, function (s) {
      return e[s]
    })
  }, scutum.helpers.element = {
    remove: function (s, e) {
      e ? setTimeout(function () {
        $(s).remove()
      }, e) : $(s).remove()
    }
  }, scutum.helpers.sticky = function () {
    var s = $("[data-sc-sticky]");
    s.length && scutum.require(["stickyKit"], function () {
      s.each(function (s) {
        var e = $(this),
          t = {},
          i = null;
        if ("" !== e.attr("data-sc-sticky")) {
          var n = jQuery.parseJSON(e.attr("data-sc-sticky"));
          $.each(n, function (s, e) {
            t[s] = e
          })
        }
        scutum.$header.length && "inPlace" !== t.offset_top && (t.offset_top = scutum.$header.outerHeight()), "inPlace" === t.offset_top && (t.offset_top = $(this).offset().top), void 0 !== t.media && !scutum.helpers.mq[t.media]() || (t.delay ? (i = t.delay, delete t.delay, setTimeout(function () {
          e.stick_in_parent(t)
        }, i)) : e.stick_in_parent(t))
      })
    })
  }, scutum.helpers.debounce = function (i, n, a) {
    var c;
    return function () {
      var s = this,
        e = arguments,
        t = a && !c;
      clearTimeout(c), c = setTimeout(function () {
        c = null, a || i.apply(s, e)
      }, n), t && i.apply(s, e)
    }
  }, scutum.helpers.serializeObject = function (s) {
    var e = {},
      t = $(s).serializeArray();
    return $.each(t, function () {
      void 0 !== e[this.name] ? (e[this.name].push || (e[this.name] = [e[this.name]]), e[this.name].push(this.value || "")) : e[this.name] = this.value || ""
    }), e
  }, scutum.helpers.isRTL = function () {
    return "rtl" === (window.getComputedStyle || function (s) {
      return s.currentStyle
    })(scutum.$html[0]).direction
  }, scutum.helpers.bgGradient = function () {
    var s = $("[data-sc-bg-gradient]");
    s.length && s.each(function () {
      var s = $(this),
        e = s.attr("data-sc-bg-gradient").split(",");
      s.css({
        "background-color": e[1],
        "background-image": "linear-gradient( 135deg, " + e[0] + " 10%, " + e[1] + " 100%)"
      })
    })
  }, scutum.helpers.parseParams = function (s) {
    function e(s) {
      return decodeURIComponent(s.replace(/\+/g, " "))
    }

    var t = /([^&=]+)=?([^&]*)/g;

    function c(s, e, t) {
      if (-1 !== (e += "").indexOf(".")) {
        var i = e.split("."),
          n = e.split(/\.(.+)?/)[1];
        s[i[0]] || (s[i[0]] = {}), "" !== n ? c(s[i[0]], n, t) : console.warn('parseParams :: empty property in key "' + e + '"')
      } else if (-1 !== e.indexOf("[")) {
        e = (i = e.split("["))[0];
        var a = i[1].split("]")[0];
        "" === a ? ((s = s || {})[e] && $.isArray(s[e]) || (s[e] = []), s[e].push(t)) : ((s = s || {})[e] && $.isArray(s[e]) || (s[e] = []), s[e][parseInt(a)] = t)
      } else (s = s || {})[e] = t
    }

    "" === (s += "") && (s = window.location + "");
    var i, n = {};
    if (s) {
      if (-1 !== s.indexOf("#") && (s = s.substr(0, s.indexOf("#"))), -1 !== s.indexOf("?") && (s = s.substr(s.indexOf("?") + 1, s.length)), "" === s) return {};
      for (; i = t.exec(s);) {
        c(n, e(i[1]), e(i[2]))
      }
    }
    return n
  }, scutum.helpers.mq = {
    smallMax: function () {
      return window.matchMedia("(max-width: 959px)").matches
    },
    mediumMin: function () {
      return window.matchMedia("(min-width: 960px)").matches
    },
    mediumMax: function () {
      return window.matchMedia("(max-width: 1199px)").matches
    },
    largeMin: function () {
      return window.matchMedia("(min-width: 1200px)").matches
    },
    largeMax: function () {
      return window.matchMedia("(max-width: 1599px)").matches
    },
    xlargeMin: function () {
      return window.matchMedia("(min-width: 1600px)").matches
    }
  }, scutum.helpers.hiResImages = function () {
    if (!scutum.config.hiResImages || !scutum.helpers.isHiRes) return !1;
    loadjs(scutum.config.publicUrlAsset + "assets/js/vendor/retina.min.js", {
      success: function () {
        $("img").attr("data-rjs", 2), retinajs()
      }
    })
  }, scutum.helpers.hiResImagesProcess = function () {
    if (!scutum.config.hiResImages || !scutum.helpers.isHiRes) return !1;
    $("img").attr("data-rjs", 2), retinajs()
  }, scutum.handlebars = {}, scutum.handlebars.getPartial = function (i, n) {
    return new Promise(function (s, e) {
      var t = new XMLHttpRequest;
      t.onreadystatechange = function () {
        t.readyState === XMLHttpRequest.DONE && (200 === t.status ? s(t.responseText) : e(Error(t.statusText)))
      }, t.onerror = function () {
        e(Error("Network Error"))
      }, t.open("GET", "handlebars/templates/" + i + ".hbs", !0), t.responseType = "text", t.send(n)
    }).catch(function (s) {
      throw console.log("There has been a error: " + s.message), s
    })
  }, scutum.toolbar = {}, scutum.toolbar.init = function () {
    scutum.toolbar.sticky()
  }, scutum.toolbar.sticky = function () {
    var s = scutum.$topBar.length || scutum.$header ? scutum.$topBar.height() + scutum.$header.height() + 25 : 0;
    UIkit.sticky(scutum.$toolbar, {
      offset: s
    })
  }, scutum.headerMain = {}, scutum.headerMain.init = function () {
    scutum.headerMain.fullscreen(), scutum.headerMain.sticky(), scutum.headerMain.clearAlerts()
  }, scutum.headerMain.fullscreen = function () {
    var e = $("#sc-js-fullscreen-toggle");
    e.length && scutum.require(["screenfull"], function () {
      e.on("click", function (s) {
        s.preventDefault(), screenfull.enabled && (screenfull.request(), e.find(".sc-js-el-show").show(), e.find(".sc-js-el-hide").hide(), screenfull.isFullscreen && (screenfull.exit(), e.find(".sc-js-el-hide").show(), e.find(".sc-js-el-show").hide())), scutum.$win.resize()
      })
    })
  }, scutum.headerMain.clearAlerts = function () {
    var e = $(".sc-js-clear-alerts");
    e.on("click", function (s) {
      s.preventDefault(), $("#sc-header-alerts").children("li").not(".sc-js-empty-message").velocity("transition.slideRightOut", {
        stagger: 70,
        duration: 140,
        complete: function () {
          e.parent().hide(), e.closest("li").find(".sc-indicator").hide(), e.closest("li").find(".sc-js-empty-message").show()
        }
      })
    })
  }, scutum.headerMain.sticky = function () {
    var s = (scutum.helpers.mq.smallMax(), {});
    setTimeout(function () {
      UIkit.sticky(scutum.$header, s)
    }, 500)
  }, scutum.sidebarMain = {}, scutum.sidebarMain.init = function () {
    scutum.sidebarMain.navigation(), scutum.sidebarMain.toggle()
  }, scutum.sidebarMain.navigation = function () {
    scutum.$sidebarMain.find(".sc-sidebar-menu").find("li").not(".sc-sidebar-submenu-expanded").each(function () {
      $(this).children("ul").length && ($(this).addClass("sc-js-submenu-trigger sc-has-submenu"), $(this).find("ul").hide())
    }), $(".sc-js-submenu-trigger > a").on("click ", function (s) {
      s.preventDefault();
      var e = $(this),
        t = e.next("ul").is(":visible") ? "slideUp" : "slideDown",
        i = scutum.$sidebarMain.hasClass("sc-js-accordion-mode");
      e.next("ul").velocity(t, {
        duration: 280,
        easing: scutum.easingSwiftOut,
        begin: function () {
          "slideUp" == t ? $(this).closest(".sc-js-submenu-trigger").removeClass("sc-section-active") : (i && e.closest("li").siblings(".sc-js-submenu-trigger").each(function () {
            $(this).children("ul").velocity("slideUp", {
              duration: 300,
              easing: scutum.easingSwiftOut,
              begin: function () {
                $(this).closest(".sc-js-submenu-trigger").removeClass("sc-section-active")
              }
            })
          }), $(this).closest(".sc-js-submenu-trigger").addClass("sc-section-active"))
        },
        complete: function () {
          "slideUp" != t && scutum.$sidebarMain.hasClass("sc-js-scroll-to-active") && e.closest(".sc-section-active").velocity("scroll", {
            duration: 400,
            easing: scutum.easingSwiftOut,
            container: scutum.$sidebarMain.find(".uk-offcanvas-bar"),
            offset: 1
          }), scutum.helpers.mq.mediumMax() && UIkit.offcanvas(scutum.$sidebarMain).show(), scutum.config.customScrollbar && scutum.$sidebarMain.find("[data-sc-scrollbar]").data("ps").update()
        }
      })
    }), scutum.$sidebarMain.find(".sc-page-active").each(function () {
      var s = $(this);
      s.parents(".sc-js-submenu-trigger").addClass("sc-section-active"), s.parents("ul").css({
        display: "block"
      })
    })
  }, scutum.sidebarMain.toggle = function () {
    scutum.helpers.mq.mediumMax() && (UIkit.offcanvas(scutum.$sidebarMain, {
      overlay: !0
    }), scutum.$sidebarMain.on("show", function () {
      scutum.$html.addClass("sc-sidebar-main-visible")
    }).on("hide", function () {
      scutum.$html.removeClass("sc-sidebar-main-visible")
    })), scutum.helpers.mq.mediumMin() && (scutum.$pageWrapper.off("transitionend.scSidebar"), scutum.$pageWrapper.on("transitionend.scSidebar", function (s) {
      $(s.target).is("#sc-page-wrapper") && (scutum.$doc.trigger("sc-sidebar:toggle"), scutum.$win.trigger("resize"))
    })), $("#sc-sidebar-main-toggle").on("click", function (s) {
      s.preventDefault(), scutum.helpers.mq.mediumMin() ? scutum.$html.hasClass("sc-sidebar-main-slide") ? scutum.$html.removeClass("sc-sidebar-main-slide") : scutum.$html.addClass("sc-sidebar-main-slide") : scutum.$html.hasClass("sc-sidebar-main-visible") ? UIkit.offcanvas(scutum.$sidebarMain).hide() : UIkit.offcanvas(scutum.$sidebarMain).show()
    })
  }, scutum.offcanvas = {}, scutum.offcanvas.init = function () {
    if (scutum.$offcanvas.length && scutum.helpers.mq.mediumMax()) {
      var s = $(".sc-js-offcanvas-toggle");
      s.show(), s.on("click", function (s) {
        s.preventDefault(), scutum.$html.hasClass("sc-offcanvas-visible") ? UIkit.offcanvas(scutum.$offcanvas).hide() : UIkit.offcanvas(scutum.$offcanvas).show()
      }), scutum.$offcanvas.on("shown", function () {
        scutum.$html.addClass("sc-offcanvas-visible")
      }).on("hidden", function () {
        scutum.$html.removeClass("sc-offcanvas-visible")
      })
    }
  }, scutum.cards = {}, scutum.cards.init = function () {
    scutum.cards.fullscreen(), scutum.cards.toggle(), scutum.cards.close()
  }, scutum.cards.hideContent = function (s, e, t) {
    var i = $(s).closest(".uk-card");
    i.hasClass("sc-card-hidden") || (i.addClass("sc-card-hidden"), e && i.append('<div data-uk-spinner="ratio: 2"></div>'), void 0 !== t && "function" == typeof t && setTimeout(function () {
      t()
    }, 320))
  }, scutum.cards.showContent = function (s, e, t) {
    var i = $(s).closest(".uk-card");
    i.hasClass("sc-card-hidden") && (i.removeClass("sc-card-hidden"), e && i.find(".uk-spinner").remove(), void 0 !== t && "function" == typeof t && t())
  }, scutum.cards.fullscreen = function () {
    $(".sc-js-card-fullscreen").on("click", function (s) {
      s.preventDefault();
      var e = $(this),
        t = e.closest(".uk-card"),
        i = {};
      if (i.width = t.width(), i.height = t.height(), i.offset = t.offset(), i.position = t.position(), t.hasClass("sc-card-fs-active")) {
        var n = $(".sc-card-fs-placeholder"),
          a = {};
        a.width = n.width(), a.height = n.height(), a.offset = n.offset(), t.addClass("sc-card-fs-animate"), t.velocity({
          top: a.offset.top - scutum.$win.scrollTop(),
          left: a.offset.left,
          height: a.height,
          width: a.width
        }, {
          delay: 280,
          duration: 560,
          easing: scutum.easingSwiftOut,
          complete: function () {
            t.removeClass("sc-card-fs-active sc-card-fs-animate"), e.toggleClass("mdi-fullscreen mdi-fullscreen-exit"), n.remove(), scutum.helpers.scrollbar.enable(), $.Velocity.hook(t, "top", ""), $.Velocity.hook(t, "left", ""), $.Velocity.hook(t, "width", ""), $.Velocity.hook(t, "height", ""), scutum.$win.resize()
          }
        })
      } else {
        var c = scutum.$win.scrollTop();
        scutum.helpers.scrollbar.disable(), t.addClass("sc-card-fs-active sc-card-fs-animate").css({
          width: i.width,
          height: i.height,
          left: i.offset.left,
          top: i.offset.top - c
        }), $('<div class="sc-card-fs-placeholder" style="height:' + t.height() + 'px">').insertBefore(t), t.velocity({
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        }, {
          delay: 280,
          duration: 560,
          easing: scutum.easingSwiftOut,
          begin: function () {
            e.toggleClass("mdi-fullscreen mdi-fullscreen-exit")
          },
          complete: function () {
            t.removeClass("sc-card-fs-animate"), scutum.$win.resize()
          }
        })
      }
    })
  }, scutum.cards.toggle = function () {
    $(".sc-js-card-toggle").on("click", function (s) {
      s.preventDefault();
      var e = $(this),
        t = e.closest(".uk-card"),
        i = t.find(".sc-card-content");
      t.hasClass("sc-card-minimized") ? i.velocity("slideDown", {
        duration: 280,
        easing: scutum.easingSwiftOut,
        begin: function () {
          i.css({
            transition: "none"
          }), t.removeClass("sc-card-minimized"), e.toggleClass("mdi-window-minimize mdi-window-maximize")
        },
        complete: function () {
          i.css({
            height: "",
            transition: ""
          })
        }
      }) : i.height(i.height()).css({
        transition: "none"
      }).velocity("slideUp", {
        duration: 280,
        easing: scutum.easingSwiftOut,
        begin: function () {
          t.addClass("sc-card-minimized"), e.toggleClass("mdi-window-minimize mdi-window-maximize")
        },
        complete: function () {
          i.css({
            transition: ""
          })
        }
      })
    })
  }, scutum.cards.close = function () {
    scutum.var_body.on("click", ".sc-js-card-close", function (s) {
      s.preventDefault();
      var e = $(this),
        t = e.closest(".uk-card"),
        i = "" !== e.attr("data-card-close-remove") ? e.closest(e.attr("data-card-close-remove")) : t;
      t.addClass("uk-animation-scale-up uk-animation-reverse"), t.one("webkitAnimationEnd animationend", function () {
        scutum.helpers.element.remove(i, 100)
      })
    })
  }, scutum.plugins.colorpicker = {
    init: function (s, m, p, h) {
      var e = s ? $(s) : $("[data-sc-colorpicker]");
      e.length && (e.each(function () {
        var s = {
            inline: p || !1,
            pallete: ["#e53935", "#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#039be5", "#0097a7", "#00897b", "#43a047", "#689f38", "#ef6c00", "#f4511e", "#6d4c41", "#757575", "#546e7a"]
          },
          e = $(this),
          t = scutum.helpers.uniqueID(),
          i = m || s.pallete,
          n = e.attr("data-sc-colorpicker");
        if ("" !== n && void 0 !== n && n.startsWith("{")) {
          var a = jQuery.parseJSON(n);
          void 0 !== a.pallete && (i = a.pallete.toString().split(",")), void 0 !== a.inline && (s.inline = !0)
        }
        for (var c = $('<div class="sc-colorpicker" id="' + t + '"/>'), o = $('<div class="sc-colorpicker-dropdown"/>'), r = $('<div class="sc-colorpicker-colors"/>'), u = $('<div class="sc-colorpicker-picker"/>'), l = 0; l < i.length; l++) {
          var d = "<span data-color=" + i[l] + ' style="background-color:' + i[l] + '"></span>';
          s.inline ? r.append(d) : o.append(d)
        }
        e.wrap(c), s.inline ? e.closest(".sc-colorpicker").addClass("sc-colorpicker-inline").prepend(r).prepend(u) : (8 < i.length ? o.css({
          width: 28 * i.length / 2 + "px"
        }) : o.css({
          width: 28 * i.length + "px"
        }), e.closest(".sc-colorpicker").prepend(o).prepend(u)), "" !== e.val() && $(this).closest(".sc-colorpicker").find(".sc-colorpicker-picker").css({
          "background-color": e.val()
        }), scutum.var_body.on("click", "#" + t + " span", function () {
          var s = $(this).closest(".sc-colorpicker");
          $(this).addClass("sc-color-active").siblings().removeClass("sc-color-active"), s.closest(".sc-colorpicker").find("input").val($(this).attr("data-color")), s.closest(".sc-colorpicker").find(".sc-colorpicker-picker").css({
            "background-color": $(this).attr("data-color")
          }), s.closest(".sc-colorpicker").removeClass("sc-colorpicker-active"), "function" == typeof h && h.call(this)
        }), scutum.var_body.on("click", "#" + t + " .sc-colorpicker-picker", function () {
          var s = scutum.var_body.find(".sc-colorpicker-active").not($(this).closest(".sc-colorpicker"));
          s.length && s.removeClass("sc-colorpicker-active"), $(this).closest(".sc-colorpicker").toggleClass("sc-colorpicker-active")
        })
      }), scutum.var_body.on("click", function (s) {
        if (!$(event.target).closest(".sc-colorpicker-dropdown").length && !$(event.target).closest(".sc-colorpicker-picker").length) {
          var e = scutum.var_body.find(".sc-colorpicker-active");
          e.length && e.removeClass("sc-colorpicker-active")
        }
      }))
    }
  }, scutum.forms.common = {}, scutum.forms.common.init = function () {
    scutum.forms.common.inputs(), scutum.forms.common.inputs.autosize(), scutum.forms.common.icheck(), scutum.forms.common.select2(), scutum.forms.common.rating(), scutum.forms.common.switches(), scutum.forms.common.datePicker(), scutum.forms.common.inputMask()
  }, scutum.forms.common.inputs = function (s) {
    (void 0 === s ? $("[data-sc-input]") : $(s).find("[data-sc-input]")).each(function () {
      if (!$(this).closest(".sc-input-wrapper").length) {
        var e = $(this);
        "outline" === e.attr("data-sc-input") && (e.is("input") && e.addClass("sc-input-outline"), e.is("textarea") && e.addClass("sc-textarea-outline"));
        var s = e.siblings("label"),
          t = e.siblings(".uk-form-icon"),
          i = e.next(".uk-form-help-inline");
        e.wrap('<div class="sc-input-wrapper"></div>'), s.length && e.closest(".sc-input-wrapper").prepend(s), t.length && (e.closest(".sc-input-wrapper").prepend(t), t.each(function () {
          var s = $(this);
          s.hasClass("sc-js-input-clear") && s.on("click", function () {
            e.val("").trigger("keyup")
          })
        })), e.hasClass("sc-input-outline") || e.hasClass("sc-textarea-outline") ? e.closest(".sc-input-wrapper").addClass("sc-input-wrapper-outline") : e.closest(".sc-input-wrapper").append('<span class="sc-input-bar"></span>'), scutum.helpers.mq.mediumMin() && i.length && i.insertAfter(e.next(".sc-input-bar")), scutum.forms.common.inputs.update($(this))
      }
      scutum.var_body.on("focus", "[data-sc-input]", function () {
        $(this).closest(".sc-input-wrapper").addClass("sc-input-focus")
      }).on("blur", "[data-sc-input]", function () {
        $(this).closest(".sc-input-wrapper").removeClass("sc-input-focus"), $(this).hasClass("sc-label-fixed") || ("" !== $(this).val() ? $(this).closest(".sc-input-wrapper").addClass("sc-input-filled") : $(this).closest(".sc-input-wrapper").removeClass("sc-input-filled"))
      }).on("keyup change input", "[data-sc-input]", function () {
        $(this).hasClass("sc-label-fixed") || ("" !== $(this).val() ? $(this).closest(".sc-input-wrapper").addClass("sc-input-filled") : $(this).closest(".sc-input-wrapper").removeClass("sc-input-filled"))
      }).on("change", "[data-sc-input]", function () {
        scutum.forms.common.inputs.update($(this))
      }).on("validationClassChanged", "[data-sc-input]", function () {
        $(this).hasClass("uk-form-danger") && $(this).closest(".sc-input-wrapper").addClass("sc-input-wrapper-danger")
      })
    })
  }, scutum.forms.common.inputs.update = function (s) {
    $(s).each(function () {
      var s = $(this);
      s.closest(".uk-input-group").removeClass("uk-input-group-danger uk-input-group-success"), s.closest(".sc-input-wrapper").removeClass("sc-input-wrapper-danger sc-input-wrapper-success sc-input-wrapper-disabled"), s.hasClass("uk-form-danger") && (s.closest(".uk-input-group").length && s.closest(".uk-input-group").addClass("sc-input-group-danger"), s.closest(".sc-input-wrapper").addClass("sc-input-wrapper-danger")), s.hasClass("uk-form-success") && (s.closest(".uk-input-group").length && s.closest(".uk-input-group").addClass("sc-input-group-success"), s.closest(".sc-input-wrapper").addClass("sc-input-wrapper-success")), s.prop("disabled") && s.closest(".sc-input-wrapper").addClass("md-input-wrapper-disabled"), "" !== s.val() ? s.closest(".sc-input-wrapper").addClass("sc-input-filled") : s.closest(".sc-input-wrapper").removeClass("sc-input-filled"), s.hasClass("label-fixed") && s.closest(".sc-input-wrapper").addClass("sc-input-filled")
    })
  }, scutum.forms.common.inputs.disableSubmit = function (s) {
    $(s).each(function () {
      $(this).on("keyup keypress", function (s) {
        if (13 === (s.keyCode || s.which)) return s.preventDefault(), !1
      })
    })
  }, scutum.forms.common.inputs.autosize = function () {
    var s = $("textarea.sc-js-autosize");
    s.length && scutum.require(["autosize"], function () {
      autosize(s)
    })
  }, scutum.forms.common.icheck = function (s) {
    var e = void 0 === s ? $("[data-sc-icheck]") : $(s);
    e.length && scutum.require(["icheck"], function () {
      e.each(function () {
        $(this).next(".iCheck-helper").length || ($(this).iCheck({
          checkboxClass: "sc-icheckbox",
          radioClass: "sc-iradio",
          increaseArea: "20%"
        }).on("ifChanged", function (s) {
          void 0 !== $(this).data("parsleyMultiple") && $(this).parsley().validate()
        }), void 0 !== $(this).attr("data-color") && $(this).closest("div").addClass("sc-icheck-custom").attr("style", "--color:" + $(this).attr("data-color")))
      })
    })
  }, scutum.forms.common.select2 = function (s) {
    var e = s ? $(s).find("select").not(".sc-regular-select") : $("[data-sc-select2]");
    e.length && scutum.require(["select2"], function () {
      $.fn.select2.defaults.set("width", "100%"), $.fn.select2.defaults.set("closeOnSelect", !1), e.each(function () {
        var e = $(this);
        if (!e.data("select2")) {
          var s = e.attr("data-sc-select2");
          if ("" !== s && void 0 !== s && s.startsWith("{")) var t = jQuery.parseJSON(s);
          var i = {
            closeOnSelect: !e.prop("multiple")
          };
          $.each(t, function (s, e) {
            "createTag" === s && "tag_emailAddress" === e && (e = function (s) {
              return scutum.helpers.validation.emailAddress(s.term) ? {
                id: s.term,
                text: s.term
              } : null
            }), "templateResult" === s && "formatCountryResult" === e && (e = function (s) {
              return s.id ? $('<span class="select2-search__flags"><span class="flag flag-' + s.id.toLowerCase() + '"></span><span>' + s.text + "</span>") : s.text
            }), "templateSelection" === s && "formatCountrySelection" === e && (e = function (s, e) {
              return s.id ? $('<span class="select2-selection__flag"><span class="flag flag-' + s.id.toLowerCase() + '"></span><span>' + s.text + "</span>") : s.text
            }), i[s] = e
          }), e.select2(i), e.on("select2:open", function (s) {
            scutum.forms.common.select2.addAnimation()
          }), e.on("change.select2", function (s) {
            void 0 !== $(s.target).data("parsleyId") && e.parsley().validate()
          })
        }
      })
    })
  }, scutum.forms.common.select2.addAnimation = function () {
    var s = $(".select2-dropdown");
    s.hasClass("select2-dropdown--above") ? s.removeClass("uk-animation-slide-top-small").addClass("uk-animation-slide-bottom-small") : s.removeClass("uk-animation-slide-bottom-small").addClass("uk-animation-slide-top-small")
  }, scutum.forms.common.rating = function (s) {
    var e = void 0 === s ? $("[data-sc-raty]") : $(s);
    e.length && scutum.require(["raty"], function () {
      e.each(function (s, e) {
        var t = $(e),
          i = {
            starType: "span",
            scoreName: "score",
            number: 5
          },
          n = JSON.parse(JSON.stringify(t.data("sc-raty")));
        "" !== n && (i = $.extend(i, n)), t.raty(i)
      })
    })
  }, scutum.forms.common.datePicker = function (s) {
    var e = void 0 === s ? $("[data-sc-flatpickr]") : $(s).find("[data-sc-flatpickr]");
    e.length && scutum.require(["flatpickr"], function () {
      e.each(function (s, e) {
        var t = {},
          i = JSON.parse(JSON.stringify($(this).data("sc-flatpickr")));
        "" !== i && (t = $.extend(t, i)), console.log(t), $(this).flatpickr(t)
      }, !0)
    })
  }, scutum.forms.common.switches = function (s) {
    var e = s ? $(s) : $("[data-sc-switchery]");
    e.length && scutum.require(["switchery"], function () {
      e.each(function (s, e) {
        var t = $(e);
        if (!t.data("objSwitchery")) {
          var i = t.attr("data-switchery-size"),
            n = t.attr("data-switchery-color"),
            a = t.attr("data-switchery-secondary-color"),
            c = t.attr("data-switchery-disabled") || t.attr("disabled"),
            o = new Switchery(t[0], {
              color: void 0 !== n ? scutum.helpers.hex2rgba(n, 50) : scutum.helpers.hex2rgba("#90caf9", 100),
              secondaryColor: void 0 !== a ? scutum.helpers.hex2rgba(a, 50) : "rgba(0, 0, 0,0.26)",
              jackColor: void 0 !== n ? scutum.helpers.hex2rgba(n, 100) : scutum.helpers.hex2rgba("#1976d2", 100),
              jackSecondaryColor: void 0 !== a ? scutum.helpers.hex2rgba(a, 100) : "#fafafa",
              size: void 0 !== i ? i : "default",
              disabled: c ? t.attr("data-switchery-disabled") : "false"
            });
          t.data("objSwitchery", o)
        }
      })
    })
  }, scutum.forms.common.switches.onChange = function (s) {
    if ("function" != typeof Event && document.fireEvent) s.fireEvent("onchange");
    else {
      var e = document.createEvent("HTMLEvents");
      e.initEvent("change", !0, !0), s.dispatchEvent(e)
    }
  }, scutum.forms.common.dynamicFields = function (s, n, a, c, o) {
    var r = s ? $(s).find("[data-sc-dynamic-fields]") : $("[data-sc-dynamic-fields]");
    r.length && scutum.require(["handlebars"], function () {
      var t = r,
        s = t.attr("data-sc-dynamic-fields-counter");
      void 0 === s && t.attr("data-sc-dynamic-fields-counter", 0);
      var e = void 0 !== s ? s : 0,
        i = t.data("scDynamicFields");
      a || (scutum.forms.common.dynamicFields.add_fields(t, i, e), void 0 !== c && "function" == typeof c && c(), n && scutum.$win.resize()), t.on("click", ".sc-js-section-clone", function (s) {
        s.preventDefault(), $(this).toggleClass("sc-js-section-clone sc-js-section-remove").children().toggle();
        var e = parseInt(t.attr("data-sc-dynamic-fields-counter")) + 1;
        t.attr("data-sc-dynamic-fields-counter", e), scutum.forms.common.dynamicFields.add_fields(t, i, e), void 0 !== c && "function" == typeof c && c(!0), n && scutum.$win.resize()
      }).on("click", ".sc-js-section-remove", function (s) {
        s.preventDefault(), $(this).closest(".sc-form-section").next("hr").remove().end().remove(), void 0 !== o && "function" == typeof o && o(), n && scutum.$win.resize()
      })
    }, !1)
  }, scutum.forms.common.dynamicFields.add_fields = function (s, e, t) {
    var i = $("#" + e).html(),
      n = Handlebars.compile(i)({
        index: t || 0,
        counter: t ? "__" + t : "__0"
      });
    s.append(n);
    var a = s.children().last();
    scutum.forms.common.inputs(a), scutum.forms.common.icheck(a.find("[data-sc-icheck]")), scutum.forms.common.switches(a.find("[data-sc-switchery]")), scutum.forms.common.select2(a), scutum.forms.common.datePicker(a)
  }, scutum.forms.common.inputMask = function (s) {
    var e = void 0 === s ? $("[data-inputmask]") : $(s);
    e.length && scutum.require(["inputmask"], function () {
      e.each(function (s, e) {
        $(e).inputmask()
      })
    })
  };

  //scutum.init();

</script>
