'use strict'

const Database = use('Database')
const Env = use('Env')
const DaaUserToken = use('App/Models/DaaUserToken')
const User = use('App/Models/User')
const { validate } = use('Validator')
const Helpers = use('Helpers')
// const HttpContextContract = use('@ioc:Adonis/Core/HttpContext')

class UserController {
    //Get List User
    index = async ({auth, response}) => {
        const authUser = auth.user.toJSON()
        let field = []
        //Get Fields
        const get_field = await Database.connection('db_reader').from("config_plugins").select("name", "value").where("plugin", "auth_manual")
        if (get_field != 0) {
            let exclude_fields = [
                'expiration',
                'expiration_warning',
                'expirationtime',
                'field_lock_alternatename',
                'field_lock_description',
                'field_lock_firstnamephonetic',
                'field_lock_idnumber',
                'field_lock_lang',
                'field_lock_lastnamephonetic',
                'field_lock_middlename',
                'field_lock_url',
                'version'
            ]
            for(let index in get_field){
                if (get_field.includes(exclude_fields) && get_field[index].value != "locked") {
                    column = get_field[index].name.replace('field_lock_', '')
                    if (get_field[index].value == 'unlocked' || (get_field[index].value == "unlockedifempty" )) {
                        field.push(column)
                    }
                }
            }
        }
        //Check is Supervisor
        const check_supervisor = await Database.connection('db_reader')
                                            .select("uid.*")
                                            .from("user_info_data as uid")
                                            .join("user_info_field as uif", "uid.fieldid", "uif.id")
                                            .where("uif.shortname", "superior")
                                            .where("uid.data", authUser.username)
        const total_row = check_supervisor.length
        let is_supervisor = 0
        if (total_row > 0) {
            is_supervisor = 1
        }
        //array data get list user
        let data = [{
            user: authUser,
            is_supervisor: is_supervisor,
            fields: field
        }]
        return response.send({status: 200, message: "Ok", data: data})
    }
    //User Logout
    logout = async ({auth, response, request}) => {
        //new log out
        const apiToken = auth.getAuthHeader()
        await auth
          .authenticator('api')
          .revokeTokens([apiToken])

        // delete user token
        const get_user_token = await DaaUserToken.query().where("token", apiToken).first()
        if(get_user_token){
            await get_user_token.delete()
        }
        return response.send({status: 200, message: "Ok", data: []})
    }
    //Upload Profile Picture
    upload = async ({auth, response, request}) => {
        //Declare User Id
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        //Get File and Validation File
        const profilePic = request.file('profile_pic', {
            types: ['image']
        })
        //Declare File Name
        const date = new Date()
        const date_now = date.getFullYear()+"_"+(date.getMonth()+1)+"_"+date.getDate()+"_"+date.getTime()
        let name_file = `${user_id}_${date_now}.${profilePic.subtype}`
        //Move Picture
        await profilePic.move(Helpers.tmpPath('uploads/'+user_id+'/profile_pic'), {
            name: name_file,
            overwrite: true
        })
        
        if (!profilePic.moved()) {
            return response.send({status: 400, message: "Failed to update photo profile", data: profilePic.error()})
        }else{
            const user = await User.query().where("id", user_id).first()
            user.daa_picture = name_file
            if(await user.save()){
                return response.send({status: 200, message: "Photo profile updated succesfully", data: []})
            }else{
                return response.send({status: 400, message: "Failed to update photo profile", data: profilePic.error()})
            }
        }
    }
}

module.exports = UserController
