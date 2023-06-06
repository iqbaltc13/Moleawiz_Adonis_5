'use strict'


const DaaSetting                   = use('App/Models/DaaSetting')
const Route                        = use('Route')
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const UploadHelper                 = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                      = use('Helpers')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')
const Database                     = use('Database')
const ImportService                = use('App/Services/ImportService')

class SettingUserLoginController {

  async setUserLoginForm({auth,request, response, view, params, session}){

    const authUser = auth.user.toJSON()
    let data       = await DaaSetting.query().where('setting_name','setting_user_login').first();
    let dataDaaSetting = {};
    if(data){
      if(data.setting_value){
        dataDaaSetting = JSON.parse(data.setting_value);
      }
    }
    console.log(dataDaaSetting);
    return view.render('settings.set_user_login',{authUser : authUser ,status:data.setting_status, data:dataDaaSetting  });
  }
  async setUserLogin({auth,request, response, view, params, session}){
    let jsonValue  = {
      attempt: request.input('attempt') ? request.input('attempt') : '',
      type: request.input('type') ? request.input('type') : '',
      value: request.input('value') ? request.input('value') : ''
    };

    let data = await DaaSetting.updateOrCreate(
      {
        setting_name: 'setting_user_login',

      },
      {
        setting_value : JSON.stringify(jsonValue),
        setting_status : request.input('setting_status') ? request.input('setting_status') : 0,
        update_by :  auth.user.id
      }

    );
    console.log(data);


    session.flash({ notification: 'Success change setting user login !' });
    return response.route('setting.set-user-login-form')
  }
}

module.exports = SettingUserLoginController
