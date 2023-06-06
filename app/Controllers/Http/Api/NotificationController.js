'use strict'

const Database = use('Database')
const Env = use('Env')
const { validate } = use('Validator')

class NotificationController {
    //Get Notification
    index = async ({auth, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
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
        const datas = await Database.connection('db_reader')
                                .select("*")
                                .from("daa_notifications")
                                .whereIn("type", ["app_update", "system"])
                                .where("user_id", user_id)
                                .orderBy("status", "ASC")
        for(let index in datas){
            if(datas[index].created_at){
                datas[index].created_at = datas[index].created_at.getDate()+" "+month[datas[index].created_at.getMonth()+1]+" "+datas[index].created_at.getFullYear()+" "+datas[index].created_at.getHours()+":"+datas[index].created_at.getMinutes()
            }
            if(datas[index].type == "contact"){
                const get_user = await Database.connection('db_reader')
                                            .select("*")
                                            .from("user")
                                            .where("id", datas[index].from_id)
                for(let index in get_user){
                    if(get_user[index].daa_picture){
                        //Get Picture Data
                        const url = Env.get('APP_URL')+'/tmp/uploads/'+get_user[index].id+'/profile_pic/'
                        datas[index].image = url+get_user[index].daa_picture
                    }
                }
            }
            datas[index].image = ""
        }
        const recent = await Database.connection('db_reader')
                                .from("daa_notifications")
                                .where("status", 0)
                                .where("user_id", user_id)
                                .whereIn("type", ["app_update", "system"])
        var data = {
            data: datas,
            total: recent.length
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Get Notification By System With Page
    system_page = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const page = params.page
        let limit = 20
        let offset = page*limit
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
        const datas = await Database.connection('db_reader')
                                .select("*")
                                .from("daa_notifications")
                                .whereIn("type", ["app_update", "system"])
                                .where("user_id", user_id)
                                .orderBy("status", "ASC")
                                .offset(offset)
                                .limit(limit)
        for(let index in datas){
            if(datas[index].created_at){
                datas[index].created_at = datas[index].created_at.getDate()+" "+month[datas[index].created_at.getMonth()+1]+" "+datas[index].created_at.getFullYear()+" "+datas[index].created_at.getHours()+":"+datas[index].created_at.getMinutes()
            }
            if(datas[index].type == "contact"){
                const get_user = await Database.connection('db_reader')
                                            .select("*")
                                            .from("user")
                                            .where("id", datas[index].from_id)
                for(let index in get_user){
                    if(get_user[index].daa_picture){
                        //Get Picture Data
                        const url = Env.get('APP_URL')+'/tmp/uploads/'+get_user[index].id+'/profile_pic/'
                        datas[index].image = url+get_user[index].daa_picture
                    }
                }
            }
            datas[index].image = ""
        }
        const recent = await Database.connection('db_reader')
                                .from("daa_notifications")
                                .where("status", 0)
                                .where("user_id", user_id)
                                .whereIn("type", ["app_update", "system"])
        var data = {
            data: datas,
            total: recent.length
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Get Notification By Learning
    learning = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
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
        let array_type = ['enrol', 'journey_achievement', 'contact', 'review_member', 'review_superior', 'badge', 'learning_general', 'new_course', 'new_module','deadline_reminder_user', 'reward']
        const datas = await Database.connection('db_reader')
                                .from("daa_notifications")
                                .where("user_id", user_id)
                                .whereIn("type", array_type)
                                .orderBy("status", "ASC")
        const recent = await Database.connection('db_reader')
                                .from("daa_notifications")
                                .where("user_id", user_id)
                                .whereIn("type", array_type)
                                .where("status", 0)
        for(let index in datas){
            let journey_id = 0
            let type = 0
            let journey_name = ""
            let type_data = ""
            if(datas[index].created_at){
                datas[index].created_at = datas[index].created_at.getDate()+" "+month[datas[index].created_at.getMonth()+1]+" "+datas[index].created_at.getFullYear()+" "+datas[index].created_at.getHours()+":"+datas[index].created_at.getMinutes()
            }
            if(datas[index].type == "contact"){
                const get_user = await Database.connection('db_reader')
                                            .select("*")
                                            .from("user")
                                            .where("id", datas[index].from_id)
                for(let index in get_user){
                    if(get_user[index].daa_picture){
                        //Get Picture Data
                        const url = Env.get('APP_URL')+'/tmp/uploads/'+get_user[index].id+'/profile_pic/'
                        datas[index].image = url+get_user[index].daa_picture
                    }
                }
            }
            datas[index].image = ""
            if(datas[index].type == "badge"){
                const badge_data = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_badges")
                                            .where("id", datas[index].context_id)
                for(let index in badge_data){
                    journey_id = badge_data[index].daa_journey_id
                    type = badge_data[index].badgetype
                }
                const get_journey_name = await Database.connection('db_reader')
                                                    .select("name")
                                                    .from("daa_journeys")
                                                    .where("id", journey_id)
                for(let index in get_journey_name){
                    journey_name = get_journey_name[index].name
                }
                if(type == 1){
                    type_data = "journey"
                }else if(type == 2){
                    type_data = "course"
                }else if(type == 3){
                    type_data = "module"
                }
                datas[index].journey_id = journey_id
                datas[index].journey_name = journey_name
                datas[index].type_badge = type_data
            }
            datas[index].params = JSON.parse(datas[index].params)
        }
        var data = {
            data: datas,
            total: recent.length
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Get Notifiaction By Learning With Page
    learning_page = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const page = params.page
        let limit = 20
        let offset = page*limit
        let array_type = ['enrol', 'journey_achievement', 'contact', 'review_member', 'review_superior', 'badge', 'learning_general', 'new_course', 'new_module', 'deadline_reminder_user', 'reward']
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
        const datas = await Database.connection('db_reader')
                                .from("daa_notifications")
                                .where("user_id", user_id)
                                .whereIn("type", array_type)
                                .orderBy("status", "ASC")
                                .offset(offset)
                                .limit(limit)
        const recent = await Database.connection('db_reader')
                                .from("daa_notifications")
                                .where("user_id", user_id)
                                .whereIn("type", array_type)
                                .where("status", 0)
        for(let index in datas){
            let journey_id = 0
            let type = 0
            let journey_name = ""
            let type_data = ""
            if(datas[index].created_at){
                datas[index].created_at = datas[index].created_at.getDate()+" "+month[datas[index].created_at.getMonth()+1]+" "+datas[index].created_at.getFullYear()+" "+datas[index].created_at.getHours()+":"+datas[index].created_at.getMinutes()
            }
            if(datas[index].type == "contact"){
                const get_user = await Database.connection('db_reader')
                                            .select("*")
                                            .from("user")
                                            .where("id", datas[index].from_id)
                for(let index in get_user){
                    if(get_user[index].daa_picture){
                        //Get Picture Data
                        const url = Env.get('APP_URL')+'/tmp/uploads/'+get_user[index].id+'/profile_pic/'
                        datas[index].image = url+get_user[index].daa_picture
                    }
                }
            }
            datas[index].image = ""
            if(datas[index].type == "badge"){
                const badge_data = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_badges")
                                            .where("id", datas[index].context_id)
                for(let index in badge_data){
                    journey_id = badge_data[index].daa_journey_id
                    type = badge_data[index].badgetype
                }
                const get_journey_name = await Database.connection('db_reader')
                                                    .select("name")
                                                    .from("daa_journeys")
                                                    .where("id", journey_id)
                for(let index in get_journey_name){
                    journey_name = get_journey_name[index].name
                }
                if(type == 1){
                    type_data = "journey"
                }else if(type == 2){
                    type_data = "course"
                }else if(type == 3){
                    type_data = "module"
                }
                datas[index].journey_id = journey_id
                datas[index].journey_name = journey_name
                datas[index].type_badge = type_data
            }
            datas[index].params = JSON.parse(datas[index].params)
        }
        var data = {
            data: datas,
            total: recent.length
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Send Blast Notification SMS
    blast = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const { notification_id } = request.all()
        const rules = {
            notification_id: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            //Get Notification Data
            const notif_data = await Database.connection('db_reader')
                                        .from("daa_notifications")
                                        .where("id", notification_id)
            if(notif_data != 0){
                for(let index in notif_data){
                    const user_data = await Database.connection('db_reader')
                                                .from("user")
                                                .where("id", notif_data[index].user_id)
                    if(user_data != 0){
                        for(let index in user_data){
                            let phone = user_data[index].phone2
                            let msgku = notif_data[index].message
                            //Send SMS
                            await this.sendSMS({phone, msgku})
                        }
                    }
                }
            }
        }
    }
    //Send SMS
    sendSMS = async ({phone, msgku})=>{
        // console.log(phone+ ' = '+ msgku)
        const querystring = use('querystring');
        const { curly } = use('node-libcurl');

        var balikan="Awal";
        const { statusCode, data, headers } = await curly.post('https://alpha.zenziva.net/apps/smsapi.php', {
            postFields: querystring.stringify({
                            userkey: "wr0y75",
                            passkey:"DAA123!@#",
                            nohp:phone,
                            pesan: msgku
                        }),
            sslVerifyHost:2,
            sslVerifyPeer:0,
            // can use `postFields` or `POSTFIELDS`
        })        
        balikan=statusCode;
        
        return balikan
        
    }
    //Push Notifications
    push = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const { notification_id, module_id } = request.all()
        const rules = {
            notification_id: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            //Get Notification Data
            const data_notif = await Database.connection('db_reader')
                                        .from("daa_notifications")
                                        .where("id", notification_id)
            if(data_notif != 0){
                for(let index in data_notif){
                    const data_user = await Database.connection('db_reader')
                                                .from("user")
                                                .where("id", data_notif[index].user_id)
                    if(data_user != 0){
                        for(let index in data_user){
                            //Send Push Notification
                            let message = "-"
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
                            this.push_notif(data_user[index].user_id, fcm_data, notif_data)
                        }
                    }
                }
            }
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
    //Push Notification Reward
    push_reward = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const { id_user, reward_id, status } = request.all()
        const rules = {
            id_user: 'required',
            reward_id: 'required',
            status: 'required',
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            const get_reward_name = await Database.connection('db_reader')
                                                .select("title")
                                                .from("daa_reward")
                                                .where("id", reward_id)
            let reward_name = ""
            for(let index in get_reward_name){
                reward_name = get_reward_name[index].title
            }
            let message = ""
            if(status == 1){
                message = "Congratulations! Your request for "+reward_name+" has been approved. Please contact your learning administrator."
            }else if(status == 2){
                message = "Sorry! Your request for "+reward_name+" has been cancelled. Please contact your learning administrator for more information."
            }                            
            //Object for controller push notif
            let fcm_data = {
                user_id: id_user,
                from_id: 0,
                notif_type: "reward",
                type: 0,
                title: "reward",
                message: message
            }

            //Array data for mobile apps
            let notif_data = []
            var element = {}
            element.user_id = id_user
            element.type = 0
            element.title = "reward"
            element.message = message
            element.body = message
            
            notif_data.push(element)
            this.push_notif(id_user, fcm_data, notif_data)
        }
    }
    //Push Notification Point
    push_point = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const { id_user, point, journey_id, course_id, module_id, type } = request.all()
        const rules = {
            id_user: 'required',
            point: 'required',
            journey_id: 'required',
            course_id: 'required',
            module_id: 'required',
            type: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            //Send Push Notification
            let message = ""
            let title = ""
            let notif_type = ""
            let journey_name = ""
            let module_name = ""
            if(type == 3){
                title = point+" Points"
                message = "Congratulations! Poin has been added to your program."
                notif_type = "point"
            }else if(type == 4){
                title = "Max Point Reached"
                message = "Sorry, but you have reached a maximum points for this module. You can collect more program points by doing another modules."
                notif_type = "max_attempt_point"
            }
            const get_journey = await Database.connection('db_reader')
                                            .select("name")
                                            .from("daa_journeys")
                                            .where("id", journey_id)
            for(let index in get_journey){
                journey_name = get_journey[index].name
            }
            const get_module = await Database.connection('db_reader')
                                        .select("fullname")
                                        .from("course")
                                        .where("id", module_id)
            for(let index in get_module){
                module_name = get_module[index].fullname
            }            
            //Object for controller push notif
            let fcm_data = {
                user_id: id_user,
                from_id: 0,
                notif_type: notif_type,
                type: type,
                title: title,
                message: message,
                journey_id: journey_id,
                journey_name: journey_name,
                course_id: course_id,
                module_id: module_id,
                module_name: module_name
            }

            //Array data for mobile apps
            let notif_data = []
            var element = {}
            element.user_id = id_user
            element.type = type
            element.title = title
            element.message = message
            element.body = message
            element.journey_id = journey_id
            element.journey_name = journey_name
            element.course_id = course_id
            element.module_id = module_id
            element.module_name = module_name
            
            notif_data.push(element)
            this.push_notif(id_user, fcm_data, notif_data)
        }
    }
    //Push Notification Support
    push_support = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const { email, title, message  } = request.all()
        const rules = {
            email: 'required',
            title: 'required',
            message: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            //Get User Data
            const user_data = await Database.connection('db_reader')
                                        .from("user")
                                        .where("email", email)
            if(user_data != 0){
                 for(let index in user_data){            
                    //Object for controller push notif
                    let fcm_data = {
                        user_id: user_data[index].id,
                        type: 2,
                        title: title,
                        message: message
                    }

                    //Array data for mobile apps
                    let notif_data = []
                    var element = {}
                    element.user_id = user_data[index].id
                    element.from_id = 0
                    element.type = 2
                    element.title = title
                    element.message = message
                    element.body = message
                    
                    notif_data.push(element)
                    const get_token = await Database.connection('db_reader')
                                                .from("daa_user_tokens")
                                                .where("user_id", user_data[index].id)
                                                .orderBy("id", "DESC")
                                                .limit(1)
                    for(let index in get_token){
                        //send notif
                        
                        // async (arrTokens , notification, data) {
                            // return notification
                            var serverKey = Env.get('FCM_SERVER_KEY'); // put your server key here
                            var fcm = new FCM(serverKey);
                            var message_fcm = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                //to: 'registration_token',
                                //registration_ids: ['registration_tokens'],
                                to: get_token[index].firebase_token,
                                collapse_key: 'your_collapse_key',
                        
                                notification: fcm_data,
                                data : notif_data
                        
                        
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
        }
    }
    //Push Notification System
    push_system = async ({auth, params, response}) => {
        const user_id = params.user_id
        const notification_id = params.notification_id

        const get_notif = await Database.connection('db_reader')
                                    .from("daa_notifications")
                                    .where("id", notification_id)
        if(get_notif != 0){
            for(let index in get_notif){
                //Object for controller push notif
                let fcm_data = {
                    user_id: get_notif[index].user_id,
                    from_id: get_notif[index].from_id,
                    notif_type: get_notif[index].type,
                    type: 0,
                    title: get_notif[index].subject,
                    message: get_notif[index].message,
                    body: get_notif[index].message
                }

                //Array data for mobile apps
                let notif_data = []
                var element = {}
                element.user_id = get_notif[index].user_id
                element.type = 0
                element.title = get_notif[index].subject
                element.message = get_notif[index].message
                element.body = get_notif[index].message
                
                notif_data.push(element)
                this.push_notif(user_id, fcm_data, notif_data)
            }
        }
    }
}

module.exports = NotificationController
