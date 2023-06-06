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

class SettingUserAccessController {
  async setClearUserAccessForm({auth,request, response, view, params, session}){

    const authUser = auth.user.toJSON()
    let data       = await DaaSetting.query().where('setting_name','setting_clear_useraccess').first();

    return view.render('settings.set_clear_user_access',{authUser : authUser , data:data  });
  }
  async setClearUserAccess({auth,request, response, view, params, session}){


    let data = await DaaSetting.updateOrCreate(
      {
        setting_name: 'setting_clear_useraccess',

      },
      {
        setting_value : request.input('range_day') ? request.input('range_day') : 0,
        setting_status : request.input('setting_status') ? request.input('setting_status') : 0,
        update_by :  auth.user.id
      }

    );
    console.log(data);


    session.flash({ notification: 'Success change serting clear user access !' });
    return response.route('setting.set-clear-user-access-form')
  }
}

module.exports = SettingUserAccessController
