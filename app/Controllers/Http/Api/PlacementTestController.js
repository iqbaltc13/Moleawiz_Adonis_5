'use strict'

const Database = use('Database')
const Env = use('Env')
const DaaJourneyCohortEnrol = use('App/Models/DaaJourneyCohortEnrol')
var FCM = require('fcm-node');
const DaaNotification = use('App/Models/DaaNotification')



class PlacementTestController {
    check_is_submit = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()

        //get module apakah placement test
        const check_is_module_placement_test = await Database.connection('db_reader')
                                                            .select("is_placement_test")
                                                            .from("course")
                                                            .where("id", params.id)
        let is_placement_test = 0
        let data = []
        for(let index in check_is_module_placement_test){
            is_placement_test = check_is_module_placement_test[index].is_placement_test
        }
        if(is_placement_test == 1){
            const check_data = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_placement_test_result")
                                            .where("user_id", authUser.id)
                                            .where("module_id", params.id)

            if(check_data != 0){
                const check_is_submit = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("daa_placement_test_result")
                                                    .where("is_submit", 1)                                            
                                                    .where("user_id", authUser.id)
                                                    .where("module_id", params.id)
                if(check_is_submit != 0 ){
                    var element = {}
                    element.status_submit = 1
                    data.push(element)           
                }else{
                    var element = {}
                    element.status_submit = 0
                    data.push(element)
                }
            }else{
                var element = {}
                element.status_submit = 1
                data.push(element)
            }
        }else{
            var element = {}
            element.status_submit = 1
            data.push(element)
        }
        return response.send({status: 200, message: "OK", data: element})

    }
    submit_result = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const module_id = params.id
        let max_grade = 0
        let message = ""
        const max = await Database.connection('db_reader')
                                .max("total_grade as highest")
                                .from("daa_placement_test_result")
                                .where("user_id", user_id)
                                .where("module_id", module_id)
        for(let index in max){
            max_grade = max[index].highest
        }
        const check_highest_grade = await Database.connection('db_reader')
                                                .select("*")
                                                .from("daa_placement_test_result")
                                                .where("user_id", user_id)
                                                .where("module_id", module_id)
                                                .where("total_grade", max_grade)
                                                .orderBy("attempt", "DESC")
                                                .limit(1)
        let highest_grade_id = 0
        let total_grade = 0
        let journey_id = 0
        for(let index in check_highest_grade){
            highest_grade_id = check_highest_grade[index].id
            total_grade = check_highest_grade[index].total_grade
            journey_id = check_highest_grade[index].journey_id
        }
        const result = await Database.connection('db_writer')
                                    .table("daa_placement_test_result")
                                    .where("id", highest_grade_id)
                                    .update({
                                        is_submit: 1
                                    })
        if(result){
            const get_journey = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_journeys")
                                            .where("id", journey_id)
            let journey_name = ""
            if(get_journey != 0){
                for(let index in get_journey){
                    journey_name = get_journey[index].name
                }
            }
            const result_message = "Selamat! Anda telah terdaftar di "+journey_name
            message = "Hasil Placement Test Anda telah tersimpan!"
            this.auto_enrolment(highest_grade_id, user_id)
        }else{
            message = "Failed to save your Placement test result"
        }

        return response.send({status: 200, message: message, data:[]})
    }
    auto_enrolment = async (placement_test_id, user_id) => {
        const get_journey_id = await Database.connection('db_reader')
                                        .select("journey_id")
                                        .from("daa_placement_test_result")
                                        .where("id", placement_test_id)
        let journey_id = 0
        for(let index in get_journey_id){
            journey_id = get_journey_id[index].journey_id
        }
        const get_journey_name = await Database.connection('db_reader')
                                            .select("name")
                                            .from("daa_journeys")
                                            .where("id", journey_id)
        let journey_name = ""
        for(let index in get_journey_name){
            journey_name = get_journey_name[index].name
        }

        let new_cohort_name = "PT_"+journey_name
        //cek cohort suda ada atau belum
        const check_cohort_is_exist = await Database.connection('db_reader')
                                                .select("id")
                                                .from("cohort")
                                                .where("name", new_cohort_name)
        if(check_cohort_is_exist != 0){
            let cohort_id = 0
            for(let index in check_cohort_is_exist){
                cohort_id = check_cohort_is_exist[index].id
            }
            //cek user sudah ada di cohort itu atau belum
            const check_user_in_cohort = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("cohort_members")
                                                    .where("cohortid", cohort_id)
                                                    .where("userid", user_id)
            if(check_user_in_cohort == 0){
                //add user to cohort
                const new_date = new Date().getTime()
                await Database.connection('db_writer')
                            .table("cohort")
                            .insert({
                                cohortid: cohort_id,
                                userid: user_id,
                                timeadded: new_date
                            })
            }
        }else{
            //buat cohort baru
            const new_date = new Date().getTime()
            await Database.connection('db_writer')
                        .table("cohort")
                        .insert({
                            contextid: 1,
                            name: new_cohort_name,
                            idnumber: new_cohort_name,
                            descriptionformat: 1,
                            visible: 1,
                            timecreated: new_date,
                            timemodified: new_date
                        })
            const get_new_cohort_id = await Database.connection('db_reader')
                                                .select("id")
                                                .from("cohort")
                                                .where("name", new_cohort_name)
            let new_cohort_id = 0
            for(let index in get_new_cohort_id){
                new_cohort_id = get_new_cohort_id[index].id
            }
            //add user to new cohort
            await Database.connection('db_writer')
                        .table("cohort_members")
                        .insert({
                            cohortid: new_cohort_id,
                            user_id: user_id
                        })
        }
        //check user sudah di enroll di journey tersebut
        const check_is_user_enroll = await Database.connection('db_reader')
                                                .select("*")
                                                .from("daa_journey_cohort_enrols as djce")
                                                .join("cohort as c", "djce.cohort_id", "c.id")
                                                .join("cohort_members as cm", "c.id", "cm.cohortid")
                                                .where("djce.journey_id", journey_id)
                                                .where("cm.userid", user_id)
        if(check_is_user_enroll == 0){
            //enrol cohort to journey
            const get_new_cohort_id = await Database.connection('db_reader')
                                                .select("id")
                                                .from("cohort")
                                                .where("name", new_cohort_name)
            let new_cohort_id = 0
            for(let index in get_new_cohort_id){
                new_cohort_id = get_new_cohort_id[index].id
            }
            const new_date = new Date()
            const data = new DaaJourneyCohortEnrol()
            data.journey_id = journey_id
            data.cohort_id = cohort_id
            data.created_at = new_date
            data.updated_at = new_date
            
            if(await data.save()){
                this.sendNotif(user_id, journey_id)
            }
        }else{
            this.sendNotif(user_id, journey_id)
        }
        return response.send({status: 200, message: "ok", data: []})
    }
    
    sendNotif = async (user_id, journey_id) => {
        const type = "enrol"
        const context_id = journey_id
        const subject = "Enrollment"
        const status = 0
        const created_at = new Date()
        const updated_at = new Date()
        const data_notif = new DaaNotification()
        data_notif.user_id = user_id
        data_notif.type = type
        data_notif.context_id = context_id
        data_notif.subject = subject
        data_notif.status = status
        data_notif.created_at = created_at
        data_notif.updated_at = updated_at

        if(await data_notif.save()){
            const max_id = await Database.connection('db_reader').from("daa_notifications").getMax("id")
            let id_notif = 0
            for(let index in max_id){
                id_notif = max_id[index].id
            }
            // Get notification data
            const notif = await Database.connection('db_reader')
                                    .select("*")
                                    .from("daa_notifications")
                                    .where("id", id_notif)
            let id_user = 0
            let from_id = 0
            let type = 0
            let subject = ""
            for(let index in notif){
                id_user = notif[index].user_id
                from_id = notif[index].from_id
                type = notif[index].type
                subject = notif[index].subject
            }
            const user = await Database.connection('db_reader')
                                    .select("*")
                                    .where("id", id_user)
            const user_token = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_user_tokens")
                                            .where("user_id", user_id)
                                            .orderBy("created_at", "DESC")
                                            .limit(1)
            let arrTokens = ""
            for(let index in user_token){
                arrTokens = user_token[index].token
            }
            let message = "-"
            //Object for controller push notif
            let notification = {
                'user_id': id_user,
                'from_id': from_id,
                'notif_type': type,
                'type': 0, //global notif
                'title': subject,
                'message': message,
                'body': message
            }
            let data = [{
                'user_id' : id_user,
                'type' : 0, //global notif
                'title' : subject,
                'message' : message,
                'body' : message
            }]
            var serverKey = Env.get('FCM_SERVER_KEY'); // put your server key here
            var fcm = new FCM(serverKey);
            var message_fcm = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                //to: 'registration_token',
                //registration_ids: ['registration_tokens'],
                to: arrTokens,
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

module.exports = PlacementTestController
