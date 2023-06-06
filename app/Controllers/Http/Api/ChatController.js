'use strict'

const Database = use('Database')
const Env = use('Env')
const Chat = use('App/Models/Chat')
const ChatDetail = use('App/Models/ChatDetail')
const User = use('App/Models/User')
const { validate } = use('Validator')
var FCM = require('fcm-node');


// const HttpContextContract = use('@ioc:Adonis/Core/HttpContext')

class ChatController {
    index = async ({response, auth}) => {
        const authUser = auth.user.toJSON()
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
        const query = await Database.connection('db_reader')
                                .select("*")
                                .from("daa_chats")
                                // .join("daa_chat_details", "daa_chats.id", "daa_chat_details.chat_id")
                                .where("daa_chats.to_id", authUser.id)
                                .orWhere("daa_chats.from_id", authUser.id)
        let user_id
        let data = []
        for(let index in query){
            let updated_at = query[index].updated_at.getDate()+" "+month[query[index].updated_at.getMonth()+1]+" "+query[index].updated_at.getFullYear()+" "+query[index].updated_at.getHours()+":"+query[index].updated_at.getMinutes()+":"+query[index].updated_at.getSeconds()
            let created_at = query[index].created_at.getDate()+" "+month[query[index].created_at.getMonth()+1]+" "+query[index].created_at.getFullYear()+" "+query[index].created_at.getHours()+":"+query[index].created_at.getMinutes()+":"+query[index].created_at.getSeconds()
            user_id = (query[index].from_id == authUser.id) ? query[index].from_id : query[index].to_id
            const users = await Database.connection('db_reader').select("*").from("user").where("id", user_id)
            const chat_detail = await Database.connection('db_reader').select("*").from("daa_chat_details").where("chat_id", query[index].id)
            const unread_data = await Database.connection('db_reader').select("*").from("daa_chat_details").where("chat_id", query[index].id).where("to_id", authUser.id).where("is_read", 0)
            
            let last_chat
            var element_chat_data = {}
            for(let index in chat_detail){
                let updated_at = chat_detail[index].updated_at.getDate()+" "+month[chat_detail[index].updated_at.getMonth()+1]+" "+chat_detail[index].updated_at.getFullYear()+" "+chat_detail[index].updated_at.getHours()+":"+chat_detail[index].updated_at.getMinutes()
                let created_at = chat_detail[index].created_at.getDate()+" "+month[chat_detail[index].created_at.getMonth()+1]+" "+chat_detail[index].created_at.getFullYear()+" "+chat_detail[index].created_at.getHours()+":"+chat_detail[index].created_at.getMinutes()
                last_chat = chat_detail[index].created_at.getDate()+" "+month[chat_detail[index].created_at.getMonth()+1]+" "+chat_detail[index].created_at.getFullYear()
                const is_mine = (chat_detail[index].is_mine == authUser.id) ? 1 : 0
                let decode_message = Buffer.from(chat_detail[index].message, 'base64').toString('ascii')

                element_chat_data.id = chat_detail[index].id
                element_chat_data.chat_id = chat_detail[index].chat_id
                element_chat_data.from_id = chat_detail[index].from_id
                element_chat_data.to_id = chat_detail[index].to_id
                element_chat_data.message = decode_message
                element_chat_data.is_file = chat_detail[index].is_file
                element_chat_data.is_read = chat_detail[index].is_read
                element_chat_data.created_at = created_at
                element_chat_data.updated_at = updated_at
                element_chat_data.is_mine = is_mine
            }
            
            var element_user = {}
            for(let index in users){
                const country = await Database.connection('db_reader').select("*").from("daa_countries").where("code", users[index].country)
                const url = Env.get('APP_URL')+'/tmp/uploads/'+users[index].id+'/profile_pic/'
                element_user.id = users[index].id
                element_user.username = users[index].username
                element_user.idnumber = users[index].idnumber
                element_user.firstname = users[index].firstname
                element_user.lastname = users[index].lastname
                element_user.email = users[index].email
                element_user.icq = users[index].icq
                element_user.skype = users[index].skype
                element_user.yahoo = users[index].yahoo
                element_user.aim = users[index].aim
                element_user.msn = users[index].msn
                element_user.phone1 = users[index].phone1
                element_user.phone2 = users[index].phone2
                element_user.institution = users[index].institution
                element_user.department = users[index].department
                element_user.address = users[index].address
                element_user.city = users[index].city
                element_user.country = users[index].country
                element_user.lang = users[index].lang
                element_user.lastlogin = users[index].lastlogin
                element_user.currentlogin = users[index].currentlogin
                element_user.picture = url+users[index].daa_picture
                element_user.daa_picture = users[index].daa_picture
                element_user.isreal = users[index].isreal
                element_user.country_name = country[0].name
                element_user.is_friend = users[index].is_friend
            }
            var element = {}
            element.id = query[index].id
            element.to_id = query[index].to_id
            element.from_id = query[index].from_id
            element.created_at = created_at
            element.updated_at = updated_at
            element.user = element_user
            element.unread = unread_data.length
            element.last_chat = last_chat
            element.detail = element_chat_data
            data.push(element)
        }
        return response.send({status: 200, message: "Ok", data: data})

    }

    view = async ({response, auth, params}) => {
        const authUser = auth.user.toJSON()
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
        let from_id = authUser.id
        let to_id = params.id
        const user = await User.findBy("id", to_id)
        // return user
        if (authUser.id == to_id || !user) {
            return response.send({status: 400, message: "user_notfound"})
        }
        const query = await Database.connection('db_reader')
                                .select(
                                    "daa_chats.id as id_chat",
                                    "daa_chats.from_id as from_id_chat",
                                    "daa_chats.to_id as to_id_chat",
                                    "daa_chats.created_at as created_at_chat",
                                    "daa_chats.updated_at as updated_at_chat",
                                    "daa_chat_details.id as id_details",
                                    "daa_chat_details.chat_id as chat_id_details",
                                    "daa_chat_details.from_id as from_id_details",
                                    "daa_chat_details.to_id as to_id_details",
                                    "daa_chat_details.message as message_details",
                                    "daa_chat_details.is_file as is_file_details",
                                    "daa_chat_details.is_read as is_read_details",
                                    "daa_chat_details.created_at as created_at_details",
                                    "daa_chat_details.updated_at as updated_at_details"
                                    )
                                .from("daa_chats")
                                .join("daa_chat_details", "daa_chats.id", "daa_chat_details.chat_id")
                                .orWhere("daa_chat_details.to_id", to_id)
                                .orWhere("daa_chat_details.from_id", from_id)
                                .orWhere("daa_chat_details.to_id", from_id)
                                .orWhere("daa_chat_details.from_id", to_id)
                                .limit(1)
        // return chat
        
        let data = []
        if (query) {
            for(let index in query){
                let updated_at_chat = query[index].updated_at_chat.getDate()+" "+month[query[index].updated_at_chat.getMonth()+1]+" "+query[index].updated_at_chat.getFullYear()+" "+query[index].updated_at_chat.getHours()+":"+query[index].updated_at_chat.getMinutes()+":"+query[index].updated_at_chat.getSeconds()
                let created_at_chat = query[index].created_at_chat.getDate()+" "+month[query[index].created_at_chat.getMonth()+1]+" "+query[index].created_at_chat.getFullYear()+" "+query[index].created_at_chat.getHours()+":"+query[index].created_at_chat.getMinutes()+":"+query[index].created_at_chat.getSeconds()
                let updated_at_details = query[index].updated_at_details.getDate()+" "+month[query[index].updated_at_details.getMonth()+1]+" "+query[index].updated_at_details.getFullYear()+" "+query[index].updated_at_details.getHours()+":"+query[index].updated_at_details.getMinutes()+":"+query[index].updated_at_details.getSeconds()
                let created_at_details = query[index].created_at_details.getDate()+" "+month[query[index].created_at_details.getMonth()+1]+" "+query[index].created_at_details.getFullYear()+" "+query[index].created_at_details.getHours()+":"+query[index].created_at_details.getMinutes()+":"+query[index].created_at_details.getSeconds()
                
                var element_detail = {}
                element_detail.id = query[index].id_details
                element_detail.chat_id = query[index].chat_id_details
                element_detail.from_id = query[index].from_id_details
                element_detail.to_id = query[index].to_id_details
                element_detail.message = query[index].message_details
                element_detail.is_file = query[index].is_file_details
                element_detail.is_read = query[index].is_read_details
                element_detail.created_at = created_at_details
                element_detail.updated_at = updated_at_details
                
                const users = await Database.connection('db_reader').select("*").from("user").where("id", params.id)
                
                var element_user = {}
                for(let index in users){
                    const country = await Database.connection('db_reader').select("*").from("daa_countries").where("code", users[index].country)
                    const url = Env.get('APP_URL')+'/tmp/uploads/'+users[index].id+'/profile_pic/'
                    element_user.id = users[index].id
                    element_user.username = users[index].username
                    element_user.idnumber = users[index].idnumber
                    element_user.firstname = users[index].firstname
                    element_user.lastname = users[index].lastname
                    element_user.email = users[index].email
                    element_user.icq = users[index].icq
                    element_user.skype = users[index].skype
                    element_user.yahoo = users[index].yahoo
                    element_user.aim = users[index].aim
                    element_user.msn = users[index].msn
                    element_user.phone1 = users[index].phone1
                    element_user.phone2 = users[index].phone2
                    element_user.institution = users[index].institution
                    element_user.department = users[index].department
                    element_user.address = users[index].address
                    element_user.city = users[index].city
                    element_user.country = users[index].country
                    element_user.lang = users[index].lang
                    element_user.lastlogin = users[index].lastlogin
                    element_user.currentlogin = users[index].currentlogin
                    element_user.picture = url+users[index].daa_picture
                    element_user.daa_picture = users[index].daa_picture
                    element_user.isreal = users[index].isreal
                    element_user.country_name = country[0].name
                    element_user.is_friend = users[index].is_friend
                }
                var element = {}
                element.id = query[index].id_chat
                element.from_id = query[index].from_id_chat
                element.to_id = query[index].to_id_chat
                element.created_at = updated_at_chat
                element.updated_at = created_at_chat
                element.details = element_detail
                element.user = element_user

                data.push(element)
                ChatDetail
                        .query()
                        .where('chat_id', query[index].chat_id_details)
                        .where('to_id', authUser.id)
                        .where('is_read', 0)
                        .update(['is_read', 1])
            }
            return response.send({status: 200, message: "Ok", data: data})
        }else{
            const users = await Database.connection('db_reader').select("*").from("user").where("id", params.id)
            var element_user = {}
            for(let index in users){
                const country = await Database.connection('db_reader').select("*").from("daa_countries").where("code", users[index].country)
                const url = Env.get('APP_URL')+'/tmp/uploads/'+users[index].id+'/profile_pic/'       
                element_user.id = users[index].id
                element_user.username = users[index].username
                element_user.idnumber = users[index].idnumber
                element_user.firstname = users[index].firstname
                element_user.lastname = users[index].lastname
                element_user.email = users[index].email
                element_user.icq = users[index].icq
                element_user.skype = users[index].skype
                element_user.yahoo = users[index].yahoo
                element_user.aim = users[index].aim
                element_user.msn = users[index].msn
                element_user.phone1 = users[index].phone1
                element_user.phone2 = users[index].phone2
                element_user.institution = users[index].institution
                element_user.department = users[index].department
                element_user.address = users[index].address
                element_user.city = users[index].city
                element_user.country = users[index].country
                element_user.lang = users[index].lang
                element_user.lastlogin = users[index].lastlogin
                element_user.currentlogin = users[index].currentlogin
                element_user.picture = url+users[index].daa_picture
                element_user.daa_picture = users[index].daa_picture
                element_user.isreal = users[index].isreal
                element_user.country_name = country[0].name
                element_user.is_friend = users[index].is_friend

                data.push(element_user)
            }
            return response.send({status: 200, message: "Ok", data: data})
        }
    }

    search = async ({response, auth, request}) => {
        const authUser = auth.user.toJSON()
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
        const { keyword, page } = request.all()
        const rules = {
            keyword: 'required'
          }
      
          const validation = await validate(request.all(), rules)
          let limit = 10
          let offset
          if (validation.fails()) {
              return response.send({status: 400, message: "validator_fails", data: validation.messages()})            
          }else{
            if (page) {
                offset = page*limit
            }else{
                offset = 0
            }
            let search = keyword
            const endcode_base64 = Buffer.from(search).toString('base64')
            const search_chat_from  = await Database.connection('db_reader')
                                                .select("dc.id")
                                                .from("daa_chats as dc")
                                                .join("daa_chat_details as dcd", "dc.id", "dcd.chat_id")
                                                .where("dc.from_id", authUser.id)
                                                .where("dcd.message", "LIKE", "%"+endcode_base64+"%")
            let tot_from = search_chat_from.length
            const search_chat_to = await Database.connection('db_reader')
                                            .select("dc.id")
                                            .from("daa_chats as dc")
                                            .join("daa_chat_details as dcd", "dc.id", "dcd.chat_id")
                                            .where("dc.to_id", authUser.id)
                                            .where("dcd.message", "LIKE", "%"+endcode_base64+"%")
            let tot_to = search_chat_to.length
            let data_id = []
            if (tot_from > 0 && tot_to > 0) {
                for(let index in search_chat_from){
                    data_id.push(search_chat_from[index].id)
                }
                for(let index in search_chat_to){
                    data_id.push(search_chat_to[index].id)
                }
            }else if(tot_from > 0 && tot_to == 0){
                for(let index in search_chat_from){
                    data_id.push(search_chat_from[index].id)
                }
            }else if(tot_from == 0 && tot_to > 0){
                for(let index in search_chat_to){
                    data_id.push(search_chat_to[index].id)
                }
            }
            const query = await Database.connection('db_reader')
                                        .select("*")
                                        .from("daa_chats")
                                        .whereIn("id", data_id)
                                        .orderBy("updated_at", "DESC")
            let user_id
            let data = []
            if (query != 0) {
                for(let index in query){
                    let updated_at = query[index].updated_at.getDate()+" "+month[query[index].updated_at.getMonth()+1]+" "+query[index].updated_at.getFullYear()+" "+query[index].updated_at.getHours()+":"+query[index].updated_at.getMinutes()+":"+query[index].updated_at.getSeconds()
                    let created_at = query[index].created_at.getDate()+" "+month[query[index].created_at.getMonth()+1]+" "+query[index].created_at.getFullYear()+" "+query[index].created_at.getHours()+":"+query[index].created_at.getMinutes()+":"+query[index].created_at.getSeconds()
                    user_id = (query[index].from_id == authUser.id) ? query[index].from_id : query[index].to_id
                    const users = await Database.connection('db_reader').select("*").from("user").where("id", user_id)
                    const chat_detail = await Database.connection('db_reader').select("*").from("daa_chat_details").where("chat_id", query[index].id).where("message", "LIKE", "%"+endcode_base64+"%")
                    const unread_data = await Database.connection('db_reader').select("*").from("daa_chat_details").where("chat_id", query[index].id).where("to_id", authUser.id).where("is_read", 0)
                    
                    let last_chat
                    var element_chat_data = {}
                    for(let index in chat_detail){
                        let updated_at = chat_detail[index].updated_at.getDate()+" "+month[chat_detail[index].updated_at.getMonth()+1]+" "+chat_detail[index].updated_at.getFullYear()+" "+chat_detail[index].updated_at.getHours()+":"+chat_detail[index].updated_at.getMinutes()
                        let created_at = chat_detail[index].created_at.getDate()+" "+month[chat_detail[index].created_at.getMonth()+1]+" "+chat_detail[index].created_at.getFullYear()+" "+chat_detail[index].created_at.getHours()+":"+chat_detail[index].created_at.getMinutes()
                        last_chat = chat_detail[index].created_at.getDate()+" "+month[chat_detail[index].created_at.getMonth()+1]+" "+chat_detail[index].created_at.getFullYear()
                        const is_mine = (chat_detail[index].is_mine == authUser.id) ? 1 : 0
                        const decode_message = Buffer.from(chat_detail[index].message, 'base64').toString('ascii')

                        element_chat_data.id = chat_detail[index].id
                        element_chat_data.chat_id = chat_detail[index].chat_id
                        element_chat_data.from_id = chat_detail[index].from_id
                        element_chat_data.to_id = chat_detail[index].to_id
                        element_chat_data.message = decode_message
                        element_chat_data.is_file = chat_detail[index].is_file
                        element_chat_data.is_read = chat_detail[index].is_read
                        element_chat_data.created_at = created_at
                        element_chat_data.updated_at = updated_at
                        element_chat_data.is_mine = is_mine
                    }
                    
                    var element_user = {}
                    for(let index in users){
                        const country = await Database.connection('db_reader').select("*").from("daa_countries").where("code", users[index].country)
                        const url = Env.get('APP_URL')+'/tmp/uploads/'+users[index].id+'/profile_pic/'
                        element_user.id = users[index].id
                        element_user.username = users[index].username
                        element_user.idnumber = users[index].idnumber
                        element_user.firstname = users[index].firstname
                        element_user.lastname = users[index].lastname
                        element_user.email = users[index].email
                        element_user.icq = users[index].icq
                        element_user.skype = users[index].skype
                        element_user.yahoo = users[index].yahoo
                        element_user.aim = users[index].aim
                        element_user.msn = users[index].msn
                        element_user.phone1 = users[index].phone1
                        element_user.phone2 = users[index].phone2
                        element_user.institution = users[index].institution
                        element_user.department = users[index].department
                        element_user.address = users[index].address
                        element_user.city = users[index].city
                        element_user.country = users[index].country
                        element_user.lang = users[index].lang
                        element_user.lastlogin = users[index].lastlogin
                        element_user.currentlogin = users[index].currentlogin
                        element_user.picture = url+users[index].daa_picture
                        element_user.daa_picture = users[index].daa_picture
                        element_user.isreal = users[index].isreal
                        element_user.country_name = country[0].name
                        element_user.is_friend = users[index].is_friend
                    }
                    var element = {}
                    element.id = query[index].id
                    element.to_id = query[index].to_id
                    element.from_id = query[index].from_id
                    element.created_at = created_at
                    element.updated_at = updated_at
                    element.user = element_user
                    element.unread = unread_data.length
                    element.detail = element_chat_data
                    element.last_chat = last_chat
                    data.push(element)
                }
                return response.send({status: 200, message: "Ok", data: data})
            }
        }
    }

    send = async ({response, auth, request}) => {
        const authUser = auth.user.toJSON()
        const { id, message, RowID } = request.all()
        let from_id = authUser.id
        let to_id = id
        let endcode_message = Buffer.from(message).toString('base64')
        let decode_message = Buffer.from(endcode_message, 'base64').toString('ascii')
        const check_user = await Database.connection('db_reader').select("*").from("user").where("id", to_id)
        
        if (authUser.id != to_id || !check_user) {
        // if (authUser.id == to_id || !check_user) {
            return response.send({status: 400, message: "user_notfound"})
        }
        const query = await Database.connection('db_reader')
                            .select(
                                "daa_chats.id as id_chat",
                                "daa_chats.from_id as from_id_chat",
                                "daa_chats.to_id as to_id_chat",
                                "daa_chats.created_at as created_at_chat",
                                "daa_chats.updated_at as updated_at_chat",
                                "daa_chat_details.id as id_details",
                                "daa_chat_details.chat_id as chat_id_details",
                                "daa_chat_details.from_id as from_id_details",
                                "daa_chat_details.to_id as to_id_details",
                                "daa_chat_details.message as message_details",
                                "daa_chat_details.is_file as is_file_details",
                                "daa_chat_details.is_read as is_read_details",
                                "daa_chat_details.created_at as created_at_details",
                                "daa_chat_details.updated_at as updated_at_details"
                                )
                            .from("daa_chats")
                            .join("daa_chat_details", "daa_chats.id", "daa_chat_details.chat_id")
                            .orWhere("daa_chat_details.to_id", to_id)
                            .orWhere("daa_chat_details.from_id", from_id)
                            .orWhere("daa_chat_details.to_id", from_id)
                            .orWhere("daa_chat_details.from_id", to_id)
                            .limit(1)
        // return query
        if (query != 0) {
            await Database.connection('db_writer')
                .table('daa_chats')
                .where('id', query[0].id_chat)
                .update("created_at", new Date())
        }else{
            const chat = new Chat()
            chat.from_id = from_id
            chat.to_id = to_id
            await chat.save()
        }
        const unread = await Database.connection('db_reader').select("*").from("daa_chat_details").where("chat_id", query[0].id_chat).where("to_id", authUser.id).where("is_read", 0)
        let array_data = []
        const chat_detail_query = new ChatDetail()
        chat_detail_query.chat_id = query[0].id_chat
        chat_detail_query.from_id = from_id
        chat_detail_query.to_id = to_id
        chat_detail_query.message = endcode_message
        await chat_detail_query.save()

        chat_detail_query.is_mine = 0
        chat_detail_query.type = 1

        chat_detail_query.RowID = RowID
        chat_detail_query.hasSent = 1
        chat_detail_query.isError = 0
        chat_detail_query.unread = unread.length
        
        array_data.push(chat_detail_query)
        let sender_name = ""
        const get_user = await Database.connection('db_reader').select("*").from("user").where("id", authUser.id)
        const fullname = get_user[0].firstname+" "+get_user[0].lastname
        if (get_user != 0) {
            sender_name = fullname
        }
        let arrTokens_query = await Database.connection('db_reader').select("firebase_token").from("daa_user_tokens").where("user_id", to_id).orderBy("id", "DESC").limit(1)
        let arrTokens = ""
        for(let index in arrTokens_query){
            arrTokens = arrTokens_query[index].firebase_token
        }
        // return arrTokens
        let notification = {
            title: "Message from "+fullname,
            body: decode_message
        }
        let data = {
            user_id: check_user[0].id,
            type: 1,
            title: "Message from "+fullname,
            message: decode_message,
            loadData: array_data
        }
        //send notif
        
        // async (arrTokens , notification, data) {
            // return notification
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

        let result = []
        var element = {}
        element.chat_id = query[0].id_chat
        element.from_id = from_id
        element.to_id = to_id
        element.message = endcode_message

        element.is_mine = 1
        element.type = 1

        element.RowID = RowID
        element.hasSent = 1
        element.isError = 0
        element.unread = unread.length
        result.push(element)
        return response.send({status: 200, message: "Ok", data: result})
    }
}

module.exports = ChatController
