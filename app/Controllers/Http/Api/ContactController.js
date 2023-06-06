'use strict'

const Contact = use('App/Models/Contact')
const User = use('App/Models/User')
const Notification = use('App/Models/DaaNotification')
const { validate } = use('Validator')
const Env = use('Env')
const Database = use('Database')

class ContactController {
    //Get List User
    index = async ({auth, response})=>{
        const authUser = auth.user.toJSON()
        var arr = []
        const query = await Database.connection('db_reader').select("*").from("daa_contacts").where('user_id', authUser.id)
        const contact = Contact.findBy('user_id', authUser.id)
        let data
        let pic_url
        for (let index in query) {
            const contact_id = query[index].contact_id

            arr.push(contact_id)
        }
        if (contact) {
            pic_url = Env.get('APP_URL')+'/uploads/assets/images/'
            data = await Database.connection('db_reader').select('id', 'firstname', 'lastname', 'picture', 'daa_picture').from("user").whereIn('id', arr).orderBy('firstname').orderBy('lastname')
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Insert User to contact
    add = async ({request, auth, response}) =>{
        const authUser = auth.user.toJSON()
        const { id } = request.all()
        let date_now = new Date().getTime()
        let message
        let status
        const user = await Database.connection('db_reader')
                                .from("user")
                                .where("id", id)
        if (user == 0) {
            return response.send({status: 400, message: "User Not Found"})
        }else{
            for(let index in user){
                const query = await Database.connection('db_reader')
                                        .from("daa_contacts")
                                        .where('user_id', authUser.id)
                                        .where('contact_id', user[index].id)
                if (query == 0 && id != authUser.id) {
                    const contact = new Contact()
                    contact.user_id = authUser.id
                    contact.contact_id = id
                    contact.created_at = date_now
                    if (await contact.save()) {
                        const notif = new Notification()
                        notif.user_id = contact.contact_id
                        notif.from_id = contact.user_id
                        notif.type = 'contact'
                        notif.subject = 'New Contact'
                        notif.save()
                        
                        status = 200
                        message = "Contact was Added!"
                    }else{
                        status = 500
                        message = "Database Error!"
                    }
                }else{
                    status = 200
                    message = "Contact Not Found"
                }
            }
        }
        return response.send({status: status, message: message})
    }

    remove = async ({request, response, auth}) =>{
        const authUser = auth.user.toJSON()
        const { contact_id } = request.all()
        await Contact
                    .query()
                    .where('user_id', authUser.id)
                    .where('contact_id', contact_id)
                    .delete()

        return response.send({status: 200, message: "Contact was Removed!"})
        
    }

    search = async ({request, response, auth}) =>{
        const {keyword, page} = request.all()
        const authUser = auth.user.toJSON()
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
              const friend = await Database.connection('db_reader')
                                        .select("*")
                                        .from("daa_contacts as dc")
                                        .join("user as u", "u.id", "dc.contact_id")
                                        .where("u.id", authUser.id)
                                        .where('u.firstname', 'like', '%'+search+'%')
                                        .orWhere('u.lastname', 'like', '%'+search+'%')
              var data = []
              if (friend != 0) {
                for(let index in friend){
                    if (friend[index].daa_picture != 0) {
                        const url = Env.get('APP_URL')+'/tmp/uploads/'+friend[index].id+'/profile_pic/'
                        friend[index].daa_picture = url+friend[index].daa_picture
                    }else{
                        friend[index].daa_picture = ""
                    }
                    const country = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_countries")
                                            .where("code", authUser.country)
                    if (country != 0 ) {
                        friend[index].country_name = country[0].name
                    }else{
                        friend[index].country_name = ""
                    }
                    var element = {}
                    element.id = friend[index].id
                    element.firstname = friend[index].firstname
                    element.lastname = friend[index].lastname
                    element.picture = friend[index].picture
                    element.daa_picture = friend[index].daa_picture
                    element.country_name = friend[index].country_name
                    element.is_friend = 1

                    data.push(element)
                }
            }
            return response.send({status: 200, message: "Ok", data: data})
          }
    }
}

module.exports = ContactController
