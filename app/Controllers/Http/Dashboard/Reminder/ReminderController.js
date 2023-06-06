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
const User = use('App/Models/User')
const DaaCronjobLog                     = use('App/Models/DaaCronjobLog')
const DaaReminderLog                    = use('App/Models/DaaReminderLog')
//const Multer                            = use('Multer')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const DaaReward                         = use('App/Models/DaaReward')
const DaaRewardHistory                  = use('App/Models/DaaRewardHistory')
const Database                          = use('Database')

class ReminderController {

  constructor() {
        this.startdate = '2021-01-01';
        this.enddate   = new Date().toISOString().split('T')[0];
        this.drl_startdate =  new Date().toISOString().split('T')[0];
        this.drl_enddate   = new Date(new Date() + 240*60000);
  }

  async index({ auth, request, response, view, params, session }) {

    let requestParams = {};
    const authUser = auth.user.toJSON()
    let datas = DaaReminder.query()
                    .with('journey')
                    .with('course')
                    .with('module')
                    .with('reminder_settings')
                    .with('reminder_settings.reminder_logs')

                    .whereNull('deleted_at');
                    if (request.input('journey_id') != "" && request.input('journey_id') != null) {
                      datas = datas.where('journey_id', request.input('journey_id'));
                      requestParams.journey_id = request.input('journey_id');
                    }
                    if (request.input('course_id') != "" && request.input('course_id') != null) {
                      datas = datas.where('course_id', request.input('course_id'));
                      requestParams.course_id = request.input('course_id');
                    }
                    if (request.input('module_id') != "" && request.input('module_id') != null ) {
                      datas = datas.where('module_id', request.input('module_id'));
                      requestParams.module_id = request.input('module_id');
                    }
                    datas = await datas.fetch();


    return view.render('dashboard.reminder.index',{ authUser : authUser,  datas : datas.rows , requestParams : requestParams})


  }

  async datatable({auth,request, response, view, params, session}){
    let datas = await DaaReminder.query()
      .with('journey')
      .with('course')
      .with('module')
      .with('reminder_settings')
      .with('reminder_settings.reminder_logs')
      .whereNull('deleted_at');
      if (request.input('journey_id') != "" && request.input('journey_id') != null) {
        datas = await datas.where('journey_id', request.input('journey_id'));
      }
      if (request.input('course_id') != "" && request.input('course_id') != null) {
        datas = await datas.where('course_id', request.input('course_id'));
      }
      if (request.input('module_id') != "" && request.input('module_id') != null ) {
        datas = await datas.where('module_id', request.input('module_id'));
      }
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
  async edit({auth,request, response, view, params, session}){
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await DaaReminder
                    .query()
                    .with('journey')
                    .with('course')
                    .with('module')
                    .with('reminder_settings')
                    .with('reminder_settings.reminder_logs')
                    .where('id',id)
                    .first();
    return view.render('dashboard.reminder.edit',{authUser : authUser,data:data});
  }
  async update({auth,request, response, view, params, session}){
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
    data.general_date       = request.input('start_date') == 4 || request.input('start_date') == '4' ? request.input('general_date') : null;
    data.visible            = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;
    data.save();
    session.flash({ notification: 'Success update Reminder '+data.name+'!' });

    let strRedirect = '/dashboard/reminder/index' + '?';
    let dataResponse = {};



    if (data.journey_id != "" && data.journey_id != null) {
        dataResponse.journey_id = data.journey_id
        strRedirect = strRedirect + 'journey_id='+data.journey_id+'&&';
    }
    if (data.course_id != "" && data.course_id != null) {
        dataResponse.course_id = data.course_id
        strRedirect = strRedirect + 'course_id='+data.course_id+'&&';
    }
    if (data.module_id != "" && data.module_id != null ) {
        dataResponse.module_id = data.module_id
        strRedirect = strRedirect + 'module_id='+data.module_id+'&&';
    }
    return  response
    .redirect(strRedirect)

  }
  async create({ auth, request, response, view, params, session }) {
    let paramRequest = {
      journey_id :  request.input('journey_id') ? request.input('journey_id') : null,
      course_id  :  request.input('course_id') ? request.input('course_id') : null,
      module_id :   request.input('module_id') ? request.input('module_id') : null,
    };
    if (request.input('journey_id') != "" && request.input('journey_id') != null) {
       paramRequest.journey = await  DaaJourney.query().where('id',request.input('journey_id')).first();
    }
    if (request.input('course_id') != "" && request.input('course_id') != null) {
       paramRequest.course = await  DaaCourse.query().where('id',request.input('course_id')).first();
    }
    if (request.input('module_id') != "" && request.input('module_id') != null ) {
       paramRequest.module = await  Course.query().where('id',request.input('module_id')).first();
    }

    const authUser = auth.user.toJSON()
    return view.render('dashboard.reminder.create',{authUser : authUser , paramRequest : paramRequest});
  }
  async store({auth,request, response, view, params, session}){

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

    const data = new DaaReminder();

    if((""!=request.input('journey_id') && null !=request.input('journey_id') ) && (""!=request.input('course_id') && null !=request.input('course_id')) && (""!=request.input('module_id') && null !=request.input('module_id'))){
      data.reminder_type = 3;
    }else if((""!=request.input('journey_id') && null !=request.input('journey_id')) && (""!=request.input('course_id') && null !=request.input('course_id')) && ( null ==request.input('module_id'))){
      data.reminder_type = 2;
    }else if((""!=request.input('journey_id') && null !=request.input('journey_id')) && ( null ==request.input('course_id')) && ( null ==request.input('module_id'))){
      data.reminder_type = 1;
    }


    data.name               = request.input('name');
    data.journey_id         = request.input('journey_id');
    data.course_id          = request.input('course_id');
    data.module_id          = request.input('module_id');

    data.start_date         = request.input('start_date');
    data.expired_date       = request.input('expired_date');
    data.general_date       = request.input('general_date');
    data.visible            = request.input('visible');
    data.save();
    session.flash({ notification: 'Success create Reminder ' +data.name+ '!' });

    let strRedirect = '/dashboard/reminder/index' + '?';
    let dataResponse = {};



    if (request.input('journey_id') != "" && request.input('journey_id') != null) {
        dataResponse.journey_id = request.input('journey_id')
        strRedirect = strRedirect + 'journey_id='+request.input('journey_id')+'&&';
    }
    if (request.input('course_id') != "" && request.input('course_id') != null) {
        dataResponse.course_id = request.input('course_id')
        strRedirect = strRedirect + 'course_id='+request.input('course_id')+'&&';
    }
    if (request.input('module_id') != "" && request.input('module_id') != null ) {
        dataResponse.module_id = request.input('module_id')
        strRedirect = strRedirect + 'module_id='+request.input('module_id')+'&&';
    }
    return  response
    .redirect(strRedirect)

  }

  async switchVisible({request, response, view, params, session}){
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


    response.redirect().back();
   }

  async delete({auth,request, response, view, params, session}){
    session.flash({ notification: '!' });
    return response.route('index')
  }
  async softDelete({auth,request, response, view, params, session}){
    const id          = params.id;
    const data        = await DaaReminder.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete Reminder ' + data.name + '!' });
    let strRedirect = '/dashboard/reminder/index' + '?';
    let dataResponse = {};



    if (data.journey_id != "" && data.journey_id != null) {
        dataResponse.journey_id = data.journey_id
        strRedirect = strRedirect + 'journey_id='+data.journey_id+'&&';
    }
    if (data.course_id != "" && data.course_id != null) {
        dataResponse.course_id = data.course_id
        strRedirect = strRedirect + 'course_id='+data.course_id+'&&';
    }
    if (data.module_id != "" && data.module_id != null ) {
        dataResponse.module_id = data.module_id
        strRedirect = strRedirect + 'module_id='+data.module_id+'&&';
    }
    // return  response
    // .redirect(strRedirect)
    response.redirect('back')

  }
  async indexMonitoringLog({ auth, request, response, view, params, session }) {
    let requestParams = {};
    requestParams.start_date = request.input('start_date') ? request.input('start_date') : this.startdate;
    requestParams.end_date = request.input('end_date') ? request.input('end_date') : this.enddate;
    const authUser = auth.user.toJSON()
    const datas     = await DaaCronjobLog
                    .query()
                    .where('start_date','<=', requestParams.end_date)
                    .where('start_date','>=', requestParams.start_date)
                    .whereNull('deleted_at')
                    .orderBy('start_date')
                    .limit(100)
                    .fetch();
    let reminderLogDatas = await DaaReminderLog.query()
                           .whereNull('deleted_at')
                           .fetch();
    for (let index in datas.rows) {
      datas.rows[index].get_data = [];
      if(datas.rows[index].end_date && datas.rows[index].cron_name.includes('index')){
        datas.rows[index].get_data = reminderLogDatas.rows.filter(item => {

          return item.created_at >= datas.rows[index].start_date && item.created_at <= new Date(datas.rows[index].start_date + 240*60000);;
       })

      }

    }



    return view.render('dashboard.reminder.index_monitoring_log',{ authUser : authUser,  datas : datas.rows , requestParams : requestParams})

  }
  async datatableMonitoringLog({ auth, request, response, view, params, session }) {
    let requestParams = {};
    requestParams.start_date = request.input('start_date') ? request.input('start_date') : this.startdate;
    requestParams.end_date = request.input('end_date') ? request.input('end_date') : this.enddate;
    const datas     = await DaaCronjobLog
                        .query()
                        .where('start_date','<=', requestParams.end_date)
                        .where('start_date','>=', requestParams.start_date)
                        .whereNull('deleted_at')
                        .orderBy('start_date')
                        .fetch();
                        let reminderLogDatas = await DaaReminderLog.query()
                        .whereNull('deleted_at')
                        .fetch();
    for (let index in datas.rows) {
      datas.rows[index].get_data = [];
      if(datas.rows[index].end_date && datas.rows[index].cron_name.includes('index')){
        datas.rows[index].get_data = reminderLogDatas.rows.filter(item => {

          return item.created_at >= datas.rows[index].start_date && item.created_at <= new Date(datas.rows[index].start_date + 240*60000);;
        })

      }

    }

    var result = Object.keys(datas).map((key) => [Number(key), datas[key]]);
    let valueDatatable = {
      draw            : 0,
      recordsTotal    : result[0][1].length,
      recordsFiltered : 10,
      data            : result[0][1]
    };



    return valueDatatable;

  }

  async detailMonitoringLog({ auth, request, response, view, params, session }) {
    let requestParams = {};
    requestParams.drl_start_date = request.input('drl_start_date') ? request.input('drl_start_date') : this.drl_startdate;
    requestParams.drl_notif_type = request.input('drl_notif_type');
    requestParams.drl_notif_status = request.input('drl_notif_status');
    requestParams.drl_cron_name = request.input('drl_cron_name');

    let tempEndDate = requestParams.drl_cron_name=="GetData" ?   new Date(new Date(requestParams.drl_start_date) + 240*60000) :  new Date(new Date(requestParams.drl_start_date) + 58*60000);
    requestParams.drl_end_date = request.input('drl_end_date') ? request.input('drl_end_date') : tempEndDate.toLocaleDateString('en-GB').split('/').reverse().join('-')+' '+tempEndDate.getHours()+':'+tempEndDate.getMinutes()+':'+tempEndDate.getSeconds() ;


    const authUser = auth.user.toJSON()
    let datas     = await DaaReminderLog
                    .query()
                    .with('reminder_setting')
                    .with('reminder_setting.reminder')
                    .with('user')
                    .with('nha')
                    .with('spv')
                    // .where('created_at','<=', requestParams.drl_end_date)
                    // .where('created_at','>=', requestParams.drl_start_date)
                    .whereNull('deleted_at')
                    .fetch();
    if (parseInt(requestParams.drl_notif_type) == 1) {
      if (parseInt(requestParams.drl_notif_status) < 2) {
        datas.rows    = datas.rows.filter(item => {

          return item.created_at >= new Date(requestParams.drl_start_date) && item.created_at <= new Date(requestParams.drl_end_date) && item.send_notif == requestParams.drl_notif_status && item.user_id > 0 ;
        })
      }
      else {
        datas.rows    = datas.rows.filter(item => {

          return item.created_at >= new Date(requestParams.drl_start_date) && item.created_at <= new Date(requestParams.drl_end_date) && item.user_id > 0 ;
        })
      }
    }
    else if (parseInt(requestParams.drl_notif_type) == 2) {
      if (parseInt(requestParams.drl_notif_status) < 2) {
          datas.rows    = datas.rows.filter(item => {

            return item.created_at >= new Date(requestParams.drl_start_date) && item.created_at <= new Date(requestParams.drl_end_date) && item.send_notif_spv == requestParams.drl_notif_status && item.drl.spv_id > 0 ;
          })
      }
      else {
          datas.rows    = datas.rows.filter(item => {

            return item.created_at >= new Date(requestParams.drl_start_date) && item.created_at <= new Date(requestParams.drl_end_date) && item.drl.spv_id > 0 ;
          })
      }

    }
    else if (parseInt(requestParams.drl_notif_type) == 3) {
      if (parseInt(requestParams.drl_notif_status) < 2) {
         datas.rows    = datas.rows.filter(item => {

           return item.created_at >= new Date(requestParams.drl_start_date) && item.created_at <= new Date(requestParams.drl_end_date) && item.send_notif_nha == requestParams.drl_notif_status && item.drl.nha_id > 0 ;
         })
      }
      else {
          datas.rows    = datas.rows.filter(item => {

            return item.created_at >= new Date(requestParams.drl_start_date) && item.created_at <= new Date(requestParams.drl_end_date) && item.drl.nha_id > 0 ;
          })
      }
    }
    else {
      datas.rows    = datas.rows.filter(item => {

          return item.created_at >= new Date(requestParams.drl_start_date) && item.created_at <= new Date(requestParams.drl_end_date) ;
      })
    }





    return view.render('dashboard.reminder.detail_monitoring_log',{ authUser : authUser,  datas : datas.rows , requestParams : requestParams})

  }

  async datatableDetailMonitoringLog({ auth, request, response, view, params, session }) {
    let requestParams = {};
    requestParams.start_date = request.input('start_date') ? request.input('start_date') : this.startdate;
    requestParams.end_date = request.input('end_date') ? request.input('end_date') : this.enddate;
    const datas     = await DaaCronjobLog
                        .query()
                        .where('start_date','<=', requestParams.end_date)
                        .where('start_date','>=', requestParams.start_date)
                        .whereNull('deleted_at')
                        .orderBy('start_date')
                        .fetch();
                        let reminderLogDatas = await DaaReminderLog.query()
                        .whereNull('deleted_at')
                        .fetch();
    for (let index in datas.rows) {
      datas.rows[index].get_data = [];
      if(datas.rows[index].end_date && datas.rows[index].cron_name.includes('index')){
        datas.rows[index].get_data = reminderLogDatas.rows.filter(item => {

          return item.created_at >= datas.rows[index].start_date && item.created_at <= new Date(datas.rows[index].start_date + 240*60000);;
        })

      }

    }

    var result = Object.keys(datas).map((key) => [Number(key), datas[key]]);
    let valueDatatable = {
      draw            : 0,
      recordsTotal    : result[0][1].length,
      recordsFiltered : 10,
      data            : result[0][1]
    };



    return valueDatatable;

  }

}

module.exports = ReminderController
