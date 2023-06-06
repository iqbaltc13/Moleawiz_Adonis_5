'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');
Route.post('api/login-api', 'Api/Auth/LoginController.index').as('login-api');
Route.get('api/scheduller', 'Api/NotificationSchedullerController.index');
Route.get('api/send_notif', 'Api/NotificationSchedullerController.send_notif');
Route.get('api/send_notif_spv', 'Api/NotificationSchedullerSpvController.send_notif_spv');
Route.get('api/send_notif_nha', 'Api/NotificationSchedullerNhaController.send_notif_nha');
Route.get('api/send_mail', 'Api/NotificationSchedullerController.send_mail');
Route.get('api/send_mail_spv', 'Api/NotificationSchedullerSpvController.send_mail_spv');
Route.get('api/send_mail_nha', 'Api/NotificationSchedullerNhaController.send_mail_nha');
//register
Route.post('api/register', 'Api/RegisterController.index');
Route.post('api/register/cancel', 'Api/RegisterController.cancel');
Route.post('api/register/verify', 'Api/RegisterController.verify');



// Send Password Recovery
Route.post('api/check_username', 'Api/PasswordRecoveryController.checkUsername');
Route.post('api/recover_password_sms', 'Api/PasswordRecoveryController.smsRecovery');
Route.post('api/recover_password_email', 'Api/PasswordRecoveryController.emailRecovery');

Route.group(() => {

  //achivement
  Route.get('achievement/module/:id', 'Api/AchievementController.module');
  Route.get('achievement/journey/:id', 'Api/AchievementController.journey');
  Route.get('achievement/course/:id', 'Api/AchievementController.course');

  //contact
  Route.get('contact', 'Api/ContactController.index');
  Route.post('contact', 'Api/ContactController.add');
  Route.post('remove', 'Api/ContactController.remove');
  Route.post('search', 'Api/ContactController.search');

  //Module PDCA
  Route.get('pdca/get_supervisor/:id', 'Api/ModulePdcaController.getSupervisor');
  Route.post('pdca/add_participant', 'Api/ModulePdcaController.addParticipant');
  Route.get('pdca/get_user/:username/:id', 'Api/ModulePdcaController.getUser');
  Route.get('pdca/get_participant/:id', 'Api/ModulePdcaController.getParticipant');

  //chat
  Route.get('chat', 'Api/ChatController.index');
  Route.get('chat/:id', 'Api/ChatController.view');
  Route.post('chat/search', 'Api/ChatController.search');
  Route.post('chat/send', 'Api/ChatController.send');

  //rating
  Route.get('rating/check/:id', 'Api/RatingModuleController.check_get_rating');
  Route.post('rating/submit', 'Api/RatingModuleController.submit_rating');

  //competency
  Route.get('journey/:id/competency', 'Api/CompetencyController.job_role_competency');
  Route.get('competency/progress', 'Api/CompetencyController.competency_progress');

  //profile
  Route.get('profile', 'Api/ProfileController.index');
  Route.get('profile/learning_progress', 'Api/ProfileController.progress');
  Route.get('profile/achievement', 'Api/ProfileController.achievement');
  Route.get('profile/:id', 'Api/ProfileController.view');

  //country
  Route.get('country', 'Api/CountryController.index');

  //team_monitoring
  Route.get('team/monitoring', 'Api/TeamMonitoringController.index');

  //dashboard
  Route.get('dashboard/completion', 'Api/DashboardController.completion');

  //tracker
  Route.post('module/completion_check', 'Api/TrackerController.check_module_complete');
  Route.post('journey/completion', 'Api/TrackerController.check_completion');
  Route.post('journey/completion/browser', 'Api/TrackerController.check_completion_browser');
  Route.post('module/scorm_get', 'Api/TrackerController.get_data');
  Route.post('module/scorm_force_attempt', 'Api/TrackerController.delete_last_attempt');
  Route.post('module/scorm_track', 'Api/TrackerController.scorm');
  Route.post('module/scorm_track_offline', 'Api/TrackerController.scorm_offline');

  //placement test
  Route.get('placement_test/check_is_submit/:id', 'Api/PlacementTestController.check_is_submit');
  Route.get('placement_test/submit_result/:id', 'Api/PlacementTestController.submit_result');

  //Gamification
  Route.get('gamification/redeem_reward/:journey_id/:reward_id', 'Api/GamificationController.redeem_reward');
  Route.get('gamification/journey_reward/detail/:journey_id/:reward_id', 'Api/GamificationController.journey_reward_detail');
  Route.get('gamification/journey_reward/:journey_id', 'Api/GamificationController.journey_reward');
  Route.get('gamification/reward_history/:journey_id', 'Api/GamificationController.reward_history');
  Route.post('gamification/check_get_point', 'Api/GamificationController.check_get_point');

  //learning history
  Route.post('search_all', 'Api/LearningHistoryController.search_all');
  Route.post('search/content_library', 'Api/LearningHistoryController.search_content_library');
  Route.get('content_library', 'Api/LearningHistoryController.content_library');
  Route.get('learning_history/learning_journey/:page', 'Api/LearningHistoryController.learning_journey_history');
  Route.get('learning_history/content_library/:page', 'Api/LearningHistoryController.learning_content_history');
  Route.get('continue_learning/content_library/:page', 'Api/LearningHistoryController.continue_learning_content');
  Route.get('continue_learning/learning_journey/:page', 'Api/LearningHistoryController.continue_learning_journey');
  Route.get('content_library/:content_id/detail/:page', 'Api/LearningHistoryController.detail');

  //Point Extra
  Route.get('point_extra', 'Api/PointExtraController.index');

  //Version
  Route.post('version', 'Api/VersionController.index');

  //Deeplink
  Route.post('deeplink/check', 'Api/DeeplinkController.checkLink');

  //User
  Route.get('user', 'Api/UserController.index');
  Route.post('user/logout', 'Api/UserController.logout');
  Route.post('user/upload', 'Api/UserController.upload');

  //Recover Password
  Route.post('change_temp_password', 'Api/PasswordRecoveryController.change_temp_password');

  //Journey
  Route.get('journey', 'Api/JourneyController.index');
  Route.get('journey/:id/course', 'Api/JourneyController.course');
  Route.get('journey/:id/course/:course_id/module', 'Api/JourneyController.module');
  Route.get('journey/:id/participant/:page?', 'Api/JourneyController.participant');
  Route.get('journey/:id/course/:course_id/module/:module_id', 'Api/JourneyController.module_view');
  Route.get('journey/:id/course/:course_id/module_support', 'Api/JourneyController.module_support');
  Route.get('journey/:id/leaderboard', 'Api/JourneyController.leaderboard');

  //Search
  Route.post('all/search', 'Api/JourneyController.search_all');
  Route.post('journey/search/participant/:page?', 'Api/JourneyController.search_participant');
  
  //Detail Leaderboard
  Route.get('leaderboard/journey/detail/:journey_id', 'Api/JourneyController.detail_lj');
  
  //Notification
  Route.get('notification', 'Api/NotificationController.index');
  Route.get('notification/learning', 'Api/NotificationController.learning');
  Route.post('notification/blast', 'Api/NotificationController.blast');
  Route.post('notification/push', 'Api/NotificationController.push');
  Route.post('notification/push_reward', 'Api/NotificationController.push_reward');
  Route.post('notification/push_point', 'Api/NotificationController.push_point');
  Route.post('notification/push_support', 'Api/NotificationController.push_support');
  Route.get('notification/system/:notification_id/:user_id', 'Api/NotificationController.push_system');

  //Notification With Paging
  Route.get('notification/systems/page/:page', 'Api/NotificationController.system_page');
  Route.get('notification/learning/page/:page', 'Api/NotificationController.learning_page');
  
  //Show Popup Reminder
  Route.get('reminder/show', 'Api/NotificationSchedullerController.show_popup');
  
  //Review Module
  Route.get('review/user', 'Api/ReviewController.index');
  Route.get('review/module/:id', 'Api/ReviewController.module');
  Route.get('review/detail/:id/:user_id?', 'Api/ReviewController.detail');
  Route.get('review/grade', 'Api/ReviewController.review_grade');

}).middleware(['authApi']).prefix('api')


Route.on('/').render('welcome');
Route.get('/home', 'Dashboard/DashboardController.home').as('home').middleware(['auth']);
Route.get('/dashboard', 'Dashboard/DashboardController.index').as('dashboard').middleware(['auth']);
Route.get('login', 'Auth/LoginController.getLogin').as('login');
Route.post('login', 'Auth/LoginController.postLogin').as('login');
Route.post('logout', 'Auth/LoginController.postLogout').as('logout').middleware(['auth']);
Route.get('logout', 'Auth/LoginController.postLogout').as('logout').middleware(['auth']);
Route.on('/dashboard-no-login').render('dashboard.dashboard_no_login');
Route.get('get-data-theme-no-login', 'Setting/ThemeController.getDataThemes').as('setting.get-data-theme-no-login');





Route.group(() => {
  Route.get('get-enrolled-user', 'Dashboard/DashboardController.getEnrolledUserAjax').as('dashboard.get-enrolled-user');
  Route.get('get-active-user', 'Dashboard/DashboardController.getActiveUsersAjax').as('dashboard.get-active-user');
  Route.get('get-completions-by-directorate-top', 'Dashboard/DashboardController.getCompletionsByDirectorateTop5Ajax').as('dashboard.get-completions-by-directorate-top');
  Route.get('get-completions-by-learning-program-top', 'Dashboard/DashboardController.getCompletionsByLearningProgramTop5Ajax').as('dashboard.get-completions-by-learning-program-top');
  Route.get('get-completion-by-content-library-top', 'Dashboard/DashboardController.getCompletionByContentLibraryTop5Ajax').as('dashboard.get-completion-by-content-library-top');
  Route.get('get-highest-users-by-poin-xtra', 'Dashboard/DashboardController.getHighestUsersByPoinXtraAjax').as('dashboard.get-highest-users-by-poin-xtra');
  Route.get('get-highest-users-by-poin-xtra-all', 'Dashboard/DashboardController.getHighestUsersByPoinXtraAllAjax').as('dashboard.get-highest-users-by-poin-xtra-all');
  Route.get('go-access-user-new', 'Dashboard/DashboardController.goAccessUserNewAjax').as('dashboard.go-access-user-new');
}).middleware(['auth']).prefix('dashboard');

Route.group(() => {
  Route.get('index', 'Dashboard/Report/ReportController.index').as('dashboard.report.index');
  Route.get('test-excel', 'Dashboard/Report/ReportController.testExcelJs').as('dashboard.report.test-excel');
  Route.get('get-master-learner', 'Dashboard/Report/ReportController.getMasterLearner').as('dashboard.report.get-master-learner');
  Route.get('get-master-directorate', 'Dashboard/Report/ReportController.getMasterDirectorate').as('dashboard.report.get-master-directorate');
  Route.get('get-master-division', 'Dashboard/Report/ReportController.getMasterDivision').as('dashboard.report.get-master-division');
  Route.get('get-master-program', 'Dashboard/Report/ReportController.getMasterProgram').as('dashboard.report.get-master-program');

  Route.get('get-master-program-select2', 'Dashboard/Report/ReportController.getMasterProgramSelect2').as('dashboard.report.get-master-program-select2');
  Route.get('get-master-course', 'Dashboard/Report/ReportController.getMasterCourse').as('dashboard.report.get-master-course');
  Route.get('get-master-module', 'Dashboard/Report/ReportController.getMasterModule').as('dashboard.report.get-master-module');
  Route.get('get-master-course-multi-program', 'Dashboard/Report/ReportController.getMasterCourseMultipProgram').as('dashboard.report.get-master-course-multi-program');
  Route.get('get-master-module-multi-course', 'Dashboard/Report/ReportController.getMasterModuleMultiCourse').as('dashboard.report.get-master-module-multi-course');
  Route.get('get-master-active-user', 'Dashboard/Report/ReportController.getActiveUserTrueData').as('dashboard.report.get-master-active-user');
  Route.get('get-master-content-library', 'Dashboard/Report/ReportController.getContentLibraryData').as('dashboard.report.get-content-library');
  Route.get('index-content-rating-report', 'Dashboard/Report/RatingModuleController.index').as('dashboard.report.content-rating.index');
  Route.get('datatable-content-rating-report', 'Dashboard/Report/RatingModuleController.datatable').as('dashboard.report.content-rating.datatable');
  Route.get('index-detail-content-rating-report/:module_id', 'Dashboard/Report/RatingModuleController.indexDetail').as('dashboard.report.content-rating.index-detail');
  Route.get('datatable-detail-content-rating-report/:module_id', 'Dashboard/Report/RatingModuleController.datatableDetail').as('dashboard.report.content-rating.datatable-detail');
}).middleware(['auth','role:admin']).prefix('dashboard/report');

Route.group(() => {
  Route.get('index', 'Dashboard/Report/RegsteredUserController.report').as('dashboard.report.registered-learners.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/registered-learners');



Route.group(() => {
  Route.get('index', 'Dashboard/Report/AccessLearnerController.report').as('dashboard.report.learners-access.index');
  Route.get('detail', 'Dashboard/Report/AccessLearnerController.reportDetail').as('dashboard.report.learners-access.detail');

}).middleware(['auth','role:admin']).prefix('dashboard/report/learners-access');

Route.group(() => {
  Route.get('index', 'Dashboard/Report/ActiveLearnerController.report').as('dashboard.report.active-learners.index');
}).middleware(['auth', 'role:admin']).prefix('dashboard/report/active-learners');

Route.group(() => {
  Route.get('index', 'Dashboard/Report/PointXtraController.report').as('dashboard.report.learning-point.index');
}).middleware(['auth', 'role:admin']).prefix('dashboard/report/learning-point');
Route.group(() => {
  Route.get('index', 'Dashboard/Report/DetailPointXtraController.report').as('dashboard.report.detail-learning-point.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/detail-learning-point');

Route.group(() => {
  Route.get('index', 'Dashboard/Report/CertificateNumberController.report').as('dashboard.report.certificate-number.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/certificate-number');

Route.group(() => {
  Route.get('index', 'Dashboard/Report/LearningLogController.report').as('dashboard.report.learning-log.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/learning-log');
Route.group(() => {
  Route.get('index', 'Dashboard/Report/LearningHourV1Controller.report').as('dashboard.report.learning-hours-1.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/learning-hours-1');
Route.group(() => {
  Route.get('index', 'Dashboard/Report/LearningHourV2Controller.report').as('dashboard.report.learning-hours-2.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/learning-hours-2');
Route.group(() => {
  Route.get('index', 'Dashboard/Report/DetailLearningHourController.report').as('dashboard.report.detail-learning-hours.index');
}).middleware(['auth', 'role:admin']).prefix('dashboard/report/detail-learning-hours');
Route.group(() => {
  Route.get('index', 'Dashboard/Report/LearningCompletionV1Controller.report').as('dashboard.report.journey-learning-completions.index');
}).middleware(['auth', 'role:admin']).prefix('dashboard/report/journey-learning-completions');
Route.group(() => {
  Route.get('index', 'Dashboard/Report/LearningCompletionV2Controller.report').as('dashboard.report.course-learning-completions.index');
}).middleware(['auth', 'role:admin']).prefix('dashboard/report/course-learning-completions');
Route.group(() => {
  Route.get('index', 'Dashboard/Report/LearningCompletionV3Controller.report').as('dashboard.report.multi-journey-learning-completions.index');
}).middleware(['auth', 'role:admin']).prefix('dashboard/report/multi-journey-learning-completions');
Route.group(() => {
  Route.get('index', 'Dashboard/Report/ContentLibraryCompletionController.report').as('dashboard.report.content-library-completions.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/content-library-completions');
Route.group(() => {
  Route.get('index', 'Dashboard/Report/SummaryLearningCompletionController.report').as('dashboard.report.summary-learning-completions.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/summary-learning-completions');

Route.group(() => {
  Route.get('index', 'Dashboard/Report/YearToDateSummaryLearningCompletionController.report').as('dashboard.report.ytd-summary-learning-completions.index');
}).middleware(['auth', 'role:admin']).prefix('dashboard/report/ytd-summary-learning-completions');

Route.group(() => {
  Route.get('index', 'Dashboard/Report/MonthToDateSummaryLearningCompletionController.report').as('dashboard.report.mtd-summary-learning-completions.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/mtd-summary-learning-completions');

Route.group(() => {
  Route.get('index', 'Dashboard/Report/YearToMonthSummaryLearningCompletionController.report').as('dashboard.report.ytm-summary-learning-completions.index');
}).middleware(['auth','role:admin']).prefix('dashboard/report/ytm-summary-learning-completions');

Route.group(() => {
  Route.get('index', 'Dashboard/Glossarium/GlossariumController.index').as('dashboard.glossarium.index');
}).middleware(['auth','role:admin']).prefix('dashboard/glossarium');

Route.group(() => {
  Route.get('index', 'Dashboard/Point/UserPointController.index').as('dashboard.point.user-point.index');
  Route.get('datatable', 'Dashboard/Point/UserPointController.datatable').as('dashboard.point.user-point.datatable');
  Route.get('detail/:user_id', 'Dashboard/Point/UserPointController.detail').as('dashboard.point.user-point.detail');
  Route.get('datatable-detail/:user_id', 'Dashboard/Point/UserPointController.datatableDetail').as('dashboard.point.user-point.datatable-detail');
}).middleware(['auth','role:admin']).prefix('dashboard/point/user-point');
Route.group(() => {
  Route.get('index-by-directorate', 'Dashboard/Completion/CompletionByDirectorateController.index').as('dashboard.completion.index-by-directorate');
  Route.get('get-completion-by-directorate', 'Dashboard/Completion/CompletionByDirectorateController.getDataChart').as('dashboard.completion.get-completion-by-directorate');
  Route.get('index-by-learning-program', 'Dashboard/Completion/CompletionByLearningProgramController.index').as('dashboard.completion.index-by-learning-program');
  Route.get('get-completion-by-learning-program', 'Dashboard/Completion/CompletionByLearningProgramController.getDataChart').as('dashboard.completion.get-completion-by-learning-program');
  Route.get('index-by-content-library', 'Dashboard/Completion/CompletionByContentLibraryController.index').as('dashboard.completion.index-by-content-library');
  Route.get('get-completion-by-content-library', 'Dashboard/Completion/CompletionByContentLibraryController.getDataChart').as('dashboard.completion.get-completion-by-content-library');
  Route.post('completing-module', 'Dashboard/Completion/CompletionController.completingModule').as('dashboard.completion.completing-module');
  Route.get('completing-module-form', 'Dashboard/Completion/CompletionController.completingModuleForm').as('dashboard.completion.completing-module-form');
}).middleware(['auth']).prefix('dashboard/completion');

Route.group(() => {

    Route.get('index', 'Dashboard/User/Account/AccountController.index').as('dashboard.user.account.index');
    Route.get('datatable', 'Dashboard/User/Account/AccountController.datatable').as('dashboard.user.account.datatable');
    Route.get('create', 'Dashboard/User/Account/AccountController.create').as('dashboard.user.account.create');
    Route.post('store', 'Dashboard/User/Account/AccountController.store').as('dashboard.user.account.store');
    Route.get('edit/:id', 'Dashboard/User/Account/AccountController.edit').as('dashboard.user.account.edit');
    Route.get('detail/:id', 'Dashboard/User/Account/AccountController.detail').as('dashboard.user.account.detail');
    Route.post('update/:id', 'Dashboard/User/Account/AccountController.update').as('dashboard.user.account.update');
    Route.get('delete/:id', 'Dashboard/User/Account/AccountController.delete').as('dashboard.user.account.delete');
    Route.get('switch-suspend/:id', 'Dashboard/User/Account/AccountController.switchSuspend').as('dashboard.user.account.switch-suspend');
    Route.get('soft-delete/:id', 'Dashboard/User/Account/AccountController.softDelete').as('dashboard.user.account.soft-delete');
    Route.get('index-active-learners', 'Dashboard/User/Account/AccountController.indexActiveLearners').as('dashboard.user.index-active-learners');
    Route.get('get-data-active-learners', 'Dashboard/User/Account/AccountController.getDatatableActiveLearners').as('dashboard.user.get-data-active-learners');
    Route.get('import-user', 'Dashboard/User/Account/AccountController.importUserForm').as('dashboard.user.import-user');
    Route.post('import-user', 'Dashboard/User/Account/AccountController.importUser').as('dashboard.user.import-user');
    Route.get('import-user-form-preview', 'Dashboard/User/Account/AccountController.importLearnersFormWithPreview').as('dashboard.user.import-learners-form-preview');
    Route.post('import-user-preview', 'Dashboard/User/Account/AccountController.importLearnersPreview').as('dashboard.user.import-learners-preview');
    Route.post('import-user-submit-after-preview', 'Dashboard/User/Account/AccountController.submitImportLearnersAfterPreview').as('dashboard.user.import-learners-submit-after-preview');

    Route.get('import-sync-active-user', 'Dashboard/User/Account/AccountController.importSyncActiveUserUserForm').as('dashboard.user.import-sync-active-user');
    Route.post('import-sync-active-user', 'Dashboard/User/Account/AccountController.importSyncActiveUser').as('dashboard.user.import-sync-active-user');

}).middleware(['auth','role:admin']).prefix('dashboard/user/account');

Route.group(() => {
  Route.get('index-accordion', 'Dashboard/User/Cohort/CohortController.indexAccordion').as('dashboard.user.cohort.index-accordion');
  Route.get('index', 'Dashboard/User/Cohort/CohortController.index').as('dashboard.user.cohort.index');
  Route.get('datatable', 'Dashboard/User/Cohort/CohortController.datatable').as('dashboard.user.cohort.datatable');
  Route.get('create', 'Dashboard/User/Cohort/CohortController.create').as('dashboard.user.cohort.create');
  Route.post('store', 'Dashboard/User/Cohort/CohortController.store').as('dashboard.user.cohort.store');
  Route.get('edit/:id', 'Dashboard/User/Cohort/CohortController.edit').as('dashboard.user.cohort.edit');
  Route.post('update/:id', 'Dashboard/User/Cohort/CohortController.update').as('dashboard.user.cohort.update');
  Route.get('delete/:id', 'Dashboard/User/Cohort/CohortController.delete').as('dashboard.user.cohort.delete');
  Route.get('switch-visible/:id', 'Dashboard/User/Cohort/CohortController.switchVisible').as('dashboard.user.cohort.switch-visible');
  Route.get('soft-delete/:id', 'Dashboard/User/Cohort/CohortController.softDelete').as('dashboard.user.cohort.soft-delete');
  Route.get('assign-user/:id', 'Dashboard/User/Cohort/CohortController.getAssignUser').as('dashboard.user.cohort.assign-user');
  Route.post('assign-user/:id', 'Dashboard/User/Cohort/CohortController.postAssignUser').as('dashboard.user.cohort.assign-use');
  Route.post('assign-user-json/:id', 'Dashboard/User/Cohort/CohortController.postAssignUserJson').as('dashboard.user.cohort.assign-user-json');
  Route.get('import-cohort-member', 'Dashboard/User/Cohort/CohortController.importCohortMemberForm').as('dashboard.user.cohort.import-cohort-member');
  Route.post('import-cohort-member', 'Dashboard/User/Cohort/CohortController.importCohortMember').as('dashboard.user.cohort.import-cohort-member');

}).middleware(['auth','role:admin']).prefix('dashboard/user/cohort');

Route.group(() => {

 Route.get('index', 'Dashboard/User/ProfileFieldController.index').as('dashboard.user.learner-profile-field.index');

  Route.get('create-category', 'Dashboard/User/ProfileFieldController.createCategory').as('dashboard.user.learner-profile-field.create-category');
  Route.post('store-category', 'Dashboard/User/ProfileFieldController.storeCategory').as('dashboard.user.learner-profile-field.store-category');
  Route.get('edit-category/:id', 'Dashboard/User/ProfileFieldController.editCategory').as('dashboard.user.learner-profile-field.edit-category');
  Route.post('update-category/:id', 'Dashboard/User/ProfileFieldController.updateCategory').as('dashboard.user.learner-profile-field.update-category');
  Route.get('create-field', 'Dashboard/User/ProfileFieldController.createField').as('dashboard.user.learner-profile-field.create-field');
  Route.post('store-field', 'Dashboard/User/ProfileFieldController.storeField').as('dashboard.user.learner-profile-field.store-field');
  Route.get('edit-field/:id', 'Dashboard/User/ProfileFieldController.editField').as('dashboard.user.learner-profile-field.edit-field');
  Route.post('update-field/:id', 'Dashboard/User/ProfileFieldController.updateField').as('dashboard.user.learner-profile-field.update-field');
  Route.get('delete/:id', 'Dashboard/User/ProfileFieldController.delete').as('dashboard.user.learner-profile-field.delete');
  Route.get('soft-delete/:id', 'Dashboard/User/ProfileFieldController.softDelete').as('dashboard.user.learner-profile-field.soft-delete');
  Route.get('move-up/:id', 'Dashboard/User/ProfileFieldController.moveUp').as('dashboard.user.learner-profile-field.moveup');
  Route.get('move-down/:id', 'Dashboard/User/ProfileFieldController.moveDown').as('dashboard.user.learner-profile-field.movedown');

}).middleware(['auth','role:admin']).prefix('dashboard/user/learner-profile-field')

Route.group(() => {
  Route.get('index', 'Dashboard/Course/CourseCategoryController.index').as('dashboard.course-category.index');
  Route.get('datatable', 'Dashboard/Course/CourseCategoryController.datatable').as('dashboard.course-category.datatable');
  Route.get('create', 'Dashboard/Course/CourseCategoryController.create').as('dashboard.course-category.create');

  Route.post('store', 'Dashboard/Course/CourseCategoryController.store').as('dashboard.course-category.store');
  Route.post('change-parent', 'Dashboard/Course/CourseCategoryController.changeParent').as('dashboard.course-category.change-parent');
  Route.get('change-parent-one-data', 'Dashboard/Course/CourseCategoryController.changeParentOneData').as('dashboard.course-category.change-parent-one-data');

  Route.get('edit/:id', 'Dashboard/Course/CourseCategoryController.edit').as('dashboard.course-category.edit');
  Route.post('update/:id', 'Dashboard/Course/CourseCategoryController.update').as('dashboard.course-category.update');
  Route.get('delete/:id', 'Dashboard/Course/CourseCategoryController.delete').as('dashboard.course-category.delete');
  Route.get('switch-visible/:id', 'Dashboard/Course/CourseCategoryController.switchVisible').as('dashboard.course-category.switch-visible');
  Route.get('soft-delete/:id', 'Dashboard/Course/CourseCategoryController.softDelete').as('dashboard.course-category.soft-delete');
  Route.get('move-up/:id', 'Dashboard/Course/CourseCategoryController.moveUp').as('dashboard.course-category.moveup');
  Route.get('move-down/:id', 'Dashboard/Course/CourseCategoryController.moveDown').as('dashboard.course-category.movedown');
  Route.get('index-collapse-expand', 'Dashboard/Course/CourseCategoryController.indexCollapseExpand').as('dashboard.course-category.index-collapse-expand');


}).middleware(['auth','role:admin']).prefix('dashboard/course-categories');

Route.group(() => {
  Route.get('index', 'Dashboard/Course/ModuleCategoryController.index').as('dashboard.module-category.index');
  Route.get('datatable', 'Dashboard/Course/ModuleCategoryController.datatable').as('dashboard.module-category.datatable');
  Route.get('create', 'Dashboard/Course/ModuleCategoryController.create').as('dashboard.module-category.create');
  Route.post('store', 'Dashboard/Course/ModuleCategoryController.store').as('dashboard.module-category.store');
  Route.get('edit/:id', 'Dashboard/Course/ModuleCategoryController.edit').as('dashboard.module-category.edit');
  Route.get('switch-visible/:id', 'Dashboard/Course/ModuleCategoryController.switchVisible').as('dashboard.module-category.switch-visible');
  Route.post('update/:id', 'Dashboard/Course/ModuleCategoryController.update').as('dashboard.module-category.update');
  Route.get('delete/:id', 'Dashboard/Course/ModuleCategoryController.delete').as('dashboard.module-category.delete');
  Route.get('soft-delete/:id', 'Dashboard/Course/ModuleCategoryController.softDelete').as('dashboard.module-category.soft-delete');

}).middleware(['auth','role:admin']).prefix('dashboard/module-categories');
Route.group(() => {
  Route.get('set-user-login-form', 'Setting/SettingUserLoginController.setUserLoginForm').as('setting.set-user-login-form');
  Route.post('set-user-login', 'Setting/SettingUserLoginController.setUserLogin').as('setting.set-user-login');
  Route.get('set-clear-user-access-form', 'Setting/SettingUserAccessController.setClearUserAccessForm').as('setting.set-clear-user-access-form');
  Route.post('set-clear-user-access', 'Setting/SettingUserAccessController.setClearUserAccess').as('setting.clear-user-access');
  Route.post('set-theme', 'Setting/ThemeController.set').as('setting.set-theme');
  Route.get('set-theme', 'Setting/ThemeController.setForm').as('setting.set-theme-form');
  Route.get('get-data-theme', 'Setting/ThemeController.getDataThemes').as('setting.get-data-theme');
}).middleware(['auth','role:admin']).prefix('setting');
Route.group(() => {

  Route.get('index', 'Setting/AppVersionController.index').as('setting.app-version.index');
  Route.get('datatable', 'Setting/AppVersionController.datatable').as('setting.app-version.datatable');
  Route.get('create', 'Setting/AppVersionController.create').as('setting.app-version.create');
  Route.post('store', 'Setting/AppVersionController.store').as('setting.app-version.store');
  Route.get('edit/:id', 'Setting/AppVersionController.edit').as('setting.app-version.edit');
  Route.post('update/:id', 'Setting/AppVersionController.update').as('setting.app-version.update');
  Route.get('delete/:id', 'Setting/AppVersionController.delete').as('setting.app-version.delete');
  Route.get('soft-delete/:id', 'Setting/AppVersionController.softDelete').as('setting.app-version.soft-delete');

}).middleware(['auth','role:admin']).prefix('setting/app-version')

Route.group(() => {
  Route.get('index', 'Dashboard/ContentLibrary/ContentLibraryController.index').as('dashboard.content-library.index');
  Route.get('datatable', 'Dashboard/ContentLibrary/ContentLibraryController.datatable').as('dashboard.content-library.datatable');
  Route.get('create', 'Dashboard/ContentLibrary/ContentLibraryController.create').as('dashboard.content-library.create');
  Route.post('store', 'Dashboard/ContentLibrary/ContentLibraryController.store').as('dashboard.content-library.store');
  Route.get('edit/:id', 'Dashboard/ContentLibrary/ContentLibraryController.edit').as('dashboard.content-library.edit');
  Route.get('switch-visible/:id', 'Dashboard/ContentLibrary/ContentLibraryController.switchVisible').as('dashboard.content-library.switch-visible');
  Route.post('update/:id', 'Dashboard/ContentLibrary/ContentLibraryController.update').as('dashboard.content-library.update');
  Route.get('delete/:id', 'Dashboard/ContentLibrary/ContentLibraryController.delete').as('dashboard.content-library.delete');
  Route.get('soft-delete/:id', 'Dashboard/ContentLibrary/ContentLibraryController.softDelete').as('dashboard.content-library.soft-delete');

}).middleware(['auth','role:admin']).prefix('dashboard/content-library');

Route.group(() => {
  Route.get('index', 'Dashboard/Reminder/ReminderController.index').as('dashboard.reminder.index')
  Route.get('datatable', 'Dashboard/Reminder/ReminderController.datatable').as('dashboard.reminder.datatable')
  Route.get('create', 'Dashboard/Reminder/ReminderController.create').as('dashboard.reminder.create')
  Route.post('store', 'Dashboard/Reminder/ReminderController.store').as('dashboard.reminder.store')
  Route.get('edit/:id', 'Dashboard/Reminder/ReminderController.edit').as('dashboard.reminder.edit')
  Route.get('switch-visible/:id', 'Dashboard/Reminder/ReminderController.switchVisible').as('dashboard.reminder.switch-visible');
  Route.post('update/:id', 'Dashboard/Reminder/ReminderController.update').as('dashboard.reminder.update')
  Route.get('delete/:id', 'Dashboard/Reminder/ReminderController.delete').as('dashboard.reminder.delete')
  Route.get('soft-delete/:id', 'Dashboard/Reminder/ReminderController.softDelete').as('dashboard.reminder.soft-delete')
  Route.get('index-monitoring-log', 'Dashboard/Reminder/ReminderController.indexMonitoringLog').as('dashboard.reminder.index-monitoring-log')
  Route.get('datatable-monitoring-log', 'Dashboard/Reminder/ReminderController.datatableMonitoringLog').as('dashboard.reminder.datatable-monitoring-log')
  Route.get('detail-monitoring-log', 'Dashboard/Reminder/ReminderController.detailMonitoringLog').as('dashboard.reminder.detail-monitoring-log')
  Route.get('datatable-detail-monitoring-log', 'Dashboard/Reminder/ReminderController.datatableDetailMonitoringLog').as('dashboard.reminder.datatable-detail-monitoring-log')
}).middleware(['auth', 'role:admin']).prefix('dashboard/reminder')

Route.group(() => {
  Route.get('index', 'Dashboard/Badge/BadgeController.index').as('dashboard.badge.index')
  Route.get('datatable', 'Dashboard/Badge/BadgeController.datatable').as('dashboard.badge.datatable')
  Route.get('create', 'Dashboard/Badge/BadgeController.create').as('dashboard.badge.create')
  Route.post('store', 'Dashboard/Badge/BadgeController.store').as('dashboard.badge.store')
  Route.get('edit/:id', 'Dashboard/Badge/BadgeController.edit').as('dashboard.badge.edit')
  Route.get('switch-visible/:id', 'Dashboard/Badge/BadgeController.switchVisible').as('dashboard.badge.switch-visible');
  Route.post('update/:id', 'Dashboard/Badge/BadgeController.update').as('dashboard.badge.update')
  Route.get('delete/:id', 'Dashboard/Badge/BadgeController.delete').as('dashboard.badge.delete')
  Route.get('soft-delete/:id', 'Dashboard/Badge/BadgeController.softDelete').as('dashboard.badge.soft-delete')

}).middleware(['auth', 'role:admin']).prefix('dashboard/badge')

Route.group(() => {

  Route.get('index/:id', 'Dashboard/Reminder/ReminderSettingController.index').as('dashboard.reminder.setting.index')
  Route.get('datatable/:id', 'Dashboard/Reminder/ReminderSettingController.datatable').as('dashboard.reminder.setting.datatable')
  Route.get('create/:reminder_id', 'Dashboard/Reminder/ReminderSettingController.create').as('dashboard.reminder.setting.create')
  Route.post('store', 'Dashboard/Reminder/ReminderSettingController.store').as('dashboard.reminder.setting.store')
  Route.get('edit/:id', 'Dashboard/Reminder/ReminderSettingController.edit').as('dashboard.reminder.setting.edit')
  Route.post('update/:id', 'Dashboard/Reminder/ReminderSettingController.update').as('dashboard.reminder.setting.update')
  Route.get('delete/:id', 'Dashboard/Reminder/ReminderSettingController.delete').as('dashboard.reminder.setting.delete')
  Route.get('switch-visible/:id', 'Dashboard/Reminder/ReminderSettingController.switchVisible').as('dashboard.reminder.setting.switch-visible');
  Route.get('soft-delete/:id', 'Dashboard/Reminder/ReminderSettingController.softDelete').as('dashboard.reminder.setting.soft-delete')
  Route.get('soft-delete-restrict/:id', 'Dashboard/Reminder/ReminderSettingController.softDeleteRestrict').as('dashboard.reminder.setting.soft-delete-restrict')
  Route.get('detail/:id', 'Dashboard/Reminder/ReminderSettingController.detail').as('dashboard.reminder.setting.detail')
  Route.get('import-form/:reminder_id', 'Dashboard/Reminder/ReminderSettingController.importForm').as('dashboard.reminder.setting.import-form')
  Route.post('import', 'Dashboard/Reminder/ReminderSettingController.import').as('dashboard.reminder.setting.import')
}).middleware(['auth','role:admin']).prefix('dashboard/reminder/setting')

Route.group(() => {
  Route.get('index', 'Dashboard/Reward/RewardController.index').as('dashboard.reward.index')
  Route.get('datatable', 'Dashboard/Reward/RewardController.datatable').as('dashboard.reward.datatable')
  Route.get('create', 'Dashboard/Reward/RewardController.create').as('dashboard.reward.create')
  Route.post('store', 'Dashboard/Reward/RewardController.store').as('dashboard.reward.store')
  Route.get('edit/:id', 'Dashboard/Reward/RewardController.edit').as('dashboard.reward.edit')
  Route.post('update/:id', 'Dashboard/Reward/RewardController.update').as('dashboard.reward.update')
  Route.get('delete/:id', 'Dashboard/Reward/RewardController.delete').as('dashboard.reward.delete')
  Route.get('switch-visible/:id', 'Dashboard/Reward/RewardController.switchVisible').as('dashboard.reward.switch-visible');
  Route.get('soft-delete/:id', 'Dashboard/Reward/RewardController.softDelete').as('dashboard.reward.soft-delete')
  Route.get('index-approval', 'Dashboard/Reward/RewardController.indexApproval').as('dashboard.reward.index-approval')
  Route.get('datatable-approval', 'Dashboard/Reward/RewardController.datatableApproval').as('dashboard.reward.datatable-approval')
  Route.get('submit-approval/:id', 'Dashboard/Reward/RewardController.submitApproval').as('dashboard.reward.submit-approval')
}).middleware(['auth','role:admin']).prefix('dashboard/reward')

Route.group(() => {

  Route.get('index', 'Dashboard/Journey/JourneyController.index').as('dashboard.journey.index')
  Route.get('datatable', 'Dashboard/Journey/JourneyController.datatable').as('dashboard.journey.datatable')
  Route.get('create', 'Dashboard/Journey/JourneyController.create').as('dashboard.journey.create')
  Route.post('store', 'Dashboard/Journey/JourneyController.store').as('dashboard.journey.store')
  Route.get('edit/:id', 'Dashboard/Journey/JourneyController.edit').as('dashboard.journey.edit')
  Route.post('update/:id', 'Dashboard/Journey/JourneyController.update').as('dashboard.journey.update')
  Route.get('delete/:id', 'Dashboard/Journey/JourneyController.delete').as('dashboard.journey.delete')
  Route.get('soft-delete/:id', 'Dashboard/Journey/JourneyController.softDelete').as('dashboard.journey.soft-delete')
  Route.get('soft-delete-restrict/:id', 'Dashboard/Journey/JourneyController.softDeleteRestrict').as('dashboard.journey.soft-delete-restrict')
  Route.get('move-up/:id', 'Dashboard/Journey/JourneyController.moveUp').as('dashboard.journey.moveup')
  Route.get('move-down/:id', 'Dashboard/Journey/JourneyController.moveDown').as('dashboard.journey.movedown')
  Route.get('change-setting-form/:id', 'Dashboard/Journey/JourneyController.changeSettingForm').as('dashboard.journey.change-setting-form')
  Route.post('change-setting/:id', 'Dashboard/Journey/JourneyController.changeSetting').as('dashboard.journey.change-setting')
  Route.get('switch-visible/:id', 'Dashboard/Journey/JourneyController.switchVisible').as('dashboard.journey.switch-visible');
  Route.get('restrict-setting-form/:id', 'Dashboard/Journey/JourneyController.restrictSettingsForm').as('dashboard.journey.restrict-settings-form')
  Route.post('restrict-setting/:id', 'Dashboard/Journey/JourneyController.restrictSettings').as('dashboard.journey.restrict-settings')
}).middleware(['auth','role:admin']).prefix('dashboard/journey')

Route.group(() => {

  Route.get('index/:journey_id', 'Dashboard/Journey/ReminderController.index').as('dashboard.journey.reminder.index');
  Route.get('datatable/:journey_id', 'Dashboard/Journey/ReminderController.datatable').as('dashboard.journey.reminder.datatable');
  Route.get('create/:journey_id', 'Dashboard/Journey/ReminderController.create').as('dashboard.journey.reminder.create');
  Route.post('store', 'Dashboard/Journey/ReminderController.store').as('dashboard.journey.reminder.store');
  Route.get('edit/:id', 'Dashboard/Journey/ReminderController.edit').as('dashboard.journey.reminder.edit');
  Route.post('update/:id', 'Dashboard/Journey/ReminderController.update').as('dashboard.journey.reminder.update');
  Route.get('switch-visible/:id', 'Dashboard/Journey/ReminderController.switchVisible').as('dashboard.journey.reminder.switch-visible');
  Route.get('delete/:id', 'Dashboard/Journey/ReminderController.delete').as('dashboard.journey.reminder.delete');
  Route.get('soft-delete/:id', 'Dashboard/Journey/ReminderController.softDelete').as('dashboard.journey.reminder.soft-delete');


}).middleware(['auth','role:admin']).prefix('dashboard/journey/reminder')


Route.group(() => {

  Route.get('index/:reminder_id', 'Dashboard/Journey/ReminderController.indexSetting').as('dashboard.journey.reminder.setting.index');
  Route.get('datatable/:reminder_id', 'Dashboard/Journey/ReminderController.datatableSetting').as('dashboard.journey.reminder.setting.datatable');
  Route.get('create/:reminder_id', 'Dashboard/Journey/ReminderController.createSetting').as('dashboard.journey.reminder.setting.create');
  Route.post('store', 'Dashboard/Journey/ReminderController.storeSetting').as('dashboard.journey.reminder.setting.store');
  Route.get('edit/:id', 'Dashboard/Journey/ReminderController.editSetting').as('dashboard.journey.reminder.setting.edit');
  Route.post('update/:id', 'Dashboard/Journey/ReminderController.updateSetting').as('dashboard.journey.reminder.setting.update');
  Route.get('switch-visible/:id', 'Dashboard/Journey/ReminderController.switchVisibleSetting').as('dashboard.journey.reminder.setting.switch-visible');
  Route.get('delete/:id', 'Dashboard/Journey/ReminderController.deleteSetting').as('dashboard.journey.reminder.setting.delete');
  Route.get('soft-delete/:id', 'Dashboard/Journey/ReminderController.softDeleteSetting').as('dashboard.journey.reminder.setting.soft-delete');
  Route.get('import-form/:reminder_id', 'Dashboard/Journey/ReminderController.importForm').as('dashboard.journey.reminder.setting.import-form');
  Route.post('import/:reminder_id', 'Dashboard/Journey/ReminderController.import').as('dashboard.journey.reminder.setting.import');
  Route.get('import-template', 'Dashboard/Journey/ReminderController.downloadTemplateUploadSetting').as('dashboard.journey.reminder.setting.import-template');

}).middleware(['auth','role:admin']).prefix('dashboard/journey/reminder/setting')




Route.group(() => {

  Route.get('index/:id', 'Dashboard/Journey/Course/CourseController.index').as('dashboard.journey.course.index')
  Route.get('datatable/:id', 'Dashboard/Journey/Course/CourseController.datatable').as('dashboard.journey.course.datatable')
  Route.get('create/:daa_journey_id', 'Dashboard/Journey/Course/CourseController.create').as('dashboard.journey.course.create')
  Route.post('store', 'Dashboard/Journey/Course/CourseController.store').as('dashboard.journey.course.store')
  Route.get('edit/:id', 'Dashboard/Journey/Course/CourseController.edit').as('dashboard.journey.course.edit')
  Route.post('update/:id', 'Dashboard/Journey/Course/CourseController.update').as('dashboard.journey.course.update')
  Route.get('delete/:id', 'Dashboard/Journey/Course/CourseController.delete').as('dashboard.journey.course.delete')
  Route.get('soft-delete/:id', 'Dashboard/Journey/Course/CourseController.softDelete').as('dashboard.journey.course.soft-delete')
  Route.get('soft-delete-restrict/:id', 'Dashboard/Journey/Course/CourseController.softDeleteRestrict').as('dashboard.journey.course.soft-delete-restrict')
  Route.get('detail/:id', 'Dashboard/Journey/Course/CourseController.detail').as('dashboard.journey.course.detail')
  Route.get('move-up/:id', 'Dashboard/Journey/Course/CourseController.moveUp').as('dashboard.journey.course.moveup')
  Route.get('move-down/:id', 'Dashboard/Journey/Course/CourseController.moveDown').as('dashboard.journey.course.movedown')
  Route.get('switch-visible/:id', 'Dashboard/Journey/Course/CourseController.switchVisible').as('dashboard.journey.course.switch-visible');
  Route.post('change-setting/:id', 'Dashboard/Journey/Course/CourseController.changeSetting').as('dashboard.journey.course.change-setting')
  Route.get('restrict-setting-form/:id', 'Dashboard/Journey/Course/CourseController.restrictSettingsForm').as('dashboard.journey.course.restrict-settings-form')
  Route.post('restrict-setting/:id', 'Dashboard/Journey/Course/CourseController.restrictSettings').as('dashboard.journey.course.restrict-settings')
}).middleware(['auth', 'role:admin']).prefix('dashboard/journey/course')

Route.group(() => {

  Route.get('index/:course_id', 'Dashboard/Journey/Course/ReminderController.index').as('dashboard.journey.course.reminder.index');
  Route.get('datatable/:course_id', 'Dashboard/Journey/Course/ReminderController.datatable').as('dashboard.journey.course.reminder.datatable');
  Route.get('create/:course_id', 'Dashboard/Journey/Course/ReminderController.create').as('dashboard.journey.course.reminder.create');
  Route.post('store', 'Dashboard/Journey/Course/ReminderController.store').as('dashboard.journey.course.reminder.store');
  Route.get('edit/:id', 'Dashboard/Journey/Course/ReminderController.edit').as('dashboard.journey.course.reminder.edit');
  Route.post('update/:id', 'Dashboard/Journey/Course/ReminderController.update').as('dashboard.journey.course.reminder.update');
  Route.get('switch-visible/:id', 'Dashboard/Journey/Course/ReminderController.switchVisible').as('dashboard.journey.course.reminder.switch-visible');
  Route.get('delete/:id', 'Dashboard/Journey/Course/ReminderController.delete').as('dashboard.journey.course.reminder.delete');
  Route.get('soft-delete/:id', 'Dashboard/Journey/Course/ReminderController.softDelete').as('dashboard.journey.course.reminder.soft-delete');


}).middleware(['auth','role:admin']).prefix('dashboard/journey/course/reminder')


Route.group(() => {

  Route.get('index/:reminder_id', 'Dashboard/Journey/Course/ReminderController.indexSetting').as('dashboard.journey.course.reminder.setting.index');
  Route.get('datatable/:reminder_id', 'Dashboard/Journey/Course/ReminderController.datatableSetting').as('dashboard.journey.course.reminder.setting.datatable');
  Route.get('create/:reminder_id', 'Dashboard/Journey/Course/ReminderController.createSetting').as('dashboard.journey.course.reminder.setting.create');
  Route.post('store', 'Dashboard/Journey/Course/ReminderController.storeSetting').as('dashboard.journey.course.reminder.setting.store');
  Route.get('edit/:id', 'Dashboard/Journey/Course/ReminderController.editSetting').as('dashboard.journey.course.reminder.setting.edit');
  Route.post('update/:id', 'Dashboard/Journey/Course/ReminderController.updateSetting').as('dashboard.journey.course.reminder.setting.update');
  Route.get('switch-visible/:id', 'Dashboard/Journey/Course/ReminderController.switchVisibleSetting').as('dashboard.journey.course.reminder.setting.switch-visible');
  Route.get('delete/:id', 'Dashboard/Journey/Course/ReminderController.deleteSetting').as('dashboard.journey.course.reminder.setting.delete');
  Route.get('soft-delete/:id', 'Dashboard/Journey/Course/ReminderController.softDeleteSetting').as('dashboard.journey.course.reminder.setting.soft-delete');
  Route.get('import-form/:reminder_id', 'Dashboard/Journey/Course/ReminderController.importForm').as('dashboard.journey.course.reminder.setting.import-form');
  Route.post('import/:reminder_id', 'Dashboard/Journey/Course/ReminderController.import').as('dashboard.journey.course.reminder.setting.import');
  Route.get('import-template', 'Dashboard/Journey/Course/ReminderController.downloadTemplateUploadSetting').as('dashboard.journey.course.reminder.setting.import-template');

}).middleware(['auth','role:admin']).prefix('dashboard/journey/course/reminder/setting')

Route.group(() => {

  Route.get('index/:id', 'Dashboard/Journey/Course/Module/ModuleController.index').as('dashboard.journey.course.module.index')
  Route.get('datatable/:id', 'Dashboard/Journey/Course/Module/ModuleController.datatable').as('dashboard.journey.course.module.datatable')
  Route.get('create/:id', 'Dashboard/Journey/Course/Module/ModuleController.create').as('dashboard.journey.course.module.create')
  Route.post('store', 'Dashboard/Journey/Course/Module/ModuleController.store').as('dashboard.journey.course.module.store')
  Route.get('edit/:course_module_id', 'Dashboard/Journey/Course/Module/ModuleController.edit').as('dashboard.journey.course.module.edit')
  Route.post('update/:id', 'Dashboard/Journey/Course/Module/ModuleController.update').as('dashboard.journey.course.module.update')
  Route.get('delete/:id', 'Dashboard/Journey/Course/Module/ModuleController.delete').as('dashboard.journey.course.module.delete')
  Route.get('soft-delete/:id', 'Dashboard/Journey/Course/Module/ModuleController.softDelete').as('dashboard.journey.course.module.soft-delete')
  Route.get('soft-delete-restrict/:id', 'Dashboard/Journey/Course/Module/ModuleController.softDeleteRestrict').as('dashboard.journey.course.module.soft-delete-restrict')
  Route.get('detail/:id', 'Dashboard/Journey/Course/Module/ModuleController.detail').as('dashboard.journey.course.module.detail')
  Route.get('switch-visible/:id', 'Dashboard/Journey/Course/Module/ModuleController.switchVisible').as('dashboard.journey.course.module.switch-visible');
  Route.get('restrict-setting-form/:id', 'Dashboard/Journey/Course/Module/ModuleController.restrictSettingsForm').as('dashboard.journey.course.module.restrict-settings-form')
  Route.post('restrict-setting/:id', 'Dashboard/Journey/Course/Module/ModuleController.restrictSettings').as('dashboard.journey.course.module.restrict-settings')
}).middleware(['auth','role:admin']).prefix('dashboard/journey/course/module')

Route.group(() => {

  Route.get('index/:course_module_id', 'Dashboard/Journey/Course/Module/ReminderController.index').as('dashboard.journey.course.module.reminder.index');
  Route.get('datatable/:course_module_id', 'Dashboard/Journey/Course/Module/ReminderController.datatable').as('dashboard.journey.course.module.reminder.datatable');
  Route.get('create/:course_module_id', 'Dashboard/Journey/Course/Module/ReminderController.create').as('dashboard.journey.course.module.reminder.create');
  Route.post('store', 'Dashboard/Journey/Course/Module/ReminderController.store').as('dashboard.journey.course.module.reminder.store');
  Route.get('edit/:id', 'Dashboard/Journey/Course/Module/ReminderController.edit').as('dashboard.journey.course.module.reminder.edit');
  Route.post('update/:id', 'Dashboard/Journey/Course/Module/ReminderController.update').as('dashboard.journey.course.module.reminder.update');
  Route.get('switch-visible/:id', 'Dashboard/Journey/Course/Module/ReminderController.switchVisible').as('dashboard.journey.course.module.reminder.switch-visible');
  Route.get('delete/:id', 'Dashboard/Journey/Course/Module/ReminderController.delete').as('dashboard.journey.course.module.reminder.delete');
  Route.get('soft-delete/:id', 'Dashboard/Journey/Course/Module/ReminderController.softDelete').as('dashboard.journey.course.module.reminder.soft-delete');


}).middleware(['auth','role:admin']).prefix('dashboard/journey/course/module/reminder')


Route.group(() => {

  Route.get('index/:reminder_id', 'Dashboard/Journey/Course/Module/ReminderController.indexSetting').as('dashboard.journey.course.module.reminder.setting.index');
  Route.get('datatable/:reminder_id', 'Dashboard/Journey/Course/Module/ReminderController.datatableSetting').as('dashboard.journey.course.module.reminder.setting.datatable');
  Route.get('create/:reminder_id', 'Dashboard/Journey/Course/Module/ReminderController.createSetting').as('dashboard.journey.course.module.reminder.setting.create');
  Route.post('store', 'Dashboard/Journey/Course/Module/ReminderController.storeSetting').as('dashboard.journey.course.module.reminder.setting.store');
  Route.get('edit/:id', 'Dashboard/Journey/Course/Module/ReminderController.editSetting').as('dashboard.journey.course.module.reminder.setting.edit');
  Route.post('update/:id', 'Dashboard/Journey/Course/Module/ReminderController.updateSetting').as('dashboard.journey.course.module.reminder.setting.update');
  Route.get('switch-visible/:id', 'Dashboard/Journey/Course/Module/ReminderController.switchVisibleSetting').as('dashboard.journey.course.module.reminder.setting.switch-visible');
  Route.get('delete/:id', 'Dashboard/Journey/Course/Module/ReminderController.deleteSetting').as('dashboard.journey.course.module.reminder.setting.delete');
  Route.get('soft-delete/:id', 'Dashboard/Journey/Course/Module/ReminderController.softDeleteSetting').as('dashboard.journey.course.module.reminder.setting.soft-delete');
  Route.get('import-form/:reminder_id', 'Dashboard/Journey/Course/Module/ReminderController.importForm').as('dashboard.journey.course.module.reminder.setting.import-form');
  Route.post('import/:reminder_id', 'Dashboard/Journey/Course/Module/ReminderController.import').as('dashboard.journey.course.module.reminder.setting.import');
  Route.get('import-template', 'Dashboard/Journey/Course/Module/ReminderController.downloadTemplateUploadSetting').as('dashboard.journey.course.module.reminder.setting.import-template');

}).middleware(['auth','role:admin']).prefix('dashboard/journey/course/module/reminder/setting')

Route.group(() => {

  Route.get('index/:id', 'Dashboard/Journey/CertificateController.index').as('dashboard.journey.certificate.index')
  Route.get('datatable/:id', 'Dashboard/Journey/CertificateController.datatable').as('dashboard.journey.certificate.datatable')
  Route.get('create/:daa_journey_id', 'Dashboard/Journey/CertificateController.create').as('dashboard.journey.certificate.create')
  Route.post('store', 'Dashboard/Journey/CertificateController.store').as('dashboard.journey.certificate.store')
  Route.get('edit/:id', 'Dashboard/Journey/CertificateController.edit').as('dashboard.journey.certificate.edit')
  Route.get('switch-visible/:id', 'Dashboard/Journey/CertificateController.switchVisible').as('dashboard.journey.certificate.switch-visible');
  Route.post('update/:id', 'Dashboard/Journey/CertificateController.update').as('dashboard.journey.certificate.update')
  Route.get('delete/:id', 'Dashboard/Journey/CertificateController.delete').as('dashboard.journey.certificate.delete')
  Route.get('soft-delete/:id', 'Dashboard/Journey/CertificateController.softDelete').as('dashboard.journey.certificate.soft-delete')
  Route.get('soft-delete-restrict/:id', 'Dashboard/Journey/CertificateController.softDeleteRestrict').as('dashboard.journey.certificate.soft-delete-restrict')
  Route.get('detail/:id', 'Dashboard/Journey/CertificateController.detail').as('dashboard.journey.certificate.detail')
}).middleware(['auth','role:admin']).prefix('dashboard/journey/certificate')

Route.group(() => {

  Route.get('index/:id', 'Dashboard/Badge/Setting/BadgeSettingController.index').as('dashboard.badge.setting.index')
  Route.get('datatable/:id', 'Dashboard/Badge/Setting/BadgeSettingController.datatable').as('dashboard.badge.setting.datatable')
  Route.get('create/:daa_badge_id', 'Dashboard/Badge/Setting/BadgeSettingController.create').as('dashboard.badge.setting.create')
  Route.post('store', 'Dashboard/Badge/Setting/BadgeSettingController.store').as('dashboard.badge.setting.store')
  Route.get('edit/:id', 'Dashboard/Badge/Setting/BadgeSettingController.edit').as('dashboard.badge.setting.edit')
  Route.get('switch-visible/:id', 'Dashboard/Badge/Setting/BadgeSettingController.switchVisible').as('dashboard.badge.setting.switch-visible');
  Route.post('update/:id', 'Dashboard/Badge/Setting/BadgeSettingController.update').as('dashboard.badge.setting.update')
  Route.get('delete/:id', 'Dashboard/Badge/Setting/BadgeSettingController.delete').as('dashboard.badge.setting.delete')
  Route.get('soft-delete/:id', 'Dashboard/Badge/Setting/BadgeSettingController.softDelete').as('dashboard.badge.setting.soft-delete')

  Route.get('detail/:id', 'Dashboard/Badge/Setting/BadgeSettingController.detail').as('dashboard.badge.setting.detail')
}).middleware(['auth','role:admin']).prefix('dashboard/badge/setting')

Route.group(() => {

  Route.get('index/:id', 'Dashboard/Journey/RewardJourneyController.index').as('dashboard.journey.reward.index')
  Route.get('datatable/:id', 'Dashboard/Journey/RewardJourneyController.datatable').as('dashboard.journey.reward.datatable')
  Route.get('create/:daa_journey_id', 'Dashboard/Journey/RewardJourneyController.create').as('dashboard.journey.reward.create')
  Route.post('store', 'Dashboard/Journey/RewardJourneyController.store').as('dashboard.journey.reward.store')
  Route.get('edit/:id', 'Dashboard/Journey/RewardJourneyController.edit').as('dashboard.journey.reward.edit')
  Route.post('update/:id', 'Dashboard/Journey/RewardJourneyController.update').as('dashboard.journey.reward.update')
  Route.get('delete/:id', 'Dashboard/Journey/RewardJourneyController.delete').as('dashboard.journey.reward.delete')
  Route.get('soft-delete/:id', 'Dashboard/Journey/RewardJourneyController.softDelete').as('dashboard.journey.reward.soft-delete')
  Route.get('soft-delete-restrict/:id', 'Dashboard/Journey/RewardJourneyController.softDeleteRestrict').as('dashboard.journey.reward.soft-delete-restrict')

}).middleware(['auth','role:admin']).prefix('dashboard/journey/reward')

Route.group(() => {
  Route.get('index-all', 'Dashboard/Journey/RewardHistoryController.indexAll').as('dashboard.journey.reward-history.index-all')
  Route.get('index/:id', 'Dashboard/Journey/RewardHistoryController.index').as('dashboard.journey.reward-history.index')
  Route.get('datatable/:id', 'Dashboard/Journey/RewardHistoryController.datatable').as('dashboard.journey.reward-history.datatable')
}).middleware(['auth','role:admin']).prefix('dashboard/journey/reward-history')


Route.group(() => {
  Route.get('index-all', 'Dashboard/Journey/RewardHistoryController.indexAll').as('dashboard.journey.reward-history.index-all');
  Route.get('index/:id', 'Dashboard/Journey/RewardHistoryController.index').as('dashboard.journey.reward-history.index');
  Route.get('datatable/:id', 'Dashboard/Journey/RewardHistoryController.datatable').as('dashboard.journey.reward-history.datatable');
}).middleware(['auth','role:admin']).prefix('dashboard/journey/reward-history');

Route.group(() => {
  Route.get('index/:id', 'Dashboard/Journey/EnrolController.index').as('dashboard.journey.enrol.index');
  Route.get('datatable/:id', 'Dashboard/Journey/EnrolController.datatable').as('dashboard.journey.enrol.datatable');
  Route.post('store', 'Dashboard/Journey/EnrolController.store').as('dashboard.journey.enrol.store')
  Route.get('soft-delete/:cohort_id/:journey_id', 'Dashboard/Journey/EnrolController.softDelete').as('dashboard.journey.enrol.soft-delete');
}).middleware(['auth','role:admin']).prefix('dashboard/journey/enrol');

Route.group(() => {
  Route.get('index-form', 'Dashboard/LearnerBuddy/LearnerBuddyController.indexForm').as('dashboard.learner-buddy.index-form');
  Route.get('export-csv', 'Dashboard/LearnerBuddy/LearnerBuddyController.exportCsv').as('dashboard.learner-buddy.export-csv');
  Route.get('export-excel', 'Dashboard/LearnerBuddy/LearnerBuddyController.exportExcel').as('dashboard.learner-buddy.export-excel');
  Route.get('export-pdf', 'Dashboard/LearnerBuddy/LearnerBuddyController.exportPdf').as('dashboard.learner-buddy.export-pdf');
  Route.post('index-post-submit', 'Dashboard/LearnerBuddy/LearnerBuddyController.indexPostSubmit').as('dashboard.learner-buddy.index-post-submit');
}).middleware(['auth','role:admin']).prefix('dashboard/learner-buddy');


Route.group(() => {
  Route.get('index', 'Dashboard/Role/RoleController.index').as('dashboard.role-management.index');
  Route.get('index-assign', 'Dashboard/Role/RoleController.indexAssign').as('dashboard.role-management.index-assign');
  Route.get('get-assigned-user/:id', 'Dashboard/Role/RoleController.getAssignUser').as('dashboard.role-management.get-assigned-user');
  Route.get('datatable', 'Dashboard/Role/RoleController.datatable').as('dashboard.role-management.datatable');
  Route.get('create', 'Dashboard/Role/RoleController.create').as('dashboard.role-management.create');
  Route.post('store', 'Dashboard/Role/RoleController.store').as('dashboard.role-management.store');
  Route.get('edit/:id', 'Dashboard/Role/RoleController.edit').as('dashboard.role-management.edit');
  Route.get('form-reset/:id', 'Dashboard/Role/RoleController.formReset').as('dashboard.role-management.form-reset');
  Route.post('update/:id', 'Dashboard/Role/RoleController.update').as('dashboard.role-management.update');
  Route.get('detail/:id', 'Dashboard/Role/RoleController.detail').as('dashboard.role-management.detail');
  Route.get('delete/:id', 'Dashboard/Role/RoleController.delete').as('dashboard.role-management.delete');
  Route.get('soft-delete/:id', 'Dashboard/Role/RoleController.softDelete').as('dashboard.role-management.soft-delete');
  Route.get('move-up/:id', 'Dashboard/Role/RoleController.moveUp').as('dashboard.role-management.moveup');
  Route.get('move-down/:id', 'Dashboard/Role/RoleController.moveDown').as('dashboard.role-management.movedown');
  Route.get('assign-user/:id', 'Dashboard/Role/RoleController.getAssignUser').as('dashboard.role-management.assign-user');
  Route.post('assign-user/:id', 'Dashboard/Role/RoleController.postAssignUser').as('dashboard.role-management.assign-user');
   Route.post('assign-user-json/:id', 'Dashboard/Role/RoleController.postAssignUserJson').as('dashboard.role-management.assign-user-json');
  Route.get('sign-user-to-siteadmin', 'Dashboard/Role/RoleController.assignUserToSiteAdminForm').as('dashboard.role-management.sign-user-to-siteadmin-form');
  Route.post('sign-user-to-siteadmin', 'Dashboard/Role/RoleController.assignUserToSiteAdmin').as('dashboard.role-management.sign-user-to-siteadmin');
  Route.post('sign-user-to-siteadmin-redirect', 'Dashboard/Role/RoleController.assignUserToSiteAdminRedirect').as('dashboard.role-management.sign-user-to-siteadmin-redirect');

}).middleware(['auth','role:admin']).prefix('dashboard/role-management');

Route.group(() => {
  Route.get('index', 'Dashboard/Course/CourseController.index').as('dashboard.course.index');
  Route.get('datatable', 'Dashboard/Course/CourseController.datatable').as('dashboard.course.datatable');
  Route.get('create', 'Dashboard/Course/CourseController.create').as('dashboard.course.create');
  Route.get('create-by-category/:category_id', 'Dashboard/Course/CourseController.createByCategory').as('dashboard.course.create-by-category');
  Route.post('store', 'Dashboard/Course/CourseController.store').as('dashboard.course.store');
  Route.get('edit/:id', 'Dashboard/Course/CourseController.edit').as('dashboard.course.edit');
  Route.post('update/:id', 'Dashboard/Course/CourseController.update').as('dashboard.course.update');
  Route.get('delete/:id', 'Dashboard/Course/CourseController.delete').as('dashboard.course.delete');
  Route.get('switch-visible/:id', 'Dashboard/Course/CourseController.switchVisible').as('dashboard.course.switch-visible');
  Route.get('soft-delete/:id', 'Dashboard/Course/CourseController.softDelete').as('dashboard.course.soft-delete');
  Route.get('detail/:id', 'Dashboard/Course/CourseController.detail').as('dashboard.course.detail');
  Route.get('soft-delete-redirect-index-by-category/:id', 'Dashboard/Course/CourseController.softDeleteRedirectToListCourse').as('dashboard.course.soft-delete-redirect-index-by-category');
  Route.get('move-up/:id', 'Dashboard/Course/CourseController.moveUp').as('dashboard.course.moveup');
  Route.get('move-down/:id', 'Dashboard/Course/CourseController.moveDown').as('dashboard.course.movedown');
  Route.get('index-export', 'Dashboard/Course/CourseController.indexExport').as('dashboard.course.index-export');
  Route.get('index-file-export', 'Dashboard/Course/CourseController.indexFileExport').as('dashboard.course.index-file-export');
  Route.get('datatable-export', 'Dashboard/Course/CourseController.datatableExport').as('dashboard.course.datatable-export');
  Route.get('index-file-export', 'Dashboard/Course/CourseController.indexFileExport').as('dashboard.course.index-file-export');
  Route.get('datatable-file-export', 'Dashboard/Course/CourseController.datatableFileExport').as('dashboard.course.datatable-file-export');
  Route.get('export', 'Dashboard/Course/CourseController.export').as('dashboard.course.export');
  Route.get('download-file-export', 'Dashboard/Course/CourseController.downloadFileExport').as('dashboard.course.download-file-export');
  Route.get('index-by-category/:category_id', 'Dashboard/Course/CourseController.indexbyCategory').as('dashboard.course.index-by-category');
  Route.post('change-category', 'Dashboard/Course/CourseController.changeCategory').as('dashboard.course.change-category');
}).middleware(['auth','role:admin']).prefix('dashboard/course');

Route.group(() => {
  Route.get('soft-delete-by-scorm-id/:scorm_id', 'Dashboard/Course/ScormController.softDeleteAttemptByScormId').as('dashboard.scorm.soft-delete-by-scorm-id');
  Route.get('index-attempt/:scorm_id', 'Dashboard/Course/ScormController.indexAttempt').as('dashboard.scorm.index-attempt');
}).middleware(['auth','role:admin']).prefix('dashboard/scorm');

Route.group(() => {

  Route.get('index-export', 'Dashboard/LearningHistory/LearningHistoryController.indexExport').as('dashboard.learning-history.index-export');
  Route.get('datatable-export', 'Dashboard/LearningHistory/LearningHistoryController.datatableExport').as('dashboard.learning-history.datatable-export');
  Route.get('index-file-export', 'Dashboard/LearningHistory/LearningHistoryController.indexFileExport').as('dashboard.learning-history.index-file-export');
  Route.get('datatable-file-export', 'Dashboard/LearningHistory/LearningHistoryController.datatableFileExport').as('dashboard.learning-history.datatable-file-export');
  Route.get('export', 'Dashboard/LearningHistory/LearningHistoryController.export').as('dashboard.learning-history.export');
  Route.get('download-file-export', 'Dashboard/LearningHistory/LearningHistoryController.downloadFileExport').as('dashboard.learning-history.download-file-export');


}).middleware(['auth', 'role:admin']).prefix('dashboard/learning-history');
Route.group(() => {

  Route.get('sent-notif-form', 'Dashboard/Notif/NotifController.sendForm').as('dashboard.notif.send-notif');
  Route.post('submit-sent-notif', 'Dashboard/Notif/NotifController.submitSendForm').as('dashboard.notif.submit-send-notif');



}).middleware(['auth','role:admin']).prefix('dashboard/notif');






Route.on('/appfix').render('layouts.appfix');
Route.on('/blank').render('layouts.blank_page');
