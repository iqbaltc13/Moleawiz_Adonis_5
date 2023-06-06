'use strict'

const User = use('App/Models/User')
const BlockUser = use('App/Models/BlockUser')
const Setting = use('App/Models/Setting')
const Hash = use('Hash')
const PasswordRecovery = use('App/Models/PasswordRecovery')
const UserToken = use('App/Models/UserToken')


class LoginController {
  index = async ({ request, response, auth }, block_user) => {
    let lang = response.getHeader('X-localization')
    if (!lang) {
      lang = 'en'
    }

    const { username, password, firebase_token, brand, model, serial_number, platform, version } = request.all()
    const query = await BlockUser.findBy('firebase_token', firebase_token)
    const query_setting = await Setting.findBy('setting_name', firebase_token)
    await auth.attempt(username, password)
    let check_first_time
    let status_
    if (query) {
        const check_first_time = new Date(query.start_time)
        const status_ = query.status
    }else{
      check_first_time = new Date()
      // const diff = today.getTime() - time.getTime()
      status_ = 0
    }

    let check_curr_time = new Date()
    let diff_time = check_first_time.getTime() - check_curr_time.getTime()
    let date_time_1 = new Date(diff_time)

    let status_setting
    let time_value
    let type_value
    if (query_setting) {
      status_setting = query_setting.setting_status
      const params = json_decode(query_setting.setting_value,true)
      time_value = params.value
      type_value = params.type
    }else{
      status_setting = 0
      time_value = 0
      type_value = ""
    }
    let time
    if (type_value == "hours") {
      time = date_time_1.getHours() 
      if (lang == "en") { 
        type_value = "hours"       
      }else{
        type_value = "jam"
      }
    }else if(type_value == "minutes"){
      time = date_time_1.getMinutes()
      if (lang == "en") {
        type_value = "minutes"
      }else{
        type_value = "menit"
      }
    }else{
      time = 0
    }

    if (status_setting == 1 && time < time_value && status_ == 1) {
      this.status = 401
      this.message = ":time"+(time_value+' '+type_value)
      return this
    }else{
      let user = await User.findBy('username', username)
      if (!user) {
        if (status_setting == 1) {
          let a = this.block_user({firebase_token, lang})
          return a
        }else{
          return this
        }
      }else{
        this.username = username
      }
    }
    const user_data = await User.findBy("username", username)
    //generate api token
    const generate_token = await auth.authenticator('api').generate(user_data)
    const token = generate_token.token
    let ifHasRecoverPass = await PasswordRecovery.query().where('user_id', user_data.id).where('new_password', password).where('expired_time', '>', new Date()).first()

    if (ifHasRecoverPass) {

      let date_now = new Date().getTime()
      const user_token = new UserToken()
      user_token.user_id = user_data.id
      user_token.token = token
      user_token.brand = brand
      user_token.created_at = date_now
      user_token.firebase_token = firebase_token
      user_token.model = model
      user_token.serial_number = serial_number
      user_token.platform = platform
      user_token.version = version
      user_token.updated_at = date_now

      let last_login = 1
      let data
      let status_response2
      let message2
      if (await user_token.save()) {
        if (user_data.firstaccess==0) {
            user_model.firstaccess = new Date()
        }
            const user_model = await User.findBy('username', username)
            user_model.lastlogin = user_data.currentlogin
            user_model.currentlogin = new Date().getTime()
            await user_model.save()

          data = {
            user: user_token,
            is_recover_pass: 1,
            firstname: user_data.firstname,
            lastname: user_data.lastname,
            email: user_data.email,
            username: user_data.username,
            last_login: last_login
          }
      }else{
        status_response2 = 500
        message2 = "Database Error!"
      }

      return response.send({status: status_response2, message: message2, data: data})
    }
    
    //check password
    let status_response1
    let message1
    if (!await Hash.verify(password, user_data.password)) {
      if (status_setting == 1) {
        let a = this.block_user({firebase_token, lang})
        return a
      }else{
        status_response1 = 401
        message1 = ":time"+(time_value+' '+type_value)
        return response.send({status: status_response1, message: message1})
      }
    }
    //check inactive
    let test
    let status_response
    let message
    if (user_data && await Hash.verify(password, user_data.password)) {
      let check_active = await User.query().where('username', username).where('deleted', 0).first()
      if (!check_active) {
        status_response = 401
        message = "User Inactive"
        return response.send({status: status_response, message: message})
      }
    }

    let date_now = new Date().getTime()
      const user_token = new UserToken()
      user_token.user_id = user_data.id
      user_token.token = token
      user_token.brand = brand
      user_token.created_at = date_now
      user_token.firebase_token = firebase_token
      user_token.model = model
      user_token.serial_number = serial_number
      user_token.platform = platform
      user_token.version = version
      user_token.updated_at = date_now

      let last_login = 1
      let data2
      let status_response3
      let message3
      if (await user_token.save()) {
        const user_model = await User.findBy('username', username)
        if (user_data.firstaccess==0) {
          user_model.firstaccess = new Date()
        }
            user_model.lastlogin = user_data.currentlogin
            user_model.currentlogin = new Date().getTime()
            await user_model.save()

          data2 = {
            user: user_token,
            is_recover_pass: 1,
            firstname: user_data.firstname,
            lastname: user_data.lastname,
            email: user_data.email,
            username: user_data.username,
            last_login: last_login
          }
      }else{
        status_response3 = 500
        message3 = "Database Error!"
      }
      if (query) {
        query.delete()
      }

    return response.send({status: 200, message: "Ok", data: data2})
  }

  block_user = async ({firebase_token, lang}) => {
    
    const block_user = new BlockUser()

    const result = await BlockUser.findBy('firebase_token', firebase_token)

    const setting = await Setting.query().where('setting_name', 'setting_user_login').where('setting_status', 1).first()

    const params = json_decode(query_setting.setting_value,true)
    
    const setting_attempt = params.attempt
    const setting_type = params.type
    const setting_value = params.value

    let start_time = new Date()
    let flag
    let status_block
    if (!result) {
      flag = 1
      status_block = 0

      block_user.firebase_token = firebase_token
      block_user.start_time = start_time
      block_user.attempt = flag
      block_user.status = status_block
      await block_user.save()
    }else{
      const last_attempt = result.attempt
      flag = last_attempt + 1
      result.attempt = flag
      await result.save()
    }

    let current_date = new Date()
    let first_time
    if (!result) {
      first_time = start_time
      const attempt = flag
    }else{
      first_time = new Date(result.start_time)
      const attempt = result.attempt
    }

    let diff_time = first_time.getTime() - current_date.getTime()
    let date_time_1 = new Date(diff_time)
    if (type_value == "hours") {
      time = date_time_1.getHours()
      if (lang == "en") { 
        type_value = "hours"       
      }else{
        type_value = "jam"
      }
    }else if(type_value == "minutes"){
      time = date_time_1.getMinutes()
      if (lang == "en") {
        type_value = "minutes"
      }else{
        type_value = "menit"
      }
    }

    let minutes = date_time_1.getMinutes()
    let status
    let message
    if (attempt > setting_attempt && minutes < 5 && time < setting_value) {
      if (attempt == setting_attempt + 1) {
        status_block = 1
        result.start_time = current_date
        result.status = status_block
        await result.save()
      }
      status = 401
      message = "time"+(setting_value+""+setting_type)+"Whoops! Too many failed login attempts. Please try again in: "+minutes
    }else if(time > setting_value){
      status_block = 0
      result.firebase_token = firebase_token
      result.start_time = start_time
      result.attempt = 1 
      result.status = status_block
      await result.save()

      status = 401
      message = "time"+(setting_value+""+setting_type)+"Invalid login credentials. Please try again."
    }else{
      status = 401
      message = "time"+(setting_value+""+setting_type)+"Invalid login credentials. Please try again."
    }



  }
}

module.exports = LoginController
