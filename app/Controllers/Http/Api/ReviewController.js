'use strict'

const Database = use('Database')
const Env = use('Env')
const DaaChallengeAnswer = use('App/Models/DaaChallengeAnswer')
const DaaNotification = use('App/Models/DaaNotification')

class ReviewController {
    //Get List Module Review
    index = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const review = await Database.connection('db_reader')
                                .select("ca.id as caid", "c.fullname AS course", "ca.*", "u.*", "ca.userid as user_id", "u.daa_picture")
                                .from("daa_challenge_answer as ca")
                                .join("user as u", "u.id", "ca.userid")
                                .join("course as c", "c.id", "ca.cmid")
                                .leftJoin("daa_challenge_buddy as b", "b.learnerid", "u.id")
                                .where("ca.status", 0)
                                .where("grade_by", user_id)
                                .orWhere("grade_by", null)
                                .where("b.buddyid", user_id)
                                .where("ca.grade", -1)
                                .where("ca.reviewtype", 1)
                                .orWhere("ca.reviewtype", 2)
                                .orWhere("ca.reviewtype", 3)
                                .groupBy("user_id")
                                .orderBy("ca.grade", "ASC")
                                .orderBy("ca.submit_date", "ASC")
        for(let index in review){
            const url = Env.get('APP_URL')+'/tmp/uploads/'+review[index].user_id+'/profile_pic/'
            review[index].picture = url+review[index].daa_picture

        }
        return response.send({status: 200, message: "OK", data: review})
    }
    //Get Review Module By ID
    module = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const id = params.id
        const review = await Database.connection('db_reader')
                                .select("ca.id as caid", "c.fullname AS course", "ca.*", "u.*", "ca.userid as user_id", "u.daa_picture")
                                .from("daa_challenge_answer as ca")
                                .join("user as u", "u.id", "ca.userid")
                                .join("course as c", "c.id", "ca.cmid")
                                .leftJoin("daa_challenge_buddy as b", "b.learnerid", "u.id")
                                .where("ca.userid", id)
                                .where("ca.status", 0)
                                .where("grade_by", user_id)
                                .orWhere("grade_by", null)
                                .where("b.buddyid", user_id)
                                .where("ca.grade", -1)
                                .where("ca.reviewtype", 1)
                                .orWhere("ca.reviewtype", 2)
                                .orWhere("ca.reviewtype", 3)
                                .groupBy("user_id")
                                .orderBy("ca.grade", "ASC")
                                .orderBy("ca.submit_date", "ASC")
        for(let index in review){
            const url = Env.get('APP_URL')+'/tmp/uploads/'+review[index].user_id+'/profile_pic/'
            review[index].picture = url+review[index].daa_picture

        }
        return response.send({status: 200, message: "OK", data: review})
    }
    //Get Detail Review Module
    detail = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const id = params.id
        const id_user = params.user_id
        let review = 0
        if(id_user != null){
            const review = await Database.connection('db_reader')
                                    .select("ca.id as caid", "c.fullname AS course", "ca.*", "u.*", "ca.userid as user_id", "u.daa_picture")
                                    .from("daa_challenge_answer as ca")
                                    .join("user as u", "u.id", "ca.userid")
                                    .join("course as c", "c.id", "ca.cmid")
                                    .leftJoin("daa_challenge_buddy as b", "b.learnerid", "u.id")
                                    .where("ca.cmid", id)
                                    .where("ca.userid", id_user)
                                    .where("ca.status", 0)
                                    .where("grade_by", user_id)
                                    .orWhere("grade_by", null)
                                    .where("b.buddyid", user_id)
                                    .where("ca.grade", -1)
                                    .where("ca.reviewtype", 1)
                                    .orWhere("ca.reviewtype", 2)
                                    .orWhere("ca.reviewtype", 3)
                                    .groupBy("user_id")
                                    .orderBy("ca.grade", "ASC")
                                    .orderBy("ca.submit_date", "ASC")
            for(let index in review){
                const url = Env.get('APP_URL')+'/tmp/uploads/'+review[index].user_id+'/profile_pic/'
                review[index].picture = url+review[index].daa_picture

            }
            return response.send({status: 200, message: "OK", data: review})
        }else{
            const review = await Database.connection('db_reader')
                                    .select("ca.id as caid", "c.fullname AS course", "ca.*", "u.*", "ca.userid as user_id", "u.daa_picture")
                                    .from("daa_challenge_answer as ca")
                                    .join("user as u", "u.id", "ca.userid")
                                    .join("course as c", "c.id", "ca.cmid")
                                    .leftJoin("daa_challenge_buddy as b", "b.learnerid", "u.id")
                                    .where("ca.cmid", id)
                                    .where("ca.status", 0)
                                    .where("grade_by", user_id)
                                    .orWhere("grade_by", null)
                                    .where("b.buddyid", user_id)
                                    .where("ca.grade", -1)
                                    .where("ca.reviewtype", 1)
                                    .orWhere("ca.reviewtype", 2)
                                    .orWhere("ca.reviewtype", 3)
                                    .groupBy("user_id")
                                    .orderBy("ca.grade", "ASC")
                                    .orderBy("ca.submit_date", "ASC")
            for(let index in review){
                const url = Env.get('APP_URL')+'/tmp/uploads/'+review[index].user_id+'/profile_pic/'
                review[index].picture = url+review[index].daa_picture

            }
            return response.send({status: 200, message: "OK", data: review})
        }
    }
    //Get Review Grade Module
    review_grade = async ({auth, params, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const { a, g, b } = request.all()
        const date = new Date()
        const query = await Database.connection('db_reader')
                                .select("ca.*", "s.name as scorm_name")
                                .from("daa_challenge_answer as ca")
                                .join("course_modules as cm", "cm.id", "ca.cmid")
                                .join("scorm as s", "s.id", "cm.instance")
                                .where("ca.id", a)
        DaaChallengeAnswer
                    .query()
                    .where("id", a)
                    .update({
                        grade: g,
                        grade_by: b, 
                        status: 1,
                        grade_date: date,
                    })
        if(query.length > 0){
            for(let index in query){
                //Insert Notification
                const notif = new DaaNotification()
                notif.user_id = query[index].userid
                notif.from_id = 0
                notif.context_id = query[index].id
                notif.type = "review_superior"
                notif.subject = "Activity Reviewed"
                notif.created_at = date
                notif.updated_at = date

                if(await notif.save){
                    this.push_notif_by_id(notif.id)
                }
                const my_query = await Database.connection('db_reader')
                                            .select("dca.status")
                                            .from("daa_challenge_answer as dca")
                                            .where("dca.userid", query[index].userid)
                                            .where("dca.cmid", query[index].cmid)
                                            .where("dca.status", 0)
                if(my_query.length > 0){
                    //Insert Notification
                    const notif = new DaaNotification()
                    notif.user_id = query[index].userid
                    notif.from_id = 0
                    notif.context_id = query[index].id
                    notif.type = "review_superior"
                    notif.subject = "Activity Reviewed"
                    notif.created_at = date
                    notif.updated_at = date

                    if(await notif.save){
                        this.push_notif_by_id(notif.id)
                    }
                }
    			// jika bertingkat
                if(query[index].reviewtype == "2"){
				    // ambil si buddy 
                    const query_challenge_buddy = await Database.connection('db_reader')
                                                            .from("daa_challenge_buddy")
                                                            .where("buddyid", b)
                                                            .where("learnerid", query[index].userid)
                    if(query_challenge_buddy.length > 0){
                        const temp_user_info = await Database.connection('db_reader')
                                                        .select("u.id as uid")
                                                        .from("user_info_data as d")
                                                        .join("user_info_field as f", "d.fieldid", "f.id")
                                                        .join("user as u", "u.username", "d.data")
                                                        .where("f.shortname", "superior")
                                                        .where("d.userid", query[index].userid)
                        let atasanid = 0
                        if(temp_user_info.length > 0){
                            for(let index in temp_user_info){
                                atasanid = temp_user_info[index].uid
                            }
                        }
    					// cek jika semuanya di approve
                        let challenge
                        let flag = 1
                        if(query[index].userid != -1){
                            challenge = await Database.connection('db_reader')
                                                    .from("daa_challenge_answer")
                                                    .where("userid", query[index].userid)
                                                    .orderBy("id", "DESC")
                        }
                        challenge = await Database.connection('db_reader')
                                                .from("daa_challenge_answer")
                                                .where("cmid", query[index].cmid)
                                                .orderBy("id", "DESC")
                        for(let index in challenge){
                            if(challenge[index].status == 0 && challenge[index].grade == -1 || challenge[index].status == 1 && challenge[index].grade < challenge[index].pass_grade){
                                flag = 0
                            }
                        }
                        if(flag == 1){
                            const get_atasan = await Database.connection('db_reader')
                                                        .from("daa_challenge_answer")
                                                        .where("cmid", query[index].cmid)
                                                        .orderBy("id", "DESC")
                            if(query[index].userid != -1){
                                get_atasan = await Database.connection('db_reader')
                                                        .from("daa_challenge_answer")
                                                        .where("userid", query[index].userid)
                                                        .orderBy("id", "DESC")
                            }
                            for(let index in get_atasan){
                                const arr_data = new DaaChallengeAnswer()
                                arr_data.id = null,
                                arr_data.cmid = get_atasan[index].cmid
                                arr_data.userid = get_atasan[index].userid
                                arr_data.activityid = get_atasan[index].activityid
                                arr_data.activity_title = get_atasan[index].activity_title
                                arr_data.activity_type = get_atasan[index].activity_type
                                arr_data.activity_question = get_atasan[index].activity_question
                                arr_data.activity_response = get_atasan[index].activity_response
                                arr_data.pass_grade = get_atasan[index].pass_grade
                                arr_data.submit_date = get_atasan[index].submit_date
                                arr_data.grade_type = get_atasan[index].grade_type
                                arr_data.grade = -1
                                arr_data.grade_date = 0
                                arr_data.grade_by = atasanid
                                arr_data.status = 0
                                arr_data.reviewtype = 1
                                arr_data.selected_id = 0
                                arr_data.superior = 0

                                await arr_data.save()
                            }
                        }
                    }
                }
            }
        }
        const result_respon = await Database.connection('db_reader')
                                        .from("daa_challenge_answer")
                                        .where("id", a)
                                        .where("grade", g)
                                        .where("grade_by", b)

        return response.send({status: 200, message: "OK"})
    }
    //Send Push Notification By User Id
    push_notif_by_id = async (id) => {
        let module_id = 0
        const data_notif = await Database.connection('db_reader')
                                    .from("daa_notifications")
                                    .where("id", id)
        if(data_notif != 0){
            for(let index in data_notif){
                const data_user = await Database.connection('db_reader')
                                            .from("user")
                                            .where("id", data_notif[index].user_id)
                //Send Push Notification
                let message = "-"
                let params = ""
                for(let index in data_user){
                    if(data_notif[index].type == "contact"){
                        message = data_user[index].firstname+" "+data_user[index].lastname+" added you as contact."
                    }else if(data_notif[index].type == "enrol"){
                        const data_journey = await Database.connection('db_reader')
                                                        .from("daa_journeys")
                                                        .where("id", data_notif[index].context_id)
                        for(let index in data_journey){
                            message = "You are enrolled to learn "+data_journey[index].name
                        }
                    }else if(data_notif[index].type == "review_superior"){
                        let name_module = ""
                        const data_module = await Database.connection('db_reader')
                                                        .select("fullname")
                                                        .from("course")
                                                        .where("id", module_id)
                        if(data_module != 0){
                            for(let index in data_module){
                                name_module = data_module[index].fullname
                            }
                        }
                        message = "Your supervisor has reviewed your learning activities! Check it out on "+name_module+"!"
                    }else if(data_notif[index].type == "review_member"){
                        let name_module = ""
                        const data_module = await Database.connection('db_reader')
                                                        .select("fullname")
                                                        .from("course")
                                                        .where("id", module_id)
                        if(data_module != 0){
                            for(let index in data_module){
                                name_module = data_module[index].fullname
                            }
                        }
                        message = "Your team member sent you something! Check it out on "+name_module+"!"
                    }else if(data_notif[index].type == "system"){
                        message = data_notif[index].message
                    }else if(data_notif[index].type == "app_update"){
                        message = data_notif[index].message
                    }else if(data_notif[index].type == "journey_achievement"){
                        const data_journey = await Database.connection('db_reader')
                                                        .from("daa_journeys")
                                                        .where("id", data_notif[index].context_id)
                        for(let index in data_journey){
                            message = "You've got new achievement on journey "+ data_journey[index].name
                        }
                    }else if(data_notif[index].type == "badge"){
                        const data_badge = await Database.connection('db_reader')
                                                    .from("daa_badges")
                                                    .where("id", data_notif[index].context_id)
                        for(let index in data_badge){
                            message = "You've got badge "+data_badge[index].name
                        }
                    }else if(data_notif[index].type == "new_course"){
                        params = JSON.parse(data_user[index].params)
                    }
                }
            }
            //Object for controller push notif
            let fcm_data = {
                user_id: data_user[index].user_id,
                from_id: data_user[index].from_id,
                notif_type: data_user[index].notif_type,
                type: 0,
                title: data_user[index].subject,
                message: message,
                body: message
            }

            //Array data for mobile apps
            let notif_data = []
            var element = {}
            element.user_id = data_user[index].user_id
            element.type = 0
            element.title = data_user[index].subject
            element.message = message
            element.body = message
            
            notif_data.push(element)
            this.push_notif(user_id, fcm_data, notif_data)
        }
    }
    //Send Notification
    push_notif = async (arrTokens, data, notification) => {
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

module.exports = ReviewController
