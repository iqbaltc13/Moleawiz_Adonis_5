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
const TextHelper                   = use('App/Controllers/Http/Helper/TextController')
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const Database                     = use('Database')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')

class BadgeController {
  constructor() {

    this.master_data_helper = new MasterDataHelper();
    this.text_helper = new TextHelper();

  }

  index = async ({ auth, request, response, view, params, session })=> {

    let requestParams = {};
    const authUser = auth.user.toJSON()
    let datas = DaaBadge.query()
                    .with('journey')
                    .with('course')
                    .with('module')
                    .with('settings')
                    .with('recipients')

                    .whereNull('deleted_at');

                    datas = await datas.fetch();
    for (let index in datas.rows) {
      datas.rows[index].description_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].note.substring(0,249), 5)
      datas.rows[index].name_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].name.substring(0,50), 3)
    }


    return view.render('dashboard.badge.index',{ authUser : authUser,  datas : datas.rows })


  }

  datatable = async ({auth,request, response, view, params, session})=>{
    let datas = await DaaBadge.query()
      .with('journey')
      .with('course')
      .with('module')
      .with('settings')
      .with('recipients')

      .whereNull('deleted_at');

      datas = await datas.fetch();

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
    let id           = params.id;
    const authUser   = auth.user.toJSON()
    let dataJourneys = await DaaJourney
                       .query()
                       .whereNull('deleted_at')
                       .fetch();
    const data       = await DaaBadge
                      .query()
                      .with('journey')
                      .with('course')
                      .with('module')
                      .with('module.course_module')
                      .with('module.course_module.course')
                      .with('module.course_module.course.journey')
                      .with('settings')
                      .with('recipients')

                      .where('id',id)
                      .first();
    let dataCourses  = null;
    if (data.daa_journey_id) {
      if (data.daa_journey_id == "0" || data.daa_journey_id == 0) {
          dataCourses      = await DaaCourse
                         .query()
                         .where('journey_id',data.daa_journey_id)
                         .whereNull('deleted_at')
                         .fetch();
      }
    }


    let dataModules = null;
    if (data.daa_course_id) {
      if (data.daa_course_id == "0" || data.daa_course_id == 0) {
        dataModules = await DaaCourseModule
                     .query()
                     .with('module')
                     .where('course_id',data.daa_course_id)
                     .whereNull('deleted_at')
                     .fetch();

      }

    }

    return view.render('dashboard.badge.edit',{authUser : authUser,data:data , dataJourneys : dataJourneys , dataCourses : dataCourses , dataModules : dataModules});
  }
  update = async ({auth,request, response, view, params, session})=>{
    const rules             = {
      name: 'required',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }
    let id         = params.id;
    const data     = await DaaBadge.find(id);
    let image = "";
    if(request.file('logo_pic')){
      const logoPic = request.file('logo_pic', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      image = new Date().getTime()+'.'+logoPic.subtype
      await logoPic.move(Helpers.publicPath('uploads/assets/images'),{
        name: image
      })
      if(!logoPic.moved()){
        session.withErrors([{ notification: 'Upload file logo Error !' , field:'logo_pic', message: logoPic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
      data.logo        = image;
    }


    data.name                   = request.input('name');
    data.daa_journey_id         = request.input('daa_journey_id');
    data.daa_course_id          = request.input('daa_course_id') ? request.input('daa_course_id') : null;
    data.module_id              = request.input('module_id') ? request.input('module_id').split('_')[2] : null;
    if (request.input('daa_journey_id') != "0" && request.input('daa_journey_id') != null) {
      data.badgetype = 1;
    }
    if (request.input('course_id') != "0" && request.input('course_id') != null) {
      data.badgetype = 2;
    }
    if (request.input('module_id') != "0" && request.input('module_id') != null ) {
      data.badgetype = 3;
    }

    data.point                  = request.input('point');
    data.note                   = request.input('note');
    data.visible                = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;
    data.save();
    session.flash({ notification: 'Success update Badge '+data.name+'!' });


    return response.route('dashboard.badge.index')

  }
  create = async ({ auth, request, response, view, params, session }) => {

    let dataJourneys = await DaaJourney
                       .query()
                       .whereNull('deleted_at')
                       .fetch();

    const authUser = auth.user.toJSON()
    return view.render('dashboard.badge.create',{authUser : authUser , dataJourneys : dataJourneys});
  }
  store = async ({auth,request, response, view, params, session})=>{

    const rules             = {
      name: 'required',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }

    const data = new DaaBadge();

    let image = "";
    if(request.file('logo_pic')){
      const logoPic = request.file('logo_pic', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      image = new Date().getTime()+'.'+logoPic.subtype
      await logoPic.move(Helpers.publicPath('uploads/assets/images'),{
        name: image
      })
      if(!logoPic.moved()){
        session.withErrors([{ notification: 'Upload file logo Error !' , field:'logo_pic', message: logoPic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
    }
    data.logo = image;




    data.name                   = request.input('name');
    data.daa_journey_id         = request.input('daa_journey_id');
    data.daa_course_id          = request.input('daa_course_id');
    data.module_id              = request.input('module_id') ? request.input('module_id').split('_')[2] : 0;

    data.point                  = request.input('point');
    data.note                   = request.input('note');

    data.visible                = request.input('visible');
    data.save();
    session.flash({ notification: 'Success create Badge ' +data.name+ '!' });


    return response.route('dashboard.badge.index')

  }
  switchVisible = async ({request, response, view, params, session}) => {
    const id        = params.id;
    const data      = await DaaBadge.find(id);

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide '+data.name +' !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show '+data.name +' !' });
    }

    await data.save();


    return response.route('dashboard.badge.index')
  }

  delete = async ({auth,request, response, view, params, session})=>{
    session.flash({ notification: '!' });
    return response.route('dashboard.badge.index')
  }
  softDelete = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaBadge.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete '+data.name+'!' });
    return response.route('dashboard.badge.index')

  }

}

module.exports = BadgeController
