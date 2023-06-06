'use strict'
const User = use('App/Models/User')
const Cohort = use('App/Models/Cohort')
const CohortMember = use('App/Models/CohortMember')
const DaaNotification = use('App/Models/DaaNotification')
const UserInfoDatum = use('App/Models/UserInfoDatum')
const DaaUserToken =  use('App/Models/DaaUserToken')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const Drive                             = use('Drive');
const ExportService                     = use('App/Services/ExportService')
const { PDFDocument, StandardFonts }    = require("pdf-lib");
const fs = require("fs");
var FCM = require('fcm-node');
const Env = use('Env')
const Database                          = use('Database')



class NotifController {
  async submitSendForm({ view, auth, response, request, session, params }) {


    let type = request.input('type');
    let cohortId = request.input('cohortid');
    let directorateId = request.input('directorateid')
    let title = request.input('title');
    let description = request.input('description');




    let cohortMembers = await CohortMember.query()
                        .with('user', builder => {
                          builder.with('info', builderChild => {
                            if (directorateId != 0 && directorateId != '0' && directorateId != '') {
                              builderChild.where('data', directorateId)  
                            }
                            
                          })
                          .select('id','username','firstname','lastname','email')
                          .where('deleted',0)
                          .where('suspended',0); //  select columns / pass array of columns
                        }).where('cohortid',cohortId).whereNull('deleted_at').fetch();
    for (let index in cohortMembers.rows) {
      cohortMembers.rows[index].notif = await new DaaNotification();

      cohortMembers.rows[index].notif.user_id = cohortMembers.rows[index].userid;
      cohortMembers.rows[index].notif.type = type;
      cohortMembers.rows[index].notif.subject = title;
      cohortMembers.rows[index].notif.message = description;
      cohortMembers.rows[index].notif.status = 0; //belum dibaca
      cohortMembers.rows[index].notif.params = JSON.stringify({status:2});
      await cohortMembers.rows[index].notif.save();

      //fungsi send notif
    }
    let dataTokens = await DaaUserToken.query()
      .whereIn('user_id', cohortMembers.rows.map(res => res.userid))
      //.whereNull('deleted_at')
      .fetch();
    let arrTokens = dataTokens.rows.map(res => res.token)
    let data = {};
    let notification = {
      title: title,
      body: description
    };
    let sendNotif = this.sendNotif(arrTokens, notification, data);

    session.flash({ notification: 'Successfully send Notification!' });
    return response.route('dashboard.notif.send-notif')
  }
  async sendForm({ view, auth, response, request, session, params }) {
     await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
     await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")

    const authUser = auth.user.toJSON()

    let cohorts = await Cohort.query().whereNull('deleted_at').fetch();
    let directorates = await UserInfoDatum.query()
        .where('fieldid', 11)
        .where('data', '!=', '')
        .groupBy('data')
        .orderBy('data')
        .whereNull('deleted_at').fetch();

    return view.render('dashboard.notification.form_send',{authUser : authUser, cohorts : cohorts, directorates  : directorates });
  }

  async sendNotif(arrTokens , notification, data) {

    var serverKey = Env.get('FCM_SERVER_KEY'); // put your server key here
    var fcm = new FCM(serverKey);

     var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        //to: 'registration_token',
        //registration_ids: ['registration_tokens'],
        registration_ids: arrTokens,
        collapse_key: 'your_collapse_key',

        notification: notification,
        data : data



        // notification: {
        //     title: 'Title of your push notification',
        //     body: 'Body of your push notification'
        // },

        // data: {  //you can send only notification or only data(or include both)
        //     my_key: 'my value',
        //     my_another_key: 'my another value'
        // }
    };

    await fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });

  }
}

module.exports = NotifController
