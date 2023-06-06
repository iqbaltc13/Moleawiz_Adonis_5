'use strict'
const DaaModuleLog                      = use('App/Models/DaaModuleLog')
const Route                             = use('Route')
const CourseModule                      = use('App/Models/CourseModule')
const CourseModuleCompletion            = use('App/Models/CourseModuleCompletion')
const DaaJourneyCohortEnrol             = use('App/Models/DaaJourneyCohortEnrol')
const DaaJourney                        = use('App/Models/DaaJourney')
const DaaCourse                         = use('App/Models/DaaCourse')
const DaaCourseLog                      = use('App/Models/DaaCourseLog')
const DaaCourseModule                   = use('App/Models/DaaCourseModule')
const Course                            = use('App/Models/Course')
const User                              = use('App/Models/User')
const DaaFileExport                     = use('App/Models/DaaFileExport')
const Drive                             = use('Drive');
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const Database                          = use('Database')

class LearningHistoryController {
  constructor() {

  }

  async indexExport({ request, response, view, auth, params, session }) {
    await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
    await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
    let requestParams = {};

    const authUser = auth.user.toJSON()
    let datas     = await DaaModuleLog
                      .query()
                      .select('module_id', 'user_id','created_at')
                      .with('user', builder => {
                        builder.select('username'); //  select columns / pass array of columns
                      })
                      .with('module', builder => {
                        builder.select('created_at').where('visible,1'); //  select columns / pass array of columns
                      })
                      .with('module.course_module')
                      .with('module.course_module.course')
                      .with('module.course_module.course.journey')
                      .with('module.course_module.course.journey.cohort_enrols')
                      .whereNull('deleted_at')
                      .where('is_completed',1)
                      .groupBy('module_id', 'user_id' )
                      .orderBy('created_at', 'DESC')
                      .limit(100)
                      .fetch();


    //  datas.rows    = datas.rows.filter(item => {
    //     if(item.getRelated('module')){
    //         return item.getRelated('module').visible == 1 || item.getRelated('module').visible == '1' ;
    //     }
    //     else{
    //       return false;
    //     }

    // })



    return view.render('dashboard.learning_history.index_export',{ authUser : authUser,  datas : datas.rows , requestParams : requestParams})

  }
  async datatableExport({request, response, view, params, session}){
    let datas     = await DaaModuleLog
                      .query()
                      .select('module_id', 'user_id','created_at')
                      .with('user')
                      .with('module')
                      .with('module.course_module')
                      .with('module.course_module.course')
                      .with('module.course_module.course.journey')
                      .with('module.course_module.course.journey.cohort_enrols')
                      .whereNull('deleted_at')
                      .groupBy('module_id', 'user_id' )
                      .fetch();
    datas.rows    = datas.rows.filter(item => {

      return item.getRelated('module').visible == 1 || item.getRelated('module').visible == '1' ;
    })
    var result = Object.keys(datas).map((key) => [Number(key), datas[key]]);
    let valueDatatable = {
      draw            : 0,
      recordsTotal    : result[0][1].length,
      recordsFiltered : 10,
      data            : result[0][1]
    };



    return valueDatatable;
  }
  async indexFileExport({request, response, view, params, session, auth}){

    let requestParams = {};

    const authUser = auth.user.toJSON()
    const datas     = await  DaaFileExport
                      .query()
                      .with('user')
                      .where('type', 'export_learning_history')
                      .whereNull('deleted_at')
                      .fetch();


    for (let index in datas.rows) {
      //datas.rows[index].user = await User.query().where('id',datas.rows[index].userid).first();


    }

    return view.render('dashboard.learning_history.index_file_export',{ authUser : authUser,  datas : datas , requestParams : requestParams})

  }
  async datatableFileExport({request, response, view, params, session}){

    const datas     = await  DaaFileExport
                      .query()
                      .with('user')
                      .where('type', 'export_learning_history')
                      .whereNull('deleted_at')
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
  async export({request, response, view, params, session, auth}){

    let requestParams = {};

    const authUser = auth.user.toJSON()

    let datas     = await DaaModuleLog
                      .query()
                      .select('module_id', 'user_id','created_at')
                      .with('user', builder => {
                        builder.select('username'); //  select columns / pass array of columns
                      })
                      .with('module', builder => {
                        builder.select('created_at').where('visible',1); //  select columns / pass array of columns
                      })
                      .with('module.course_module')
                      .with('module.course_module.course')
                      .with('module.course_module.course.journey')
                      .with('module.course_module.course.journey.cohort_enrols')
                      .whereNull('deleted_at')
                      .where('is_completed',1)
                      .groupBy('module_id', 'user_id' )
                      .orderBy('created_at', 'DESC')
                      .limit(100)
                      .fetch();


    //  datas.rows    = datas.rows.filter(item => {
    //     if(item.getRelated('module')){
    //         return item.getRelated('module').visible == 1 || item.getRelated('module').visible == '1' ;
    //     }
    //     else{
    //       return false;
    //     }

    // })

    let splitter = "|";
    let csvtext  = "";

    if(datas.rows.length > 0){
      csvtext  += 'METADATA' + splitter;
      csvtext  += 'LearningRecord' + splitter;
      csvtext  += 'SourceSystemOwner' + splitter;
      csvtext  += 'SourceSystemId' + splitter;
      csvtext  += 'LearningRecordEffectiveStartDate' + splitter;
      csvtext  += 'LearningRecordEffectiveEndDate' + splitter;
      csvtext  += 'LearningItemType' + splitter;
      csvtext  += 'LearningItemNumber' + splitter;
      csvtext  += 'AssignmentType' + splitter;
      csvtext  += 'AssignmentSubType' + splitter;
      csvtext  += 'AssignedByPersonNumber' + splitter;
      csvtext  += 'AssignmentAttributionType' + splitter;
      csvtext  += 'AssignmentNumber' + splitter;
      csvtext  += 'AssignmentAttributionNumber' + splitter;
      csvtext  += 'AssignmentAttributionCode' + splitter;
      csvtext  += 'LearnerNumber' + splitter;
      csvtext  += 'LearningRecordNumber' + splitter;
      csvtext  += 'LearningRecordStatus' + splitter;
      csvtext  += 'LearningRecordStartDate' + splitter;
      csvtext  += 'LearningRecordDueDate' + splitter;
      csvtext  += 'LearningRecordWithdrawnDate' + splitter;
      csvtext  += 'LearningRecordValidFromDate' + splitter;
      csvtext  += 'LearningRecordCompletionDate' + splitter;
      csvtext  += 'LearningRecordTotalActualEffort' + splitter;
      csvtext  += 'LearningRecordTotalActualEffortUOM' + splitter;
      csvtext  += 'LearningRecordReasonCode' + splitter;
      //csvtext  += 'LearningRecordComments' + splitter;
      csvtext  += 'LearningRecordComments';
      csvtext  += "\n";
      for (let index in datas.rows) {

        csvtext += "MERGE" + splitter;
        csvtext += "Learning Record" + splitter;
        csvtext += "HCMS" + splitter;
        csvtext += "PK_VR_"+datas.rows[index].module_id+"_"+datas.rows[index].user_id + splitter;
        csvtext += datas.rows[index].getRelated("module") ?  datas.rows[index].getRelated("module").created_at ? datas.rows[index].getRelated("module").created_at.getFullYear()+"/"+(datas.rows[index].getRelated("module").created_at.getMonth()+1)+"/"+ datas.rows[index].getRelated("module").created_at.getDate() : "" : "" +  splitter;
        csvtext += "4712/12/31" + splitter;
        csvtext += "ORA_LEGACY" + splitter;
        csvtext += "PK_VR_"+datas.rows[index].module_id + splitter;
        csvtext += "ORA_REQUIRE_ASSIGNMENT" + splitter;
        csvtext += "ORA_EVT_SUBT_ADMIN" + splitter;
        csvtext += "3016645" + splitter;
        csvtext += "ORA_SPECIALIST" + splitter;
        csvtext += "PK_VR_"+datas.rows[index].module_id+"_"+datas.rows[index].user_id + splitter;
        csvtext += datas.rows[index].getRelated("user") ? datas.rows[index].getRelated("user").username.replace("cn", "") : "" + splitter;
        csvtext += "CIMB_WLF_LEARNING" + splitter;
        csvtext += datas.rows[index].getRelated("user") ? datas.rows[index].getRelated("user").username.replace("cn", "") : "" + splitter;
        csvtext += "PK_VR_"+datas.rows[index].module_id+"_"+datas.rows[index].user_id + splitter;
        csvtext += "ORA_ASSN_REC_COMPLETE" + splitter;
        csvtext += datas.rows[index].getRelated("module") ? datas.rows[index].getRelated("module").created_at ? datas.rows[index].getRelated("module").created_at.getFullYear()+"/"+(datas.rows[index].getRelated("module").created_at.getMonth()+1)+"/"+ datas.rows[index].getRelated("module").created_at.getDate() : "" : "" + splitter;
        csvtext += "4712/12/31" + splitter;
        csvtext += "" + splitter;
        csvtext += datas.rows[index].getRelated("module") ?  datas.rows[index].getRelated("module").created_at ? datas.rows[index].getRelated("module").created_at.getFullYear()+"/"+(datas.rows[index].getRelated("module").created_at.getMonth()+1)+"/"+ datas.rows[index].getRelated("module").created_at.getDate() : "" : ""+ splitter;
        csvtext += datas.rows[index].created_at ? datas.rows[index].created_at.getFullYear()+"/"+(datas.rows[index].created_at.getMonth()+1)+"/"+ datas.rows[index].created_at.getDate() : ""  + splitter;
        csvtext += "" + splitter;
        csvtext += "" + splitter;
        csvtext += "ORA_SPEC_COMPLT_ELSEWHERE" + splitter;
        //csvtext += $row->LearningRecordComments + splitter;
        csvtext += "Completed";
        csvtext += "\n";
      }
    }else{
      csvtext += 'No Data' + splitter;
    }
    const today       = new Date();
    const date        = today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate();
    const time        = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds()+'_'+today.getMilliseconds();
    const dateTime    = date+'__'+time;
    let filename = "export/export_learning_history_"+dateTime+".dat";



    await Drive.put(filename, Buffer.from(csvtext));
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = "export_learning_history_"+dateTime+".dat";
    daaFileExport.full_path   = Helpers.publicPath()+"/"+filename;
    daaFileExport.type        = "export_learning_history";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(Helpers.publicPath()+"/"+filename);

  }
  async downloadFileExport({request, response, view, params, session}){
    let id =  request.input('id');

    let daaFileExport = await DaaFileExport.query().with('user').where('id',id).first();
    return response.download(daaFileExport.full_path);
  }
}

module.exports = LearningHistoryController
