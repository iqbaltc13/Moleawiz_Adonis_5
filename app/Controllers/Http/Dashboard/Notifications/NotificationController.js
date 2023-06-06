'use strict'
const User = use('App/Models/User')
const Cohort = use('App/Models/Cohort')
const CohortMember = use('App/Models/CohortMember')
const DaaNotification = use('App/Models/DaaNotification')
const UserInfoDatum = use('App/Models/UserInfoDatum')

const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const Drive                             = use('Drive');
const ExportService                     = use('App/Services/ExportService')
const { PDFDocument, StandardFonts }    = require("pdf-lib");
const fs = require("fs");
const DaaUserToken = use('App/Services/DaaUserToken')
const Database                          = use('Database')

class NotificationController {

  async submitSendForm({ view, auth, response, request, session, params }) {
  }

  async sendForm({ view, auth, response, request, session, params }) {
       await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
    await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
      const authUser = auth.user.toJSON()
      console.log(authUser);
      let cohorts = await Cohort.query().whereNull('deleted_at').fetch();
      let directorates = await UserInfoDatum.query()
          .where('fieldid', 11)
          .where('data', '!=', '')
          .groupBy('data')
          .orderBy('data')
          .whereNull('deleted_at').fetch();

      return view.render('dashboard.notification.form_send',{authUser : authUser, cohorts : cohorts, directorates  : directorates });
  }
  async sendNotif({ view, auth, response, request, session, params }) {
    // "SELECT u.id, u.username, u.firstname, u.lastname, u.email
		// 					FROM cohort_members cm
		// 					INNER JOIN `user` u ON u.id = cm.userid
		// 					INNER JOIN user_info_data uid on uid.userid=u.id
		// 					WHERE u.deleted=0 AND u.suspended=0".$qCohortID.$qDirectorate." GROUP BY u.id";
    let cohortId = request.input('arr_username');
    let directorateId = request.input('arr_username')

    .with('user', builder => {
      builder.select('username'); //  select columns / pass array of columns
    })
    .with('module', builder => {
      builder.select('created_at'); //  select columns / pass array of columns
    })


    let cohortMembers = await CohortMember.query()
  }

}

module.exports = NotificationController
