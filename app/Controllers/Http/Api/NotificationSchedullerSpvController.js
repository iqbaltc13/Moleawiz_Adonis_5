'use strict'

const Database = use('Database')
const Env = use('Env')
const DaaReminderLog = use('App/Models/DaaReminderLog')
const Mail = use('Mail')
var FCM = require('fcm-node');

class NotificationSchedullerSpvController {
    send_notif_spv = async () => {
        const date = new Date()
        await Database.connection('db_writer')
                    .table('daa_cronjob_log')
                    .insert({
                        cron_name: 'App\Http\Controllers\NotificationSchedullerSpvController@sendNotifSpv',
                        start_date: date
                    })
        let data_notif = []
        let detail = []
        let index = 0
        let dt_index = 0
        let index_spv = 0
        let id_spv = []
        let array_spv = []
        //SEND NOTIF SPV
        const data_spv = await Database.connection('db_reader')
                                    .select("spv_id")
                                    .from("daa_reminder_log")
                                    .where("send_notif_spv", 0)
                                    .whereNot("spv_id", 0)
                                    .where("created_at", date)
                                    .limit(800)
        const tot_data_spv = data_spv.lenght
        let flag = 0
        let tot_notif = 1
        let journey_id = 0
        let course_id = 0
        let module_id = 0
        let expired_date = ""
        if(tot_data_spv > 0){
            for(i = 1; i<4; i++){
                for(let index in data_spv){
                    id_spv.push(data_spv[index].spv_id)
                    const get_user_data = await Database.connection('db_reader')
                                                    .select("user_id")
                                                    .from("daa_reminder_log")
                                                    .whereNot("spv_id", 0)
                                                    .where("created_at", date)
                                                    .where("spv_id", data_spv[index].spv_id)
                    let index = 0
                    let index_spv = 0
                    let tot_user = get_user_data.lenght
                    if(tot_user > 0){
                        let dt_index = 0
                        let notif_type = 0
                        for(let index in get_user_data){
                            const user_detail = await Database.connection('db_reader')
                                                            .select("dr.journey_id", "dr.course_id", "dr.module_id", "drs.notif_type", "drl.is_expired", "drl.expired_date")
                                                            .from("daa_reminder_log as drl")
                                                            .join("daa_reminder_setting as drs", "drs.id", "drl.reminder_setting_id")
                                                            .join("daa_reminder as dr", "dr.id", "drs.reminder_id")
                                                            .where("user_id", get_user_data[index].user_id)
                                                            .whereNot("spv_id", 0)
                                                            .where("drs.notif_type", tot_notif)
                                                            .where("created_at", date)
                            const tot_detail = user_detail.lenght
                            if(tot_detail > 0){
                                for(let index in user_detail){
                                    if(user_detail[index].is_expired == 1){
                                        flag = 1
                                    }
                                    if(user_detail[index].journey_id){
                                        journey_id = user_detail[index].journey_id
                                    }
                                    if(user_detail[index].course_id){
                                        course_id = 1
                                    }
                                    if(user_detail[index].module_id){
                                        module_id = user_detail[index].module_id
                                    }
                                    if(user_detail[index].expired_date){
                                        const month = [
                                            "Jan", 
                                            "Feb", 
                                            "Mar", 
                                            "Apr", 
                                            "May", 
                                            "Jun", 
                                            "Jul", 
                                            "Aug", 
                                            "Sep", 
                                            "Oct", 
                                            "Nov", 
                                            "Dev"
                                        ]
                                        expired_date = user_detail[index].expired_date.getDate()+" "+month[user_detail[index].expired_date.getMonth()]+" "+user_detail[index].expired_date.getFullYear()
                                    }
                                    //Check Progress Completion User
                                    let get_module
                                    if(course_id != 0 && module_id == 0){
                                        get_module = await Database.connection('db_reader')
                                                                .select("c.id")
                                                                .from("daa_journeys as dj")
                                                                .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                                                .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                                                .join("course as c", "dcm.module_id", "c.id")
                                                                .where("dj.id", journey_id)
                                                                .where("dc.id", course_id)
                                                                .where("dj.visible", 1)
                                                                .where("c.visible", 1)
                                                                .where("dc.visible", 1)
                                                                .where("c.module_type", 1)
                                    }else if(course_id != 0 && module_id != 0 ){
                                        get_module = await Database.connection('db_reader')
                                                                .select("c.id")
                                                                .from("daa_journeys as dj")
                                                                .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                                                .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                                                .join("course as c", "dcm.module_id", "c.id")
                                                                .where("dj.id", journey_id)
                                                                .where("dc.id", course_id)
                                                                .where("c.id", module_id)
                                                                .where("dj.visible", 1)
                                                                .where("c.visible", 1)
                                                                .where("dc.visible", 1)
                                                                .where("c.module_type", 1)
                                    }
                                    let tot_module = get_module.length
                                    let module_id_array = []
                                    let progress = 0
                                    if(get_module != 0){
                                        for(let index in get_module){
                                            module_id_array.push(get_module[index].id)
                                        }
                                    }
                                    const module_complete = await Database.connection('db_reader')
                                                                        .select("module_id")
                                                                        .from("daa_module_logs")
                                                                        .where("user_id", id_user)
                                                                        .whereIn("module_id", module_id_array)
                                                                        .where("is_completed", 1)
                                    const total_module_completed = module_complete.length
                                    if(total_module_completed == 0 || tot_module == 0){
                                        progress = 0
                                    }else{
                                        progress = Math.round((total_module_completed/tot_module)*100)
                                    }
                                    let journey_name = ""
                                    let course_name = ""
                                    let module_name = ""
                                    if(journey_id != 0){
                                        const get_journey = await Database.connection('db_reader')
                                                                        .select("*")
                                                                        .from("daa_journeys")
                                                                        .where("id", journey_id)
                                                                        .limit(1)
                                        if(get_journey != 0){
                                            for(let index in get_journey){
                                                journey_name = get_journey[index].name
                                            }
                                        }
                                    }
                                    if(course_id != 0){
                                        const get_course = await Database.connection('db_reader')
                                                                    .select("*")
                                                                    .from("daa_courses")
                                                                    .where("id", course_id)
                                                                    .limit(1)
                                        if(get_course){
                                            for(let index in get_course){
                                                course_name = get_course[index].name
                                            }
                                        }
                                    }
                                    if(module_id != 0){
                                        const get_module_name = await Database.connection('db_reader')
                                                                            .select("fullname")
                                                                            .from("course")
                                                                            .where("id", module_id)
                                        if(get_module_name != 0){
                                            for(let index in get_module_name){
                                                module_name = get_module_name[index].fullname
                                            }
                                        }
                                    }
                                    if(progress < 100){
                                        var element = {}
                                        element.journey_name = journey_name
                                        element.course_name = course_name
                                        element.module_name = module_name
                                        element.progress = progress
                                        element.expired_date = expired_date

                                        detail.push(element)
                                        notif_type = user_detail[index].notif_type
                                    }else{
                                        detail = []
                                    }
                                }
                            }
                            //User Detail
                            const user_data = await Database.connection('db_reader')
                                                        .select("*")
                                                        .from("user")
                                                        .where("id", get_user_data[index].user_id)
                                                        .where("deleted", 0)
                            let username = ""
                            let fullname = ""
                            if(user_data != 0){
                                for(let index in user_data){
                                    username = user_data[index].username
                                    fullname = user_data[index].firstname+" "+user_data[index].lastname

                                    const detail_data = detail.slice(0, tot_detail)
                                    if(detail_data.length > 0){
                                        var element = {}
                                        element.username = username
                                        element.name = fullname
                                        element.detail = detail

                                        data_notif.push(element)
                                    }
                                    const notif_data_slice = data_notif.slice(0, tot_user)
                                    if(notif_data_slice > 0){
                                        var element = {}
                                        element.spv_id = data_spv[index].spv_id
                                        element.user = data_notif

                                        array_spv.push(element)
                                    }
                                    if(tot_detail > 0 && array_spv.length > 0){
                                        for(let index in array_spv){
                                            const user_spv = await Database.connection('db_reader')
                                                                        .select("*")
                                                                        .from("user")
                                                                        .where("id", array_spv[index].spv_id)
                                                                        .where("deleted", 0)
                                            //Messasge untuk expired atau belum
                                            let spv_type
                                            if(flag == 0){
                                                spv_type = 1
                                            }else if(flag == 1){
                                                spv_type = 2
                                            }

                                            //Check spv type (send push notif or not)
                                            let send = 0
                                            const spv_position = await Database.connection('db_reader')
                                                                            .select("uid.userid", "uid.data")
                                                                            .from("user_info_field as uif")
                                                                            .join("user_info_data as uid", "uif.id", "uid.fieldid")
                                                                            .where("uif.id", 7)
                                                                            .where("uid.userid", array_spv[index].spv_id)
                                            if(spv_position.lenght == 0){
                                                send = 1
                                            }
                                            //1:push notif, 2:email notif, 3:all
                                            if(notif_type == 1){
                                                if(send == 1){
                                                    this.send_push_notif_director(spv_type , array_spv[index].spv_id)
                                                }
                                            }
                                            else if(notif_type == 2){
                                                if(user_spv != 0){
                                                    for(let index in user_spv){
                                                        if(user_spv[index].email != "" && user_spv[index].email != null){
                                                            this.send_mail_spv(2, spv_type, data_notif, user_spv[index].email)
                                                        }
                                                    }
                                                }
                                            }
                                            else if(notif_type == 3){
                                                if(send == 1){
                                                    this.send_push_notif_director(spv_type , array_spv[index].spv_id)
                                                }
                                                if(user_spv != 0){
                                                    for(let index in user_spv){
                                                        if(user_spv[index].email != "" && user_spv[index].email != null){
                                                            this.send_mail_spv(2, spv_type, data_notif, user_spv[index].email)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if(tot_data_spv > 0){
            await Database.connection('db_writer')
                    .table('daa_reminder_log')
                    .whereIn("id", id_spv)
                    .update({
                        send_notif: 1
                    })
        }
        await Database.connection('db_writer')
                    .table('daa_cronjob_log')
                    .whereIn("id", id_spv)
                    .update({
                        end_date: date
                    })
    }
    send_mail_spv = async (type ,type_message, data, user_email) => {
        const date_now = new Date()
        const date = date_now.getFullYear()+'-'+(date_now.getMonth()+1)+'-'+date_now.getDate()
        let view
        let subject = "e-Smart Daily Reports"
        let from_address = 'keb-hana@digimasia.com'
        let team = "e-Smart Team"
        let messages
        // let type = 2
        // let type_message = 2
        // let user_email = ["wahyucandraindhiarta@gmail.com"]
        if(type == 1){
            view = "mail.CompletionNotificationLearner"
            subject = "e-Smart Daily Reports _ "+date
        }else if(type == 2){
            view = "mail.CompletionNotificationSpv"
            subject = "e-Smart Daily Reports _ "+date
        }else if(type == 3){
            view = "mail.CompletionNotificationNha"
            subject = "e-Smart Daily Reports _ "+date
        }
        if(type_message == 1){
            messages = "Terdapat anggota tim Bapak/Ibu yang belum menyelesaikan program pembelajaran.";
        }
        else if(type_message == 2){
            messages = "Terdapat anggota tim Bapak/Ibu yang belum menyelesaikan program pembelajaran.";
        }
        else{
            messages = "";
        }

        var element = {}
        element.messages = messages
        element.data = data
        element.team = team
        await Mail.send(view, element, (message) => {
            message
              .to(user_email)
              .from(from_address)
              .subject(subject)
          })
    }
    send_push_notif_director = async (type, user_id) => {
        let notif_type = "dateline_reminder_spv"
        let title = ""
        let message = ""
        if(type == 1){
            title = "Anggota tim Bapak/Ibu akan melewati batas waktu penyelesaian program!"
            message = "Perkembangan pembelajaran tim dapat dilihat dengan cara sentuh icon <More> – <Team Monitoring>."
        }
        else if(type = 2){
            title = "Anggota tim Bapak/Ibu telah melewati batas waktu penyelesaian program!"
            message = "Perkembangan pembelajaran tim dapat dilihat dengan cara sentuh icon <More> – <Team Monitoring>."
        }

        //Object for controller push notif
        let fcm_data = {
            user_id: user_id,
            from_id: 0,
            notif_type: notif_type,
            type: 0,
            title: title,
            message: message,
            body: message
        }

        //Aray data for mobile apps
        let notif_data = []
        var element = {}
        element.user_id = user_id
        element.type = 0
        element.title = title
        element.message = message
        element.body = message

        notif_data.push(element)

        this.send_notif(user_id, fcm_data, notif_data)
        await Database.connection('db_reader')
                .table("daa_push_notif_log")
                .insert({
                    user_id: user_id,
                    title: title,
                    message: message,
                    notif_type: notif_type,
                    created_at: new Date()
                })
    }
    send_notif = async (arrTokens, data, notification) => {
        let token = []
        for(let index in data){
            if(data[index].user_id != 0){
                if(data[index].notif_type == "app_update"){
                    let platform
                    if(data[index].from_id == "1"){
                        platform = "Android"
                    }
                    else if(data[index].from_id == "2"){
                        platform = "IOS"
                    }
                    const token_query = await Database.connection('db_reader')
                                        .select("firebase_token")
                                        .from("daa_user_tokens")
                                        .where("platform", platform)
                                        .where("user_id", data[index].user_id)
                    for(let index in token_query){
                        token.push(token_query[index].firebase_token)
                    }
                }else{
                    const token_query = await Database.connection('db_reader')
                                        .select("firebase_token")
                                        .from("daa_user_tokens")
                                        .where("user_id", data[index].user_id)
                    for(let index in token_query){
                        token.push(token_query[index].firebase_token)
                    }
                }
            }

            // send notification
            var serverKey = Env.get('FCM_SERVER_KEY'); // put your server key here
            var fcm = new FCM(serverKey);
            var message_fcm = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                //to: 'registration_token',
                //registration_ids: ['registration_tokens'],
                to: token,
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
            fcm.send(message_fcm, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!: ", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        }
    }
}

module.exports = NotificationSchedullerSpvController
