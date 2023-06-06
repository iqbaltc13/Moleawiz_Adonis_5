@extends('layouts.appfix')
@section('body')
  @php
    $publicUrl = url('/').'/templates/scutum-admin/scutum_v2.1.0/admin/html/dist/'
  @endphp
  <body class="loading" data-layout-mode="detached"
        data-layout='{"mode": "light", "width": "fluid", "menuPosition": "fixed", "sidebar": { "color": "light", "size": "default", "showuser": true}, "topbar": {"color": "dark"}, "showRightSidebarOnPageLoad": true}'>

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
        <a href="#" id="sc-sidebar-main-toggle"><i class="mdi mdi-backburger sc-menu-close"></i><i
            class="mdi mdi-menu sc-menu-open"></i></a>
        <div class="sc-brand uk-visible@s">
          <a href="https://scutum-html.tzdthemes.com/dashboard-v1.html"><img src="{{$publicUrl}}assets/img/logo.png"
                                                                             alt=""></a>
        </div>
      </div>
      <div class="uk-navbar-left nav-overlay uk-margin-right uk-visible@m">
        <ul class="uk-navbar-nav">
          <li>
            <a href="javascript:void(0)" class="md-color-white sc-padding-remove-left"><i class="mdi mdi-view-grid"></i></a>
            <div class="uk-navbar-dropdown sc-padding-medium">
              <div class="uk-child-width-1-2 uk-child-width-1-3@s uk-grid uk-grid-small" data-uk-grid>
                <div>
                  <a href="https://scutum-html.tzdthemes.com/pages-mailbox.html"
                     class="uk-flex uk-flex-column uk-flex-middle uk-box-shadow-hover-small sc-round sc-padding-small">
                    <i class="mdi mdi-email-outline sc-icon-32 sc-text-lh-1 md-color-green-700"></i>
                    <span class="uk-text-medium sc-color-primary">Mailbox</span>
                  </a>
                </div>
                <div>
                  <a href="https://scutum-html.tzdthemes.com/pages-poi_listing.html"
                     class="uk-flex uk-flex-column uk-flex-middle uk-box-shadow-hover-small sc-round sc-padding-small">
                    <i class="mdi mdi-map-marker sc-icon-32 sc-text-lh-1 md-color-red-700"></i>
                    <span class="uk-text-medium sc-color-primary">POI</span>
                  </a>
                </div>
                <div>
                  <a href="https://scutum-html.tzdthemes.com/pages-chat.html"
                     class="uk-flex uk-flex-column uk-flex-middle uk-box-shadow-hover-small sc-round sc-padding-small">
                    <i class="mdi mdi-message-outline sc-icon-32 sc-text-lh-1 md-color-purple-700"></i>
                    <span class="uk-text-medium sc-color-primary">Chat</span>
                  </a>
                </div>
                <div>
                  <a href="https://scutum-html.tzdthemes.com/plugins-calendar.html"
                     class="uk-flex uk-flex-column uk-flex-middle uk-box-shadow-hover-small sc-round sc-padding-small">
                    <i class="mdi mdi-calendar sc-icon-32 sc-text-lh-1 md-color-light-blue-700"></i>
                    <span class="uk-text-medium sc-color-primary">Calendar</span>
                  </a>
                </div>
                <div>
                  <a href="https://scutum-html.tzdthemes.com/pages-user_profile.html"
                     class="uk-flex uk-flex-column uk-flex-middle uk-box-shadow-hover-small sc-round sc-padding-small">
                    <i class="mdi mdi-account sc-icon-32 sc-text-lh-1 md-color-blue-grey-700"></i>
                    <span class="uk-text-medium sc-color-primary">Profile</span>
                  </a>
                </div>
                <div>
                  <a href="https://scutum-html.tzdthemes.com/plugins-charts.html"
                     class="uk-flex uk-flex-column uk-flex-middle uk-box-shadow-hover-small sc-round sc-padding-small">
                    <i class="mdi mdi-chart-multiline sc-icon-32 sc-text-lh-1 md-color-amber-700"></i>
                    <span class="uk-text-medium sc-color-primary">Charts</span>
                  </a>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div class="nav-overlay nav-overlay-small uk-navbar-right">
        <ul class="uk-navbar-nav">
          <li>
            <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Beranda</a>
          </li>
          <li class="sc-has-submenu">

            <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Master</a>
            <ul style="display: none;">
              <li>
                <a href="{{route('dashboard.master.role.index')}}">Role</a>
              </li>
              <li>
                <a href="{{route('dashboard.master.permission.index')}}">Permission</a>
              </li>

            </ul>
          </li>

          <li>
            <a href="{{route('dashboard.user.index')}}">Pengaturan</a>
            {{-- <ul style="display: none;">
                <li>
                    <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Level 1.0.0</a>
                </li>
                <li>
                    <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Level 1.0.0</a>
                </li>
                <li class="sc-has-submenu">
                    <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Level 1.0.0</a>
                    <ul>
                        <li>
                            <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Level 1.1.0</a>
                        </li>
                        <li class="sc-has-submenu">
                            <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Level 1.1.0</a>
                            <ul>
                                <li>
                                    <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Level 1.1.1</a>
                                </li>
                                <li>
                                    <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Level 1.1.1</a>
                                </li>
                                <li>
                                    <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Level 1.1.1</a>
                                </li>
                                <li>
                                    <a href="https://scutum-html.tzdthemes.com/layout-top_menu.html#">Level 1.1.1</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>--}}
          </li>
          <li>
            <a class="uk-navbar-toggle uk-visible@m" href="#"
               data-uk-toggle="target: .nav-overlay; animation: uk-animation-slide-top"><i class="mdi mdi-magnify"></i></a>
            <a class="uk-navbar-toggle uk-hidden@m" href="#" id="sc-search-main-toggle-mobile"
               data-uk-toggle="target: .nav-overlay-small; animation: uk-animation-slide-top"><i
                class="mdi mdi-magnify"></i></a>
          </li>
          <li class="uk-visible@l">
            <a href="#" id="sc-js-fullscreen-toggle"><i class="mdi mdi-fullscreen sc-js-el-hide"></i><i
                class="mdi mdi-fullscreen-exit sc-js-el-show"></i></a>
          </li>
          <li class="uk-visible@s">
            <a href="#" class="sc-text-semibold">
              EN
            </a>
            <div class="uk-navbar-dropdown uk-dropdown-small">
              <ul class="uk-nav uk-navbar-dropdown-nav">
                <li><a href="#">Deutsch</a></li>
                <li><a href="#">Español</a></li>
                <li><a href="#">Français</a></li>
              </ul>
            </div>
          </li>
          <li>
            <a href="#">
              <span class="mdi mdi-email"></span>
            </a>
            <div class="uk-navbar-dropdown sc-padding-remove">
              <div class="uk-panel uk-panel-scrollable uk-height-medium">
                <ul class="uk-list uk-list-divider sc-js-edge-fix">
                  <li class="sc-list-group">
                    <div class="sc-list-addon">
                      <span class="sc-avatar-initials md-color-white md-bg-red-500" title="west.herta">MO</span>
                    </div>
                    <a href="#" class="sc-list-body uk-display-block">
                      <span class="uk-text-small uk-text-muted uk-width-expand">07:55 AM</span>
                      <span class="uk-display-block uk-text-truncate">Odio optio animi voluptas nam aut vel.</span>
                    </a>
                  </li>
                  <li class="sc-list-group">
                    <div class="sc-list-addon">
                      <img src="{{$publicUrl}}assets/img/avatars/avatar_05_sm.png" class="sc-avatar " alt="tschuster"/>
                    </div>
                    <a href="#" class="sc-list-body uk-display-block">
                      <div class="uk-text-small uk-text-muted uk-width-expand">Sep 17, 2019</div>
                      <span class="uk-display-block uk-text-truncate">Dolorem quae aut perspiciatis voluptatibus ut sunt nobis et assumenda est.</span>
                    </a>
                  </li>
                  <li class="sc-list-group">
                    <div class="sc-list-addon">
                      <span class="sc-avatar-initials md-color-white md-bg-light-green-500" title="gpacocha">KS</span>
                    </div>
                    <a href="#" class="sc-list-body uk-display-block">
                      <span class="uk-text-small uk-text-muted uk-width-expand">05:55 AM</span>
                      <span class="uk-display-block uk-text-truncate">Assumenda dolores et iure voluptas ipsam.</span>
                    </a>
                  </li>
                  <li class="sc-list-group">
                    <div class="sc-list-addon">
                      <img src="{{$publicUrl}}assets/img/avatars/avatar_06_sm.png" class="sc-avatar "
                           alt="roob.margarett"/>
                    </div>
                    <a href="#" class="sc-list-body uk-display-block">
                      <span class="uk-text-small uk-text-muted uk-width-expand">Sep 16, 2019</span>
                      <span class="uk-display-block uk-text-truncate">Eius quisquam repudiandae quasi ut deserunt ut necessitatibus voluptatem.</span>
                    </a>
                  </li>
                  <li class="sc-list-group">
                    <div class="sc-list-addon">
                      <img src="{{$publicUrl}}assets/img/avatars/avatar_02_sm.png" class="sc-avatar "
                           alt="frankie.lockman"/>
                    </div>
                    <a href="#" class="sc-list-body uk-display-block">
                      <span class="uk-text-small uk-text-muted uk-width-expand">Sep 14, 2019</span>
                      <span class="uk-display-block uk-text-truncate">Laboriosam laboriosam quas aut cupiditate hic dolore eaque commodi excepturi.</span>
                    </a>
                  </li>
                  <li class="sc-list-group">
                    <div class="sc-list-addon">
                      <span class="sc-avatar-initials md-color-white md-bg-purple-500" title="steuber.ila">FA</span>
                    </div>
                    <a href="#" class="sc-list-body uk-display-block">
                      <span class="uk-text-small uk-text-muted uk-width-expand">Sep 12, 2019</span>
                      <span class="uk-display-block uk-text-truncate">Quaerat in eius suscipit ea tenetur dolor.</span>
                    </a>
                  </li>
                </ul>
              </div>
              <a href="https://scutum-html.tzdthemes.com/pages-mailbox.html"
                 class="uk-flex uk-text-small sc-padding-small-ends sc-padding-medium">Show all in mailbox</a>
            </div>
          </li>
          <li class="uk-visible@s">
            <a href="#">
						<span class="mdi mdi-bell uk-display-inline-block">
							<span class="sc-indicator md-bg-color-red-600"></span>
						</span>
            </a>
            <div class="uk-navbar-dropdown md-bg-grey-100">
              <div class="sc-padding-medium sc-padding-small-ends">
                <div class="uk-text-right uk-margin-medium-bottom">
                  <button class="sc-button sc-button-outline sc-button-mini sc-js-clear-alerts">Clear all</button>
                </div>
                <ul class="uk-list uk-margin-remove" id="sc-header-alerts">
                  <li class="sc-border sc-round md-bg-white">
                    <div class="uk-margin-right uk-margin-small-left"><i
                        class="mdi mdi-alert-outline md-color-red-600"></i></div>
                    <div class="uk-flex-1 uk-text-small">
                      Information Page Not Found!
                    </div>
                  </li>
                  <li class="uk-margin-small-top sc-border sc-round md-bg-white">
                    <div class="uk-margin-right uk-margin-small-left"><i
                        class="mdi mdi-email-check-outline md-color-blue-600"></i></div>
                    <div class="uk-flex-1 uk-text-small">
                      A new password has been sent to your e-mail address.
                    </div>
                  </li>
                  <li class="uk-margin-small-top sc-border sc-round md-bg-white">
                    <div class="uk-margin-right uk-margin-small-left"><i
                        class="mdi mdi-alert-outline md-color-red-600"></i></div>
                    <div class="uk-flex-1 uk-text-small">
                      You do not have permission to access the API!
                    </div>
                  </li>
                  <li class="uk-margin-small-top sc-border sc-round md-bg-white">
                    <div class="uk-margin-right uk-margin-small-left"><i
                        class="mdi mdi-check-all md-color-light-green-600"></i></div>
                    <div class="uk-flex-1 uk-text-small">
                      Your enquiry has been successfully sent.
                    </div>
                  </li>
                </ul>
                <div class="uk-text-medium uk-text-center sc-js-empty-message sc-text-semibold sc-padding-ends"
                     style="display: none">No alerts!
                </div>
              </div>
            </div>
          </li>
          <li>
            <a href="#"><img src="{{$publicUrl}}assets/img/avatars/avatar_default_sm.png" alt=""></a>
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

  <aside id="sc-sidebar-main">
    <div class="uk-offcanvas-bar">
      <div data-sc-scrollbar="visible-y">
        <ul class="sc-sidebar-menu uk-nav">


          <li class="sc-sidebar-menu-heading"><span>Applications</span></li>


          <li title="Chat">
            <a href="https://scutum-html.tzdthemes.com/pages-chat.html">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-message-outline"></i>

	                    </span><span class="uk-nav-title">Chat</span>
            </a>
          </li>

          <li title="Invoices">
            <a href="https://scutum-html.tzdthemes.com/pages-invoices.html">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-receipt"></i>

	                    </span><span class="uk-nav-title">Invoices</span>
            </a>
          </li>

          <li title="Mailbox">
            <a href="https://scutum-html.tzdthemes.com/pages-mailbox.html">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-email-outline"></i>

	                    </span><span class="uk-nav-title">Mailbox</span>
            </a>
          </li>

          <li title="Task Board">
            <a href="https://scutum-html.tzdthemes.com/pages-task_board.html">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-calendar-text"></i>

	                    </span><span class="uk-nav-title">Task Board</span>
            </a>
          </li>

          <li title="Notes">
            <a href="https://scutum-html.tzdthemes.com/pages-notes.html">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-note-outline"></i>

	                    </span><span class="uk-nav-title">Notes</span>
            </a>
          </li>


          <li class="sc-sidebar-menu-heading"><span>Menu</span></li>


          <li title="Dashboards">
            <a href="#">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-view-dashboard-variant"></i>

	                    </span><span class="uk-nav-title">Dashboards</span>
            </a>

            <ul class="sc-sidebar-menu-sub">

              <li>

                <a href="https://scutum-html.tzdthemes.com/dashboard-v1.html"> Dashboard 1 </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/dashboard-v2.html"> Dashboard 2 </a>

              </li>


            </ul>
          </li>

          <li title="Forms">
            <a href="#">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-format-line-style"></i>

	                    </span><span class="uk-nav-title">Forms</span>
            </a>

            <ul class="sc-sidebar-menu-sub">

              <li>

                <a href="https://scutum-html.tzdthemes.com/forms-regular_elements.html"> Regular Elements </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/forms-advanced_elements.html"> Advanced Elements </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/forms-dynamic_fields.html"> Dynamic Fields </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/forms-validation.html"> Validation </a>

              </li>


              <li>
                <a href="#">Form Examples</a>
                <ul>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-advertising_evaluation_form.html">
                      Advertising Evaluation Form </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-booking_form.html"> Booking Form </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-car_rental_form.html"> Car Rental
                      Form </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-checkout_form.html"> Checkout Form </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-contact_forms.html"> Contact Forms </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-job_application_form.html"> Job
                      Application Form </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-medical_history_form.html"> Medical
                      History Form </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-registration_form.html"> Registration
                      Form </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-rental_application_form.html"> Rental
                      Application Form </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_examples-transaction_feedback_form.html">
                      Transaction Feedback Form </a>
                  </li>

                </ul>
              </li>


              <li>
                <a href="#">Wizard</a>
                <ul>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_wizard-horizontal.html"> Horizontal </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_wizard-horizontal_minimal.html"> Horizontal
                      Minimal </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_wizard-vertical.html"> Vertical </a>
                  </li>
                  <li>
                    <a href="https://scutum-html.tzdthemes.com/forms_wizard-vertical_minimal.html"> Vertical
                      Minimal </a>
                  </li>

                </ul>
              </li>


              <li class="sc-sidebar-menu-heading"><span>WYSIWYG Editors</span></li>
              <li>
                <a href="https://scutum-html.tzdthemes.com/forms_wysiwyg-ckeditor.html"> CKEditor </a>
              </li>
              <li>
                <a href="https://scutum-html.tzdthemes.com/forms_wysiwyg-tinymce.html"> TinyMCE </a>
              </li>


            </ul>
          </li>

          <li title="Components">
            <a href="#">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-puzzle"></i>

	                    </span><span class="uk-nav-title">Components</span>
            </a>

            <ul class="sc-sidebar-menu-sub">

              <li>

                <a href="https://scutum-html.tzdthemes.com/components-accordion.html"> Accordion </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-alert.html"> Alert </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-animations.html"> Animations </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-avatars.html"> Avatars </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-badge_label.html"> Badge, Label </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-base.html"> Base </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-breadcrumb.html"> <span
                    class="uk-label">new</span>
                  Breadcrumb </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-buttons.html"> Buttons </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-fab_buttons.html"> FAB Buttons </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-cards.html"> Cards </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-color_palette.html"> Color Palette </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-drop_dropdowns.html"> Drop/Dropdowns </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-filters.html"> Filters </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-footer.html"> Footer </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-grid.html"> Grid </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-icons.html"> Icons </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-lists.html"> Lists </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-masonry.html"> Masonry </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-modals_dialogs.html"> Modals/Dialogs </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-notifications.html"> Notifications </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-pagination.html"> <span
                    class="uk-label">new</span>
                  Pagination </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-progress_spinners.html"> Progress/Spinners </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-scrollable.html"> Scrollable </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-slider.html"> Slider </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-sortable.html"> Sortable </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-tables.html"> Tables </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-tabs.html"> Tabs </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-timeline.html"> Timeline </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-toolbar.html"> Toolbar </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/components-tooltips.html"> Tooltips </a>

              </li>


            </ul>
          </li>

          <li title="Pages">
            <a href="#">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-application"></i>

	                    </span><span class="uk-nav-title">Pages</span>
            </a>

            <ul class="sc-sidebar-menu-sub">

              <li class="sc-page-active">

                <a href="https://scutum-html.tzdthemes.com/pages-blank.html"> Blank </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/pages-blank_header_expanded.html"> Blank (expanded
                  header) </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/pages-contact_list.html"> Contact List </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/pages-contact_list_single.html"> Contact List (single) </a>

              </li>


              <li class="sc-sidebar-menu-heading"><span>Error Pages</span></li>
              <li>
                <a href="https://scutum-html.tzdthemes.com/error_404.html"> Error 404 </a>
              </li>
              <li>
                <a href="https://scutum-html.tzdthemes.com/error_500.html"> Error 500 </a>
              </li>


              <li class="sc-sidebar-menu-separator"></li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/pages-gallery.html"> Gallery </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/pages-help_faq.html"> Help/Faq </a>

              </li>


              <li class="sc-sidebar-menu-heading"><span>Issue Tracker</span></li>
              <li>
                <a href="https://scutum-html.tzdthemes.com/pages-issues_list.html"> <span class="uk-label">new</span>
                  List View </a>
              </li>
              <li>
                <a href="https://scutum-html.tzdthemes.com/pages-issue_details.html"> <span class="uk-label">new</span>
                  Issue Details </a>
              </li>


              <li class="sc-sidebar-menu-separator"></li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/login_page.html"> Login Page </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/pages-poi_listing.html"> POI listing </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/pages-pricing_tables.html"> Pricing Tables </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/pages-settings.html"> Settings </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/pages-user_profile.html"> User Profile </a>

              </li>


            </ul>
          </li>

          <li title="Plugins">
            <a href="#">
	                    	                        <span class="uk-nav-icon"><i class="mdi mdi-power-plug"></i>

	                    </span><span class="uk-nav-title">Plugins</span>
            </a>

            <ul class="sc-sidebar-menu-sub">

              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-ajax.html"> Ajax </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-calendar.html"> Calendar </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-charts.html"> Charts </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-code_editor.html"> Code Editor </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-data_grid.html"> Data Grid </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-datatables.html"> Datatables </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-diff_tool.html"> Diff Tool </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-gantt_chart.html"> Gantt Chart </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-google_maps.html"> Google Maps </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-idle_timeout.html"> Idle Timeout </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-image_cropper.html"> Image Cropper </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-push_notifications.html"> Push Notifications </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-tour.html"> Tour </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-tree.html"> Tree </a>

              </li>


              <li>

                <a href="https://scutum-html.tzdthemes.com/plugins-vector_maps.html"> Vector Maps </a>

              </li>


            </ul>
          </li>
          <li title="Multi-level">
            <a href="#">
              <span class="uk-nav-icon"><i class="mdi mdi-format-line-weight"></i></span><span class="uk-nav-title">Multi level</span>
            </a>
            <ul class="sc-sidebar-menu-sub">
              <li><a href="#">Submenu 1</a></li>
              <li class="sc-js-submenu- sc-has-submenu">
                <a href="#">Submenu 2</a>
                <ul>
                  <li><a href="#">Submenu 2.1</a></li>
                  <li>
                    <a href="#">Submenu 2.2</a>
                    <ul>
                      <li><a href="#">Submenu 2.2.1</a></li>
                      <li><a href="#">Submenu 2.2.2</a></li>
                      <li><a href="#">Submenu 2.2.3</a></li>
                    </ul>
                  </li>
                  <li><a href="#">Submenu 2.3</a></li>
                  <li><a href="#">Submenu 2.4</a></li>
                </ul>
              </li>
              <li><a href="#">Submenu 3</a></li>
              <li>
                <a href="#">Submenu 4</a>
                <ul>
                  <li>
                    <a href="#">Submenu 4.1</a>
                    <ul>
                      <li><a href="#">Submenu 4.1.1</a></li>
                      <li><a href="#">Submenu 4.1.2</a></li>
                      <li><a href="#">Submenu 4.1.3</a></li>
                    </ul>
                  </li>
                  <li><a href="#">Submenu 4.2</a></li>
                  <li><a href="#">Submenu 4.3</a></li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>

      </div>
    </div>
    <div class="sc-sidebar-info">
      version: 2.1.0
    </div>
  </aside>
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
    // ----------- CSS
    // md icons
    loadjs(publicUrlAsset + 'assets/css/materialdesignicons.min.css', {
      preload: true
    });
    // UIkit
    loadjs(publicUrlAsset + 'node_modules/uikit/dist/css/uikit.min.css', {
      preload: true
    });
    // themes
    loadjs(publicUrlAsset + 'assets/css/themes/themes_combined.min.css', {
      preload: true
    });
    // mdi icons (base64) & google fonts (base64)
    loadjs([publicUrlAsset + 'assets/css/fonts/mdi_fonts.css', publicUrlAsset + 'assets/css/fonts/roboto_base64.css', publicUrlAsset + 'assets/css/fonts/sourceCodePro_base64.css'], {
      preload: true
    });
    // main stylesheet
    loadjs(publicUrlAsset + 'assets/css/main.min.css', function () {
    });
    // vendor
    loadjs(publicUrlAsset + 'assets/js/vendor.min.js', function () {
      // scutum common functions/helpers
      loadjs(publicUrlAsset + 'assets/js/scutum_common_laravel.min.js', function () {
        scutum.init();

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
        loadjs([publicUrlAsset + 'assets/js/style_switcher.min.js', publicUrlAsset + 'assets/css/plugins/style_switcher.min.css'], {
          success: function () {
            $(function () {
              scutum.styleSwitcher();
            });
          }
        });
      });
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
@endsection
