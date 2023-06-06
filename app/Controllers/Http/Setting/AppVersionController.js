'use strict'

const DaaAppVersion                = use('App/Models/DaaAppVersion')
const Route                        = use('Route')
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const UploadHelper                 = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                      = use('Helpers')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')
const Database                     = use('Database')
const ImportService                = use('App/Services/ImportService')


class AppVersionController {
    async index({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    const datas    = await DaaAppVersion.query()

                     .whereNull('deleted_at')
                     .fetch();


    return view.render('settings.app_version.index',{ authUser : authUser,  datas : datas.rows})


  }

  async datatable({auth,request, response, view, params, session}){
    let datas =  await DaaAppVersion.query()

                 .whereNull('deleted_at')
                 .fetch();

    var result = Object.keys(datas).map((key) => [Number(key), datas[key]]);
    let valueDatatable = {
      draw            : 0,
      recordsTotal    : result[0][1].length,
      recordsFiltered : 10,
      data            : result[0][1]
    };


    // return JSON.stringify(valueDatatable);
    return valueDatatable;
  }
  async edit({auth,request, response, view, params, session}){
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await DaaAppVersion.find(id);
    return view.render('settings.app_version.edit',{authUser : authUser,data:data});
  }
  async update({auth,request, response, view, params, session}){
    const rules             = {
      //name: 'required',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }
    let id         = params.id;
    const data     = await DaaAppVersion.find(id);

    data.version_code      = request.input('version_code');
    data.version_name      = request.input('version_name');

    data.is_force          = request.input('is_force')== 1 || request.input('is_force')== '1' ? 1 : 0;

    data.save();
    session.flash({ notification: 'Success update App Version '+data.type+'!' });
    return response.route('setting.app-version.index')
  }
  async create({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    return view.render('settings.app_version.create',{authUser : authUser});
  }
  async store({auth,request, response, view, params, session}){

    const rules             = {
      type: 'required|unique:daa_app_version,type',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }

    const data = new DaaAppVersion();

    data.type              = request.input('type');
    data.version_code      = request.input('version_code');
    data.version_name      = request.input('version_name');

    data.is_force          = request.input('is_force')== 1 || request.input('is_force')== '1' ? 1 : 0;

    data.save();
    session.flash({ notification: 'Success create App Version ' +data.type+ '!' });
    return response.route('setting.app-version.index')
  }

  async delete({auth,request, response, view, params, session}){
    session.flash({ notification: '!' });
    return response.route('index')
  }
  async softDelete({auth,request, response, view, params, session}){
    const id          = params.id;
    const data        = await DaaAppVersion.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete '+data.type+'!' });
    return response.route('setting.app-version.index')

  }
}

module.exports = AppVersionController
