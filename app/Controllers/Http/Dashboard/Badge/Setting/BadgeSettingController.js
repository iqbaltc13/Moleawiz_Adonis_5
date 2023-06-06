'use strict'

const Route                        = use('Route')
const DaaBadge                     = use('App/Models/DaaBadge')
const DaaBadgeUser                 = use('App/Models/DaaBadgeUser')
const DaaBadgeSetting              = use('App/Models/DaaBadgeSetting')
const User                         = use('App/Models/User')
const Cohort                       = use('App/Models/Cohort')
const CohortMember                 = use('App/Models/CohortMember')
const Course                       = use('App/Models/Course')
const CourseModule                 = use('App/Models/CourseModule')
const CourseModuleCompletion       = use('App/Models/CourseModuleCompletion')
const DaaContentLibrary            = use('App/Models/DaaContentLibrary')
const DaaContentLibraryModule      = use('App/Models/DaaContentLibraryModule')
const DaaCourse                    = use('App/Models/DaaCourse')
const DaaCourseLog                 = use('App/Models/DaaCourseLog')
const DaaCourseModule              = use('App/Models/DaaCourseModule')
const DaaJourney                   = use('App/Models/DaaJourney')
const DaaJourneyCohortEnrol        = use('App/Models/DaaJourneyCohortEnrol')
const DaaModuleLog                 = use('App/Models/DaaModuleLog')
const DaaUserAccessDaily           = use('App/Models/DaaUserAccessDaily')
const DaaUserPoint                 = use('App/Models/DaaUserPoint')
const Scorm                        = use('App/Models/Scorm')
const Session                      = use('App/Models/Session')
const UserInfoDatum                = use('App/Models/UserInfoDatum')
const Helpers                      = use('Helpers')
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const Database                     = use('Database')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')


class BadgeSettingController {
   constructor() {

       this.master_data_helper = new MasterDataHelper();


  }

  index = async ({auth,request, response, view, params, session}) => {

    let id         = params.id;
    const authUser = auth.user.toJSON()

    const datas        = await DaaBadgeSetting.query()
                         .with('badge')
                         .whereNull('deleted_at')
                         .where('daa_badge_id', id)
                         .fetch();

    //console.log(datas.rows[0].modules[0]);
    const badge   = await DaaBadge.query().where('id',id).first() ;

    return view.render('dashboard.badge.setting.index',{ authUser : authUser,  datas : datas.rows,badge : badge})
  }

  datatable = async ({auth,request, response, view, params, session}) => {
    let id          = params.id;

    const datas     = await DaaBadgeSetting.query()
                      .with('badge')
                      .whereNull('deleted_at')
                      .where('daa_badge_id', id)
                      .fetch();

    var result = Object.keys(datas).map((key) => [Number(key), datas[key]]);
    let valueDatatable = {
      draw            : 0,
      recordsTotal    : result[0][1].length,
      recordsFiltered : 10,
      data            : result[0][1]
    };



    return valueDatatable;
  }

  edit = async ({auth,request, response, view, params, session})=>{
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await DaaBadgeSetting.query()
                    .with('badge')
                    .whereNull('deleted_at')
                    .where('id', id)
                    .first();
    const modules  =  await Course.query().whereNull('deleted_at').fetch();
    return view.render('dashboard.badge.setting.edit',{authUser : authUser,data: data, modules: modules.rows});
  }
  detail = async ({auth,request, response, view, params, session}) => {
    const authUser = auth.user.toJSON()
    let id         = params.id;
    const data     = await DaaBadgeSetting.query()
                    .with('badge')
                    .whereNull('deleted_at')
                    .where('id', id)
                    .first();

    return view.render('dashboard.badge.setting.detail',{authUser : authUser,data: data});
  }
  update = async ({auth,request, response, view, params, session}) => {
    const rules             = {
      setting_name: 'required',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }
    let id         = params.id;
    const data     = await DaaBadgeSetting.find(id);

    data.setting_name  = request.input('setting_name');
    data.setting_value = request.input('setting_value');
    //data.note          = request.input('note');
    //data.status        = request.input('status');



    data.status        = request.input('status')== 1 || request.input('status')== '1' ? 1 : 0;

    data.save();
    session.flash({ notification: 'Success update Badge Setting '+data.setting_name+'!' });
    return response.route('dashboard.badge.setting.index',{id: data.daa_badge_id})
  }
  switchVisible = async ({request, response, view, params, session}) => {
    const id        = params.id;
    const data      = await DaaBadgeSetting.find(id);

    if(data.status == 1){
      data.status = 0;
      session.flash({ notification: 'Successfully switch to hide '+data.setting_name +' !' });
    }
    else{
      data.status = 1;
      session.flash({ notification: 'Successfully switch to show '+data.setting_name +' !' });
    }

    await data.save();


    return response.route('dashboard.badge.setting.index',{id: data.daa_badge_id})
   }
   create = async ({ auth, request, response, view, params, session }) => {
    let id         = params.daa_badge_id;
    const badge   = await DaaBadge.query().where('id',id).first() ;
    const authUser = auth.user.toJSON()
    return view.render('dashboard.badge.setting.create',{authUser : authUser, badge : badge});
  }
  store = async ({auth,request, response, view, params, session}) => {
    let daaBadgeId        = request.input('daa_badge_id');
    const rules             = {
      setting_name: 'required',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }

    const data = new DaaBadgeSetting();


    data.daa_badge_id  = request.input('daa_badge_id');
    data.setting_name  = request.input('setting_name');
    data.setting_value = request.input('setting_value');
    //data.note          = request.input('note');

    data.status         = request.input('status');

    data.save();
    session.flash({ notification: 'Success create Badge Setting ' +data.setting_name+ '!' });
    return response.route('dashboard.badge.setting.index',{id: request.input('daa_badge_id')})
  }

  delete = async ({auth,request, response, view, params, session}) => {
    session.flash({ notification: '!' });
    return response.route('index')
  }
  softDelete = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaBadgeSetting.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete '+data.name+'!' });
    return response.route('dashboard.badge.setting.index',{id: data.daa_badge_id})

  }

}

module.exports = BadgeSettingController
