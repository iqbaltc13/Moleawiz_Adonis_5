'use strict'

const Database = use('Database')
const Env = use('Env')
const { validate } = use('Validator')
const Hash = use('Hash')
const User = use('App/Models/User')
const PasswordRecovery = use('App/Models/PasswordRecovery')
const { validateAll } = use('Validator')

class PasswordRecoveryController {
    //change temporary password
    change_temp_password = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        //add request into value
        const { password, password_confirmation } = request.all()
        //set rules validation
        const rules = {
            password: 'required',
            password_confirmation: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            // update password
            let new_password = await Hash.make(password)
            const user = await User.findBy("id", user_id)
            user.password = new_password
            if(await user.save()){
                // delete temp password
                const temp_pass = await PasswordRecovery.query().where("user_id", user_id).first()
                await temp_pass.delete()
                return response.send({status: 200, message: "You have successfully changed your password!", data: []})
            }else{
                return response.send({status: 500, message: "Database Error!", data: []})
            }
        }
    }
    

    /*
    * method ini berguna untuk persiapan mengirim user_pass_recovery ke learner.
    * apakah learner terkait layak di kirimkan user_pass_recovery?
    * 
    * alurnya
    * mengecek apakah username ada (dg status deleted=0, suspended=0) di DB?
    * kemudian cek apakah username posisinya sudah mendapatkan password (aktif 30 mnt)?
    */
    checkUsername = async ({request, response})=>{
        const database = use('Database')
        let status = 0;
        let message = "";
        let phone_available =0;
        let phone_number=0;
        let email_available=0;
        let email_account="";
        const datas = []; // array
        let data,datasku,datasku2 
        
        const rules = {
            username: 'required'
        }
        
        const validation = await validate(request.all(), rules) 
        
        if (validation.fails()) 
        {
            datasku = validation.messages()
            datas[0]=datasku[0].message;    
            
            status = 400
            message = "Validation Fails!"

            const data2= {
                'username': datas
            }
            data = data2

        }  
        else
        {
            // data = "Validation passed"
            let username = request.body.username
            datasku = await Database.connection('db_reader').select("*")
                                    .from("user")
                                    .where({ username: username, deleted:0, suspended:0 })
                                    .first()
            
            if(datasku)
            {        
                // data = "user exist"        
                var today = new Date();
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var dateTime = date+' '+time;
                datasku2 = await Database.connection('db_reader').select("*")
                                        .from("daa_user_pass_recovery")
                                        .where('user_id', datasku.id)
                                        .where('expired_time', '>', dateTime)
                                        .first()
                
                if(datasku2)
                {
                    // data = "user still active"  
                    status = 401
                    message = "You have requested a new password and still active until 30 minutes!"
                    data=[]
                }                         
                else
                {
                    // data = "user not still active"  

                    if(datasku.phone2=='' || datasku.phone2==null)
                    {
                        phone_available = 0;
                        phone_number = 0;
                    }     
                    else
                    {
                        phone_available = 1;
                        phone_number = datasku.phone2;
                    }

                    if(datasku.email == '' || datasku.email == null){
                        email_available = 0;
                        email_account = "";
                    }
                    else
                    {
                        email_available = 1;
                        email_account = datasku.email;
                    }

                    status = 200
                    message = "Ok"
                    
                    const data2= {
                        'username': username,
                        'phone_available':phone_available,
                        'phone_number': phone_number,
                        'email_available':email_available,
                        'email_account'	:email_account
                    }

                    data=data2
                }                   
            }
            else
            {
                // data='no user'
                status = 401
                message = "User Not Found"
                data=[]
            }
            
        }  

        return response.send({status: status, message: message, data: data})  
    }

    /*
    * method ini berguna untuk mengirimkan password baru (perbaikan) melalui sms
    * parameternya adalah username, phone_number
    *
    * untuk menjalankan feature ini, kita diharuskan install node-libcurl 
    * https://www.npmjs.com/package/node-libcurl
    */
    smsRecovery = async ({request, response})=>{
        const database = use('Database')
        const rules = {
            username: 'required',
            phone_number: 'required'
        }

        const messages = {
            'username.required': 'The username field is required.',
            'phone_number.required': 'The phone number field is required.'
        } 
        let status = 0;
        let message = "";
        let username, phone
        const datas = []; // array
        const datas2 = []; // array
        let data,datasku,datasku2
       
        const validation = await validateAll(request.all(), rules, messages) 
        
        if (validation.fails()) 
        {
            datasku = validation.messages()
            datas[0] = datasku[0].message
            datas2[0] = datasku[1].message
           
            status = 400
            message = "Validation Fails!"
                       
            const data2= {
                'username': datas,
                'phone_number': datas2
            }
            data = data2
        } 
        else
        {
            username = request.body.username;
		    phone = request.body.phone_number;
            datasku = await Database.connection('db_reader').select("*")
                                    .from("user")
                                    .where({ username: username, deleted:0, suspended:0 })
                                    .first()
            if(datasku)
            {
                datasku2 = await Database.connection('db_reader').select("*")
                                         .from("daa_user_pass_recovery")
                                         .where({ user_id: datasku.id })
                                         .first()

                var dt = new Date();
                var dt2 = dt.getTime()+ (30*60000)
                var today = new Date(dt2);
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var dateTime = date+' '+time;
                
                var today2 = new Date();
                var date2 = today2.getFullYear()+'-'+(today2.getMonth()+1)+'-'+today2.getDate();
                var time2 = today2.getHours() + ":" + today2.getMinutes() + ":" + today2.getSeconds();
                var updated_at = date2+' '+time2;

                let new_password = this.randomPassword 
                let msgku = "From CIMB Niaga LoG, Your new password : "+new_password+". Active until 30 minutes. Thank You"
                if(datasku2)
                {
                    // update
                    const affectedRows = await Database.connection('db_writer')
                                                .table('daa_user_pass_recovery')
                                                .where('user_id', datasku.id)
                                                .update({ new_password: new_password, 
                                                           expired_time: dateTime, 
                                                           updated_at: updated_at })
                    
                   
                    if (affectedRows) 
                    {
                        // send sms
                        await this.sendSMS({phone, msgku})
                        // send sms
                        status = 200
                        message = "New password was sent via SMS to your phone number."
                        data = []
                    }
                    else
                    {
                        status = 401
                        message = "pass_recovery_fail"
                        data =[]
                    }
                       
                }   
                else
                {
                    // insert
                    const passwordRecovery = new PasswordRecovery()
                    passwordRecovery.user_id = datasku.id
                    passwordRecovery.new_password = new_password
                    passwordRecovery.expired_time = dateTime
                    if (await passwordRecovery.save()) 
                    {
                        // send sms
                        await this.sendSMS({phone, msgku})
                        // send sms
                        status = 200
                        message = "New password was sent via SMS to your phone number."
                        data =[]
                    }
                    else
                    {
                        status = 401
                        message = "pass_recovery_fail"
                        data =[]
                    }
                }                      
            }   
        }

        return response.send({status: status, message: message, data: data})  
    }    

    /*
    * method ini berguna untuk mengirimkan password baru (perbaikan) melalui email
    * parameternya adalah username, email_account
    *
    * untuk menjalankan feature ini, kita diharuskan install @adonisjs/mail
    * https://legacy.adonisjs.com/docs/4.1/mail
    */
    emailRecovery = async ({request, response})=>{
        const database = use('Database')
        const rules = {
            username: 'required',
            email_account: 'required'
        }

        const messages = {
            'username.required': 'The username field is required.',
            'email_account.required': 'The email field is required.'
        } 
        let status = 0;
        let message = "";
        let username, email
        const datas = []; // array
        const datas2 = []; // array
        let data,datasku,datasku2
       
        const validation = await validateAll(request.all(), rules, messages) 
        
        if (validation.fails()) 
        {
            datasku = validation.messages()
            datas[0] = datasku[0].message
            datas2[0] = datasku[1].message
           
            status = 400
            message = "Validation Fails!"
                       
            const data2= {
                'username': datas,
                'email': datas2
            }
            data = data2
        } 
        else
        {
            username = request.body.username;
		    email = request.body.email_account;
            datasku = await Database.connection('db_reader').select("*")
                                    .from("user")
                                    .where({ username: username, deleted:0, suspended:0 })
                                    .first()
            if(datasku)
            {
                datasku2 = await Database.connection('db_reader').select("*")
                                         .from("daa_user_pass_recovery")
                                         .where({ user_id: datasku.id })
                                         .first()

                var dt = new Date();
                var dt2 = dt.getTime()+ (30*60000)
                var today = new Date(dt2);
                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var dateTime = date+' '+time;
                let new_password = this.randomPassword 

                var today2 = new Date();
                var date2 = today2.getFullYear()+'-'+(today2.getMonth()+1)+'-'+today2.getDate();
                var time2 = today2.getHours() + ":" + today2.getMinutes() + ":" + today2.getSeconds();
                var updated_at = date2+' '+time2;
                if(datasku2)
                {
                    // update
                    const affectedRows = await Database.connection('db_writer')
                                                .table('daa_user_pass_recovery')
                                                .where('user_id', datasku.id)
                                                .update({ new_password: new_password, 
                                                           expired_time: dateTime, 
                                                           updated_at: updated_at })
                    
                   
                    if (affectedRows) 
                    {
                        // send email
                        await this.sendEmail({email, new_password})
                        // send email
                        status = 200
                        message = "New password was sent to your email."
                        data =[]
                    }
                    else
                    {
                        status = 401
                        message = "pass_recovery_fail"
                        data =[]
                    }
                       
                }   
                else
                {
                    // insert
                    const passwordRecovery = new PasswordRecovery()
                    passwordRecovery.user_id = datasku.id
                    passwordRecovery.new_password = new_password
                    passwordRecovery.expired_time = dateTime
                    if (await passwordRecovery.save()) 
                    {
                        // send email
                        await this.sendEmail({email, new_password})
                        // send email
                        status = 200
                        message = "New password was sent to your email."
                        data =[]
                    }
                    else
                    {
                        status = 401
                        message = "pass_recovery_fail"
                        data =[]
                    }
                }                      
            }   
        }

        return response.send({status: status, message: message, data: data})  
    }  

    /*
    * berguna untuk generate random password
    */
    get randomPassword(){
        var maxLength=8
        
        var text = "";
        var shuffle = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        
        if(maxLength!==''){
            for( var i=0; i < maxLength; i++ ){
                text += shuffle.charAt(Math.floor(Math.random() * shuffle.length));
            }
            
        }
        
        return text
    }

    /*
    * method ini berguna untuk proses kirim random password menggunakan SMS
    * method ini di call di dalam method smsRecovery
    */
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

    /*
    * method ini berguna untuk proses kirim random password menggunakan email
    * method ini di call di dalam method emailRecovery
    */
    sendEmail = async ({email, new_password})=>{
        const Mail = use('Mail')

        var balikan="Awal";
        var team = "LoG Team";
        var from_address = 'log@digimasia.com';
        var subject = "Password Recovery LoG";
        // var urlImage = Env.get('BASE_URL')+'/uploads/assets/images/logoutama.png';
        var urlImage = "https://app-staging.digimasia.com/api/public/assets/logoutama.png"
        await Mail.send('emails.emailRecovery', { team, new_password, urlImage}, (message) => {
            // message.embed(urlImage)
            message.subject(subject)
            message.from(from_address, team)
            message.to(email)
            
        })  
        
        balikan="successfully";
        
        return balikan
        
    }
}
module.exports = PasswordRecoveryController
