'use strict'

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
const DaaReminder                       = use('App/Models/DaaReminder')
const DaaReminderSetting                = use('App/Models/DaaReminderSetting')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const DaaReward                         = use('App/Models/DaaReward')
const DaaRewardHistory                  = use('App/Models/DaaRewardHistory')
const Database                          = use('Database')
const ImportService                     = use('App/Services/ImportService')
class ReminderController {

  index = async ({auth,request, response, view, params, session}) => {
    const authUser = auth.user.toJSON()
    let id = params.course_module_id
    let courseModule = await DaaCourseModule.query().with('course', (builder) => {
      builder.with('journey')
    }).with('module').where('id', id).first();
    let datas = await DaaReminder.query()
                .with('journey')
                .with('course')
                .with('module')
                .with('reminder_settings',(builder)=>{
                  builder.with('reminder_logs')
                })
                .whereNull('deleted_at')
                .where('module_id', courseModule.module_id)
                .where('course_id', courseModule.course_id)

                .fetch();

    //let module = await Course.query().where('id',id).first();


    return view.render('dashboard.journey.course.module.reminder.index_new',{ authUser : authUser,  datas : datas , courseModule : courseModule })

   }
   datatable = async ({auth,request, response, view, params, session}) => {
     let id = params.course_module_id
     let courseModule = await DaaCourseModule.query().with('course', (builder) => {
      builder.with('journey')
    }).with('module').where('id', id).first();
    let datas =  await DaaReminder.query()
                .with('journey')
                .with('course')
                .with('module')
                .with('reminder_settings',(builder)=>{
                  builder.with('reminder_logs')
                })
                .whereNull('deleted_at')
                .where('module_id', courseModule.module_id)
                .where('course_id', courseModule.course_id)
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
   create = async ({auth,request, response, view, params, session}) => {
    const authUser = auth.user.toJSON();
    let id = params.course_module_id
    let courseModule = await DaaCourseModule.query().with('course', (builder) => {
      builder.with('journey')
    }).with('module').where('id', id).first();
    return view.render('dashboard.journey.course.module.reminder.create',{authUser : authUser, courseModule : courseModule });

   }


  store = async ({auth,request, response, view, params, session}) => {

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

    const data = await new DaaReminder();



    data.name               = request.input('name');
    data.journey_id         = request.input('journey_id');
    data.course_id          = request.input('course_id');
    data.module_id         = request.input('module_id');
    data.start_date         = request.input('start_date');
    data.expired_date       = request.input('expired_date');

    data.visible            = request.input('visible');
    await data.save();
    session.flash({ notification: 'Success create Reminder ' +data.name+ '!' });

    let courseModule = await DaaCourseModule.query().where('course_id', data.course_id).where('module_id', data.module_id).first();

    return  response.route('dashboard.journey.course.module.reminder.index',{course_module_id : courseModule.id})

  }
  edit = async ({auth,request, response, view, params, session}) => {

    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await DaaReminder
                    .query()
                    .with('journey')
                    .with('course')
                    .with('module')
                    .with('reminder_settings',(builder) => {
                      builder.with('reminder_logs')
                    })

                    .where('id',id)
                    .first();
    console.log(data);

    let courseModule = await DaaCourseModule.query().with('course',(builder)=>{ builder.with('journey')}).with('module')
    .where('course_id', data.course_id).where('module_id', data.module_id).first();
    console.log(courseModule);
    return view.render('dashboard.journey.course.module.reminder.edit',{authUser : authUser,data:data , courseModule : courseModule});

  }
  update = async ({auth,request, response, view, params, session}) => {

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
    const data     = await DaaReminder.find(id);
    data.name               = request.input('name');
    data.start_date         = request.input('start_date');
    data.expired_date       = request.input('expired_date');
    data.visible            = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;
    data.save();
    session.flash({ notification: 'Success update Reminder '+data.name+'!' });

    let courseModule = await DaaCourseModule.query().where('course_id', data.course_id).where('module_id', data.module_id).first();


    return  response.route('dashboard.journey.course.module.reminder.index',{course_module_id : courseModule.id})

  }

  switchVisible = async ({auth,request, response, view, params, session}) => {

    const id        = params.id;
    const data      = await DaaReminder.find(id);

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide '+data.name +' !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show '+data.name +' !' });
    }

    await data.save();

    let courseModule = await DaaCourseModule.query().where('course_id', data.course_id).where('module_id', data.module_id).first();

    response.route('dashboard.journey.course.module.reminder.index',{course_module_id : courseModule.id});

  }
  delete = async ({auth,request, response, view, params, session}) => {

    const id          = params.id;
    const data        = await DaaReminder.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    return data;

  }
  softDelete = async ({auth,request, response, view, params, session}) => {
    const id          = params.id;
    const data        = await DaaReminder.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();
    let courseModule = await DaaCourseModule.query().where('course_id', data.course_id).where('module_id', data.module_id).first();
    session.flash({ notification: 'Successfully delete Reminder ' + data.name + '!' });

    response.route('dashboard.journey.course.module.reminder.index',{course_module_id : courseModule.id});
  }

  indexSetting = async ({auth,request, response, view, params, session}) => {
    let id         = params.reminder_id;
    const authUser = auth.user.toJSON()

    const datas        = await DaaReminderSetting.query()
                         .with('reminder')
                         .with('reminder_logs')
                         .whereNull('deleted_at')
                         .where('reminder_id', id)
                         .fetch();



    const reminder    = await DaaReminder.query()
                        .with('journey')
                        .with('course')
                        .with('module')
                        .where('id',id)
                        .first()
    let courseModule = await DaaCourseModule.query().with('course',(builder)=>{ builder.with('journey')}).with('module')
                        .where('course_id', reminder.course_id).where('module_id', reminder.module_id).first();
    return view.render('dashboard.journey.course.module.reminder.setting.index',{ authUser : authUser,  datas : datas, reminder : reminder , courseModule : courseModule})

  }
  datatableSetting = async ({auth,request, response, view, params, session}) => {

    let id         = params.reminder_id;
    const authUser = auth.user.toJSON()

    const datas        = await DaaReminderSetting.query()
                         .with('reminder')
                         .with('reminder_logs')
                         .whereNull('deleted_at')
                         .where('reminder_id', id)
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
  createSetting = async ({auth,request, response, view, params, session}) => {
    let id = params.reminder_id;
    let reminder = await DaaReminder.query()
                        .with('journey')
                        .with('course')
                        .with('module')
                        .where('id',id)
      .first()
    let courseModule = await DaaCourseModule.query().with('course',(builder)=>{ builder.with('journey')}).with('module')
      .where('course_id', reminder.course_id).where('module_id', reminder.module_id).first();
    const authUser = auth.user.toJSON()
    return view.render('dashboard.journey.course.module.reminder.setting.create',{authUser : authUser,reminder : reminder, courseModule : courseModule});
  }

  storeSetting = async ({auth,request, response, view, params, session}) => {

    const data = new DaaReminderSetting();


    data.notif_date     = request.input('notif_date');
    data.reminder_id    = request.input('reminder_id');
    data.send_spv       = request.input('send_spv');
    data.send_nha       = request.input('send_nha');
    data.notif_type     = request.input('notif_type');

    data.visible        = request.input('visible');

    await data.save();

    session.flash({ notification: 'Success create Reminder Setting ' + '!' });
    return response.route('dashboard.journey.course.module.reminder.setting.index',{reminder_id: request.input('reminder_id')})

  }
  editSetting = async ({auth,request, response, view, params, session}) => {

    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await DaaReminderSetting.query()
                    .with('reminder')
                    .with('reminder_logs')
                    .whereNull('deleted_at')
                    .where('id', id)
                    .first();
    let courseModule = await DaaCourseModule.query().with('course',(builder)=>{ builder.with('journey')}).with('module')
                    .where('course_id', data.getRelated('reminder').course_id).where('module_id', data.getRelated('reminder').module_id).first();

    return view.render('dashboard.journey.course.module.reminder.setting.edit',{authUser : authUser,data: data, courseModule : courseModule});

  }
  updateSetting = async ({auth,request, response, view, params, session}) => {

    let id         = params.id;
    const data     = await DaaReminderSetting.query().with('reminder').where('id',id).first();

    data.notif_date     = request.input('notif_date');

    data.send_spv       = request.input('send_spv');
    data.send_nha       = request.input('send_nha');
    data.notif_type     = request.input('notif_type');


    data.visible       = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;

    await data.save();
    session.flash({ notification: 'Success update Reminder Setting '+data.getRelated('name')+'!' });
    return response.route('dashboard.journey.course.module.reminder.setting.index',{reminder_id: data.reminder_id})

  }

  switchVisibleSetting = async ({auth,request, response, view, params, session}) => {

    const id        = params.id;
    const data      = await DaaReminderSetting.find(id);

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide reminder setting !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show reminder setting !' });
    }

    await data.save();
    return response.route('dashboard.journey.course.module.reminder.setting.index',{reminder_id: data.reminder_id})
  }
  deleteSetting = async ({auth,request, response, view, params, session}) => {
    const id          = params.id;
    const data        = await DaaReminderSetting.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();
    return data;
  }
  softDeleteSetting = async ({auth,request, response, view, params, session}) => {

    const id          = params.id;
    const data        = await DaaReminderSetting.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete Reminder Setting '+'!' });
    return response.route('dashboard.journey.course.module.reminder.setting.index',{reminder_id: data.reminder_id})
  }

  importForm = async ({auth,request, response, view, params, session})=> {
    const authUser    = auth.user.toJSON()
    const id          = params.reminder_id;
    const data = await DaaReminder.find(id);
    let courseModule = await DaaCourseModule.query().with('course',(builder)=>{ builder.with('journey')}).with('module')
    .where('course_id', data.course_id).where('module_id', data.module_id).first();
    return view.render('dashboard.journey.course.module.reminder.setting.import_form',{authUser : authUser,data: data, datas : [], courseModule : courseModule});
  }

  async import({auth,request, response, view, params, session}){
    const authUser    = auth.user.toJSON()
    let upload  = request.file('reminder_setting_file')
    let fname   = `${new Date().getTime()}.${upload.extname}`
    let dir     = 'uploads/'

    const data        = await DaaReminder.find(params.reminder_id);
    //move uploaded file into custom folder
    await upload.move(Helpers.tmpPath(dir), {
        name: fname
    })

    if (!upload.moved()) {
        console.log('error')
        return (upload.error(), 'Error moving files', 500)
    }

    let send = await ImportService.ImportReminderSetting('tmp/' + dir + fname, params.reminder_id);

    let courseModule = await DaaCourseModule.query().with('course',(builder)=>{ builder.with('journey')}).with('module')
    .where('course_id', data.course_id).where('module_id', data.module_id).first();

    session.flash({ notification: 'Successfully import reminder setting  !' });
    return view.render('dashboard.journey.course.module.reminder.setting.import_form',{authUser : authUser,data: data, datas : send, courseModule : courseModule});
  }

  async downloadTemplateUploadSetting({request, response, view, params, session}){
    return response.download(Helpers.publicPath('uploads/assets/template/excel/template_import_setting_reminder.xlsx'));
  }
}

module.exports = ReminderController
