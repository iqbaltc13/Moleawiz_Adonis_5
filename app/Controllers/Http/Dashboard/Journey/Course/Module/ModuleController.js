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
const DaaModuleCategory                 = use('App/Models/DaaModuleCategory')
const DaaCourseLog                      = use('App/Models/DaaCourseLog')
const DaaContentLibraryModule           = use('App/Models/DaaContentLibraryModule')
const DaaContentLibrary                 = use('App/Models/DaaContentLibrary')
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
const TextHelper                        = use('App/Controllers/Http/Helper/TextController')

class ModuleController {


   constructor() {

    this.journey_controller = new JourneyController();
    this.text_helper = new TextHelper();

  }
   index = async ({ auth, request, response, view, params, session }) => {

    let id         = params.id;
    const authUser = auth.user.toJSON()

    const datas        = await DaaCourseModule.query()
                         .with('module',(builder)=>{
                           builder.with('category_module')
                           .with('content_library_module',(builderChild) => { builderChild.with('content_library') })
                           .with('previous_restrict',(builderChild) => { builderChild.with('previous_module').with('next_module') })


                         })

                         .whereNull('deleted_at')
                         .where('course_id', id)
                         .fetch();
     for (let i = 0; i < datas.rows.length; i++) {
       datas.rows[i].content_libraries = await DaaContentLibraryModule.query()
                                          .with('content_library')
                                          .whereNull('deleted_at')
                                          .where('module_id', datas.rows[i].module_id)
                                          .fetch();
      if(datas.rows[i].getRelated('module').description){
        datas.rows[i].getRelated('module').description_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[i].getRelated('module').description.substring(0,249), 5)
      }
      datas.rows[i].getRelated('module').fullname_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[i].getRelated('module').fullname.substring(0,249), 3)


     }

    console.log(datas.rows[0].getRelated('module').getRelated('content_library_module'));
    const course        = await DaaCourse.query()
                        .with('journey')
                        .where('id', id)
                        .first();

    return view.render('dashboard.journey.course.module.index_new',{ authUser : authUser,  datas : datas, course : course})
   }

   datatable = async ({auth,request, response, view, params, session})=>{
    let id          = params.id;

    const datas     = await DaaCourseModule.query()
                    .with('module',(builder)=>{
                      builder.with('category_module')
                      .with('content_library_module',(builderChild) => { builderChild.with('content_library') })
                      .with('previous_restrict',(builderChild) => { builderChild.with('previous_module').with('next_module') })


                    })
                    .whereNull('deleted_at')
                    .where('course_id', id)
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

   create = async ({auth,request, response, view, params, session})=>{

    const course  =  await DaaCourse.query().with('course_modules', (builder) => { builder.whereNull('deleted_at') }).where('id',params.id).first();
    let datas = await Course.query().with('context',(builder)=>{
                    builder.with('files',(builderChild)=>{
                      builderChild.where('component','course').where('mimetype','LIKE','%image%')
                    })
                })
                .whereNotIn('id', course.getRelated('course_modules').rows.map(res => res.module_id)).fetch();
    for (let index in datas.rows) {
      datas.rows[index].description_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].description.substring(0,249), 10)
      datas.rows[index].fullname_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].fullname.substring(0,249), 3)
    }


    const authUser = auth.user.toJSON()
    return view.render('dashboard.journey.course.module.create',{authUser : authUser,  datas : datas, course : course});
  }
  store = async ({auth,request, response, view, params, session})=>{

    let modulesId = request.input('modules_id') ? request.input('modules_id') : [];


    let daaCourseModule = await DaaCourseModule.query()
                          .with('course')
                          .where('course_id', request.input('id'))
                          .first();
    console.log(modulesId);
    for (let i = 0; i < modulesId.length; i++) {
        let daaCourseModule = new DaaCourseModule();
        daaCourseModule.course_id = request.input('id');
        daaCourseModule.module_id = modulesId[i];

         await daaCourseModule.save();
         //console.log(daaCourseModule);
    }


    session.flash({ notification: 'Success add module on Course ' +daaCourseModule.getRelated('course').name+ '!' });
    return response.route('dashboard.journey.course.module.index',{id: request.input('id')})
  }

   edit = async ({auth,request, response, view, params, session})=>{
    let id         = params.course_module_id;
    const authUser = auth.user.toJSON()

    const courseModule = await DaaCourseModule.query().with('course',(builder)=>{
      builder.with('journey')
    }).with('module',(builder)=>{
      builder .with('category_module')
      .with('content_library_module')
    })
    .where('id',id).first();
    const data     = courseModule.getRelated('module');
     if (data) {
       data.content_library_modules = await DaaContentLibraryModule.query().with('content_library').where('module_id', data.id).whereNull('deleted_at').fetch();
     }
     console.log(data.content_library_modules.rows);
     const modulesCategory   = await DaaModuleCategory.query().whereNull('deleted_at').fetch();
     const contentLibraries  = await DaaContentLibrary.query().where('visible', 1).whereNull('deleted_at').fetch();
     return view.render('dashboard.journey.course.module.setting_new', {
       authUser: authUser, data: data, modulesCategory: modulesCategory, contentLibraries : contentLibraries, courseModule : courseModule
     });
  }

  update = async ({auth,request, response, view, params, session})=>{
    const rules             = {


    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }
    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    let id = params.id;
    const courseModule = await DaaCourseModule.query().where('id', request.input('course_module_id')).first();
    const data     = await Course.query().where('id',id).first();
    let trailer = "";
    if(request.file('trailer_file')){
      const trailerFile = request.file('trailer_file', {
        types : ['mp4', 'mov','wmv','avi','mkv','swf','webm'],
        size: '100mb',
        overwrite: true
      })
      trailer = new Date().getTime()+'.'+trailerFile.subtype
      await trailerFile.move(Helpers.publicPath('uploads/assets/images'),{
        name: trailer
      })
      if(!trailerFile.moved()){
        session.withErrors([{ notification: 'Upload file Thumbnail Image Error !' , field:'trailer_file', message: trailerFile.error().message }]).flashAll() ;
        return response.redirect('back')
      }

      data.trailer   = trailer;
    }


    data.description       = request.input('description');
    data.attempt           = request.input('attempt');
    data.max_point_attempt = request.input('max_point_attempt');
    data.is_placement_test = request.input('is_placement_test');
    data.unity             = request.input('unity');
    data.module_type       = request.input('module_type');
    data.has_rating        = request.input('has_rating');
    data.learning_effort   = request.input('learning_effort');
    data.module_category   = request.input('module_category');
    data.visible       = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;
    await data.save();

    let idContentLibraryModules = request.input('id_content_libraries');
    const contentLibraryModule = null;

    for (let index in idContentLibraryModules) {
      console.log(idContentLibraryModules[index])

      const contentLibraryModule = await DaaContentLibraryModule.findOrCreate(
        { content_library_id : idContentLibraryModules[index], module_id : id },
        { content_library_id : idContentLibraryModules[index], module_id : id }
      )

    }
    await DaaContentLibraryModule.query().where('module_id',id)
    .whereNotIn('content_library_id',idContentLibraryModules)
    .update({ deleted_at: dateTime })

    await DaaContentLibraryModule.query().where('module_id',id)
    .whereIn('content_library_id',idContentLibraryModules)
    .update({ deleted_at: null })
    session.flash({ notification: 'Success update Module '+data.fullname+'!' });
    return response.route('dashboard.journey.course.module.index',{id: courseModule.course_id})
  }
  softDelete = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaCourseModule.query()
                        .with('course')
                        .with('module')
                        .where('id',id)
                        .first();

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete Module '+data.getRelated('module').fullname+'!' });
    return response.route('dashboard.journey.course.module.index',{id: data.course_id})

  }
  softDeleteRestrict = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaRestrict.query()

                        .where('id',id).first();

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete restrict' + '!' });
    return response.redirect('back')
    //return response.route('dashboard.journey.course.module.index',{id: request.input('course_id')})

  }


  restrictSettingsForm = async ({auth, request, response, view, params, session })=> {
    await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
    await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
    let id = params.id;
    const authUser     = auth.user.toJSON();
    const data         = await DaaCourseModule.query().with('course').with('module')
                         .where('id',id).first();

    let sqlListModule = "SELECT c.*, c.id as cid "+

                        "from course c "+
                        "JOIN daa_course_modules cm ON cm.module_id=c.id " +
                        //"JOIN context co ON co.instanceid = c.id   "+

                        //"JOIN files f ON f.contextid = co.id  "+

                        //"WHERE c.format = 'singleactivity' and c.visible = 1   AND co.contextlevel='50' AND f.component='course' AND f.mimetype like '%image%'"+
                        "WHERE c.format = 'singleactivity' and c.visible = 1   "+

                        "and cm.id != "+data.module_id+" and c.id not in (select dr.resid from daa_restrict dr where dr.acttype = 3 and dr.actid = "+data.module_id+") GROUP BY c.id"  ;
    let listModule     = await Database.connection('db_reader').raw(sqlListModule);
    for (let index in listModule[0]) {
      listModule[0][index].description_cut = await this.text_helper.getWrappedBySpaceCharacter(listModule[0][index].description.substring(0,249), 10)
      listModule[0][index].fullname_cut = await this.text_helper.getWrappedBySpaceCharacter(listModule[0][index].fullname.substring(0,249), 3)
    }
    return view.render('dashboard.journey.course.module.restrict_settings',{ authUser : authUser, data : data,  datas : listModule[0], moduleId : data.module_id})
  }
  restrictSettings = async ({ request, response, view, params, session }) => {

    let moduleRestrictId = request.input('modules_id') ? request.input('modules_id') : [];

    let id     = params.id;
    let module = await Course.find(id);
    console.log(moduleRestrictId);
    for (let i = 0; i < moduleRestrictId.length; i++) {
      let daaRestrict = new DaaRestrict();
      daaRestrict.acttype = 3;
      daaRestrict.actid = id;
      daaRestrict.resid =  moduleRestrictId[i];

      await daaRestrict.save();


      //console.log(daaRestrict);
    }

    session.flash({ notification: 'Successfully set restrict for '+module.fullname  +'!' });
    return response.route('dashboard.journey.course.module.index', {id: request.input('course_id')})
  }

  switchVisible = async ({request, response, view, params, session})=>{
    const id        = params.id;
    const data      = await Course.query().where('id',id).first();

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide '+data.fullname +' !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show '+data.fullname +' !' });
    }

    await data.save();


    //return response.route('dashboard.journey.course.module.index',{id: data.course_id})
    return response.redirect('back')

  }
}

module.exports = ModuleController
