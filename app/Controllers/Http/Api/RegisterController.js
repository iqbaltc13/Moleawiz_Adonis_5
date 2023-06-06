'use strict'

const Database = use('Database')
const Env = use('Env')
const { validate } = use('Validator')
const User = use('App/Models/User')
const DaaUserVerification = use('App/Models/DaaUserVerification')
const DaaUserToken = use('App/Models/UserToken')
const Hash = use('Hash')
const querystring = use('querystring');
const { curly } = use('node-libcurl');

class RegisterController {
    //Register User
    index = async ({auth, request, response}) => {
        //Declare Variable Request
        const { username, phone, firstname, lastname, email, password, app_type } = request.all()
        //validation rules
        const rules = {
            username: 'required',
            phone: 'required|number|min:9|max:13',
            firstname: 'required',
            lastname: 'required',
            email: "email"
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            //Response Validation Failed
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            // username was exists
            const user = await User.findBy('username', username)
            if(user){
                //Response User Exist
                return response.send({status: 401, message: "Username was exist, please try with another username", data: []})
            }else{
                //Query Check Phone Number
                const user = await User.findBy('phone2', phone)
                if(user){
                    //Response Phone Exist
                    return response.send({status: 401, message: "Phone number was exist, please try with another phone number", data: []})
                }else{
                    //Store User Token
                    const user_data = new User()
                    user_data.auth = 'manual'
                    user_data.confirmed = 0
                    user_data.policyagreed = 0
                    user_data.deleted = 0
                    user_data.suspended = 0
                    user_data.mnethostid = 1
                    user_data.username = username
                    user_data.password = ''
                    user_data.firstname = firstname
                    user_data.lastname = lastname
                    user_data.email = email
                    user_data.emailstop = 1
                    user_data.phone2 = phone
                    user_data.country = 'ID'
                    user_data.lang = 'en'
                    user_data.timezone = 'Asia/Jakarta'
                    user_data.firstaccess = 0
                    user_data.lastaccess = 0
                    user_data.lastlogin = 0
                    user_data.currentlogin = 0
                    user_data.lastip = 0
                    user_data.picture = 0
                    user_data.descriptionformat = 1
                    user_data.mailformat = 1
                    user_data.maildigest = 1
                    user_data.maildisplay = 2
                    user_data.autosubscribe = 1
                    user_data.trackforums = 0
                    user_data.timecreated = new Date().getTime()
                    user_data.timemodified = 0
                    user_data.trustbitmask = 0
                    if(await user_data.save()){
			            //Update Password			
                        const update_user = await User.findBy('id', user_data.id)
                        if(update_user){
                            update_user.password = user_data.id+" "+new Date().getTime()
                            update_user.timemodified = new Date().getTime()
                            await update_user.save()
                        }
            			// generate verification data
                        let code = Math.floor(100000 + Math.random() * 900000);
                        var thirtyMinutesLater = new Date();
                        thirtyMinutesLater.setMinutes(thirtyMinutesLater.getMinutes() + 30)
                        const verification = new DaaUserVerification()
                        verification.user_id 		= user_data.id;
                        verification.code			= code
                        verification.app_type 	    = app_type;
                        verification.expired_time   = thirtyMinutesLater
                        await verification.save()
                        //send SMS
                        let msgku = "From Moleawiz, Thank you for your registration. This is your Moleawiz code: "+code+". Active until 30 minutes. Thank You"
                        await this.sendSMS({phone, msgku})
            			// response
                        return response.send({status: 200, message: "Succesfully register your account", data: [{
                            is_verified: 0,
                            user_id: user_data.id
                        }]})
                    }else{
                        return response.send({status: 500, message: "Fail register your account", data: []})
                    }
                }
            }
        }
    }
    //Cancel Registration User
    cancel = async ({auth, request, response}) => {
        //Declare Variable Request
        const { user_id } = request.all()
        //validation rules
        const rules = {
            user_id: 'required|number'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            //Response Validation Failed
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
		    //Query Check User
            const user = await User.query().where('id', user_id).where('confirmed', 0).first()
            if(user){
        		//Query Check Verification User
                const user_verification = await DaaUserVerification.query().where("user_id", user_id).where("is_verified", 0).first()
                if(user_verification){
            		// Delete User and Verification User 
                    if(await user.delete()){
                        await user_verification.delete()
                        //Response Success
                        return response.send({status: 200, message: "Succesfully cancel your registration!", data: []})
                    }else{
                        //Response Failed Delete Query
                        return response.send({status: 401, message: "Fail to cancel your registration!", data: []})
                    }
                }else{
                    //Response Failed Check User Verification
                    return response.send({status: 401, message: "User data not found!", data: []})
                }
            }else{
                //Response Failed Check User
                return response.send({status: 401, message: "User data not found!", data: []})
            }
        }
    }
    //Verification User Register 
    verify = async ({auth, request, response}) => {
        //Declare Variable Request
        const { user_id, code, firebase_token, brand, model, serial_number, platform, version } = request.all()
        //validation rules
        const rules = {
            user_id: 'required|number',
            code: 'required|number'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            //Response Validation Failed
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
		    //Query Check User
            const user = await User.query().where('id', user_id).where('confirmed', 0).first()
            if(user){
        		//Query Check Verification User
                const user_verification = await DaaUserVerification.query().where("user_id", user_id).where("code", code).where("is_verified", 0).first()
                if(user_verification){
                    let token = await Hash.make(user_id+new Date())
                    user.confirmed = 1
                    user.timemodified = new Date().getTime()
                    if(await user.save()){
        			    // update verification
                        user_verification.is_verified = 1
                        user_verification.updated_at = new Date()
                        user_verification.save()

            			// create user token for login
                        const user_token = new DaaUserToken()
                        user_token.user_id = user_id
                        user_token.token = token
                        user_token.firebase_token = firebase_token
                        user_token.brand = brand
                        user_token.model = model
                        user_token.serial_number = serial_number
                        user_token.platform = platform
                        user_token.version = version
                        user_token.created_at = new Date().getTime()
                        user_token.updated_at = new Date().getTime()
                        if(await user_token.save()){
                            user.lastlogin = user.currentlogin
                            user.currentlogin = new Date().getTime()
                            await user.save()
                            let data = [{
                                user: user_token,
                                is_recover_pass: 0,
                                is_verified: 1,
                                firstname: user.firstname,
                                lastname: user.lastname,
                                email: user.email
                            }]
                            return response.send({status: 200, message: "Ok", data: data})
                        }else{
                            return response.send({status: 500, message: "Database Error!", data: []})
                        }
                    }else{
                        //Response Failed Update User
                        return response.send({status: 401, message: "verify registration fail", data: []})
                    }
                }else{
                    //Response Failed Check User Verification
                    return response.send({status: 401, message: "User data not found!", data: []})
                }
            }else{
                //Response Failed Check User
                return response.send({status: 401, message: "User data not found!", data: []})
            }
        }
    }
    sendSMS = async ({phone, msgku})=>{
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
}

module.exports = RegisterController
