'use strict'

const Route                             = use('Route')
const DaaReminder                       = use('App/Models/DaaReminder')
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
const Database                          = use('Database')
const DaaReminderSetting                = use('App/Models/DaaReminderSetting')
const ImportService                     = use('App/Services/ImportService')

class ReminderSettingController {

 async index({auth,request, response, view, params, session}){

    let id         = params.id;
    const authUser = auth.user.toJSON()

    const datas        = await DaaReminderSetting.query()
                         .with('reminder')
                         .with('reminder_logs')
                         .whereNull('deleted_at')
                         .where('reminder_id', id)
                         .fetch();



    const reminder    = await DaaReminder.query()
                        .where('id',id)
                        .first()
    return view.render('dashboard.reminder.setting.index',{ authUser : authUser,  datas : datas.rows, reminder : reminder})
  }

  async datatable({auth,request, response, view, params, session}){
    let id          = params.id;

    const datas     = await DaaReminderSetting.query()
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

  async edit({auth,request, response, view, params, session}){
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await DaaReminderSetting.query()
                    .with('reminder')
                    .with('reminder_logs')
                    .whereNull('deleted_at')
                    .where('id', id)
                    .first();

    return view.render('dashboard.reminder.setting.edit',{authUser : authUser,data: data});
  }
  async detail({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    let id         = params.id;
    const data     = await DaaReminderSetting.query()
                    .with('reminder')
                    .with('reminder_logs')
                    .whereNull('deleted_at')
                    .where('id', id)
                    .first();

    return view.render('dashboard.reminder.setting.detail',{authUser : authUser,data: data});
  }
  async update({auth,request, response, view, params, session}){

    let id         = params.id;
    const data     = await DaaReminderSetting.find(id);

    data.notif_date     = request.input('notif_date');
    //data.reminder_id    = request.input('reminder_id');
    data.send_spv       = request.input('send_spv');
    data.send_nha       = request.input('send_nha');
    data.notif_type     = request.input('notif_type');


    data.visible       = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;

    await data.save();
    session.flash({ notification: 'Success update Reminder Setting '+data.name+'!' });
    return response.route('dashboard.reminder.setting.index',{id: data.reminder_id})
  }
  async create({auth,request, response, view, params, session}){
    let id         = params.reminder_id;
    const authUser = auth.user.toJSON()
    return view.render('dashboard.reminder.setting.create',{authUser : authUser, params :  params});
  }
  async store({auth,request, response, view, params, session}){


    const data = new DaaReminderSetting();


    data.notif_date     = request.input('notif_date');
    data.reminder_id    = request.input('reminder_id');
    data.send_spv       = request.input('send_spv');
    data.send_nha       = request.input('send_nha');
    data.notif_type     = request.input('notif_type');

    data.visible        = request.input('visible');

    await data.save();
    session.flash({ notification: 'Success create Reminder Setting ' + '!' });
    return response.route('dashboard.reminder.setting.index',{id: request.input('reminder_id')})
  }

  async switchVisible({request, response, view, params, session}){
    const id        = params.id;
    const data      = await DaaReminderSetting.find(id);

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide  !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show  !' });
    }

    await data.save();


    return response.route('dashboard.reminder.setting.index',{id: data.reminder_id})
   }

  async delete({auth,request, response, view, params, session}){
    session.flash({ notification: '!' });
    return response.route('index')
  }
  async softDelete({auth,request, response, view, params, session}){

    const id          = params.id;
    const data        = await DaaReminderSetting.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete Reminder Setting '+'!' });
    return response.route('dashboard.reminder.setting.index',{id: data.reminder_id})

  }
  async importForm({auth,request, response, view, params, session}){
    const authUser    = auth.user.toJSON()
    const id          = params.reminder_id;
    const data = await DaaReminder.find(id);

    return view.render('dashboard.reminder.setting.import_form',{authUser : authUser,data: data});
  }

  async import({auth,request, response, view, params, session}){
    let upload  = request.file('reminder_setting_file')
    let fname   = `${new Date().getTime()}.${upload.extname}`
    let dir     = 'uploads/'

    const data        = await DaaReminder.find(request.input('reminder_id'));
    //move uploaded file into custom folder
    await upload.move(Helpers.tmpPath(dir), {
        name: fname
    })

    if (!upload.moved()) {
        console.log('error')
        return (upload.error(), 'Error moving files', 500)
    }

    let send = await ImportService.ImportReminderSetting('tmp/' + dir + fname, request.input('reminder_id'));

    session.flash({ notification: 'Successfully import reminder setting to ' + data.name+' !' });
    return response.route('dashboard.reminder.setting.index',{id: request.input('reminder_id')});
  }

}

module.exports = ReminderSettingController
