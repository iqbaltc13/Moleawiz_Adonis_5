'use strict'

const DaaCertificate                    = use('App/Models/DaaCertificate')
const DaaCertificate2                   = use('App/Models/DaaCertificate2')
const DaaCertificateUser                = use('App/Models/DaaCertificateUser')
const DaaCertificateUser2               = use('App/Models/DaaCertificateUser2')
const DaaCustomCertificateLog           = use('App/Models/DaaCustomCertificateLog')
const Route                             = use('Route')
const CourseBridgeLearningEffort        = use('App/Models/CourseBridgeLearningEffort')
const CourseCategory                    = use('App/Models/CourseCategory')
const CourseCompletionAggrMethd         = use('App/Models/CourseCompletionAggrMethd')
const CourseCompletionCriteria          = use('App/Models/CourseCompletionCriterion')
const CourseFormatOption                = use('App/Models/CourseFormatOption')
const CourseModule                      = use('App/Models/CourseModule')
const CourseModuleCompletion            = use('App/Models/CourseModuleCompletion')
const CourseSection                     = use('App/Models/CourseSection')
const DaaJourney                        = use('App/Models/DaaJourney')
const DaaRestrict                       = use('App/Models/DaaRestrict')
const DaaCourse                         = use('App/Models/DaaCourse')
const DaaCourseLog                      = use('App/Models/DaaCourseLog')
const DaaCourseModule                   = use('App/Models/DaaCourseModule')
const ToolRecyclebinCourse              = use('App/Models/ToolRecyclebinCourse')
const Course                            = use('App/Models/Course')
const User                              = use('App/Models/User')
//const Multer                            = use('Multer')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const DaaReward                         = use('App/Models/DaaReward')
const DaaRewardHistory                  = use('App/Models/DaaRewardHistory')
const JourneyController                 = use('App/Controllers/Http/Dashboard/Journey/JourneyController')
const Database                          = use('Database')


class CertificateController {
  constructor() {

    this.journey_controller = new JourneyController();

  }

  index = async ({auth,request, response, view, params, session})=>{

    let id         = params.id;
    const authUser = auth.user.toJSON()

    const datas        = await DaaCertificate2.query()
                         .with('journey')
                         .with('certificate_user')
                         .whereNull('deleted_at')
                         .where('daa_journey_id', id)
                         .fetch();
    let sqlModules = "";
    for (let i = 0; i < datas.rows.length; i++) {
        datas.rows[i].modules = [];
        datas.rows[i].modules_counter = 0;
        if (datas.rows[i].module_id) {
          sqlModules = "SELECT * FROM course WHERE id IN ("+datas.rows[i].module_id+");";
          datas.rows[i].modules = await Database.connection('db_reader').raw(sqlModules);
        }
    }
    //console.log(datas.rows[0].modules[0]);
    const journey   =  await this.journey_controller.detail(id);

    return view.render('dashboard.journey.certificate.index',{ authUser : authUser,  datas : datas.rows,journey : journey})
  }

  datatable = async  ({auth,request, response, view, params, session})=>{
    let id          = params.id;

    const datas     = await DaaCertificate2.query()
                      .with('journey')
                      .whereNull('deleted_at')
                      .where('daa_journey_id', id)
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
    const data     = await DaaCertificate2.query()
                    .with('journey')
                    .whereNull('deleted_at')
                    .where('id', id)
                    .first();
    const modules  =  await Course.query().whereNull('deleted_at').fetch();
    return view.render('dashboard.journey.certificate.edit',{authUser : authUser,data: data, modules: modules.rows});
  }
  detail = async ({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()
    let id         = params.id;
    const data     = await DaaCertificate2.query()
                    .with('journey')
                    .with('certificate_user')
                    .with('certificate_user.user')
                    .whereNull('deleted_at')
                    .where('id', id)
                    .first();

    return view.render('dashboard.journey.certificate.detail',{authUser : authUser,data: data});
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
    const data     = await DaaCertificate2.find(id);
    let image = "";
    if(request.file('certificate')){
      const profilePic = request.file('certificate', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      image = new Date().getTime()+'.'+profilePic.subtype
      await profilePic.move(Helpers.publicPath('uploads/assets/images'),{
        name: image
      })
      if(!profilePic.moved()){
        session.withErrors([{ notification: 'Upload file Template Certificate Error !' , field:'certificate', message: profilePic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
      data.certificate   = image;
    }
    data.name          = request.input('name');
    data.kode          = request.input('kode');
    data.note          = request.input('note');
    data.expired_date  = request.input('expired_date');


    data.module_id     = request.input('module_id') ? request.input('module_id').join() : ''  ;
    data.visible       = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;

    data.save();
    session.flash({ notification: 'Success update Certificate '+data.name+'!' });
    return response.route('dashboard.journey.certificate.index',{id: data.daa_journey_id})
  }
  create = async ({auth,request, response, view, params, session})=>{
    const modules  =  await Course.query().whereNull('deleted_at').fetch();
    const journey  =  await this.journey_controller.detail(params.daa_journey_id);
    const authUser = auth.user.toJSON()
    return view.render('dashboard.journey.certificate.create',{authUser : authUser, journey : journey, modules: modules.rows});
  }
  store = async ({auth,request, response, view, params, session})=>{
    let daaJourneyId        = request.input('daa_journey_id');
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

    const data = new DaaCertificate2();
    let image = "";
    if(request.file('certificate')){
      const profilePic = request.file('certificate', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      image = new Date().getTime()+'.'+profilePic.subtype
      await profilePic.move(Helpers.publicPath('uploads/assets/images'),{
        name: image
      })
      if(!profilePic.moved()){
        session.withErrors([{ notification: 'Upload file template Certificate Error !' , field:'certificate', message: profilePic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
    }
    data.name           = request.input('name');
    data.daa_journey_id = request.input('daa_journey_id');
    data.kode           = request.input('kode');
    data.note           = request.input('note');
    data.expired_date   = request.input('expired_date');
    data.certificate    = image;
    data.visible        = request.input('visible');
    data.module_id      = request.input('module_id') ? request.input('module_id').join() : ''  ;
    data.save();
    session.flash({ notification: 'Success create Certificate ' +data.name+ '!' });
    return response.route('dashboard.journey.certificate.index',{id: request.input('daa_journey_id')})
  }
  switchVisible = async ({request, response, view, params, session})=>{
    const id        = params.id;
    const data      = await  DaaCertificate2.find(id);

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide '+data.name +' !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show '+data.name +' !' });
    }

    await data.save();


    return response.route('dashboard.journey.certificate.index',{id: data.daa_journey_id})
   }

  delete = async ({auth,request, response, view, params, session})=>{
    session.flash({ notification: '!' });
    return response.route('index')
  }
  softDelete = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaCertificate2.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete '+data.name+'!' });
    return response.route('dashboard.journey.certificate.index',{id: data.daa_journey_id})

  }


}

module.exports = CertificateController
