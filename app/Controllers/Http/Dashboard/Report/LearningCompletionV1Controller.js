'use strict'
const Route                        = use('Route')
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
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const UploadHelper                 = use('App/Controllers/Http/Helper/UploadFileController')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')
const Database = use('Database')
const ExportService = use('App/Services/ExportService')
const DaaFileExport                     = use('App/Models/DaaFileExport')
const Drive = use('Drive');
const Helpers = use('Helpers');

class LearningCompletionV1Controller {

    async report({ view, auth, response, request, session, params }) {


    let directorate = await UserInfoDatum.query().where('data', request.input('directorateid')).where('fieldid', 11).first();
    let division = await UserInfoDatum.query().where('data', request.input('subdirectorateid')).where('fieldid', 2).first();
    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');
    let moduleType = request.input('module_type');
    let completionStartDate = request.input('completion_start_date');
    let completionEndDate = request.input('completion_end_date');
    let moduleIds = [];

    let journey = {};
    journey = await DaaJourney.query().where('id', request.input('journey_id')).first();
    let programName = "Program : ";
    if (journey) {
      programName = "Program : " + journey.name;
    }
    let reportType = "Report Type : Learning Completions - 1 ";

    let dataCourses = await DaaCourse.query().with('course_modules',builder => {
        builder.with('module', builderChild => {
            if ('0' != moduleType && 0 != moduleType && '' != moduleType) {
                builderChild.whereNull('deleted_at').where('visible',1).where('module_type', moduleType);
            }
            else {
                builderChild.whereNull('deleted_at').where('visible',1);
            }

      }).whereNull('deleted_at'); //  select columns / pass array of columns
    }).where('visible',1).where('journey_id', request.input('journey_id')).whereNull('deleted_at').fetch();
    let tableHeadAdditional = {};
    let paramsExport = {};
    paramsExport.table_heads_end = [];
    paramsExport.datas = [];
    let totalEnrolledText = "Total Enrolled : ";
    let totalCompletedText = "Total Completed : ";
    let totalIncompletedText = "Total Incompleted : ";
    paramsExport.filename = "Learning - Completions - 1";
    paramsExport.table_heads_additional = [];
    let rowValues = [];





    //paramsExport.datas = getResultEnrol[0];
    paramsExport.sheetname = "Sheet1 -1";


    paramsExport.table_heads = [
        { header: "No", key: "no", width: 5 },
        { header: "NIP", key: "nip", width: 10 },
        { header: "Name", key: "name", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "Directorate", key: "directorate", width: 50 },
        { header: "Sub Directorate", key: "sub_directorate", width: 50 },
        { header: "Position", key: "position", width: 50 },

    ];

    for (let i = 0; i < dataCourses.rows.length; i++) {

      tableHeadAdditional = {};
      tableHeadAdditional.header = dataCourses.rows[i].name,
      tableHeadAdditional.child = [];
      if(dataCourses.rows[i].getRelated('course_modules').rows.length > 0){
        for (let j = 0; j < dataCourses.rows[i].getRelated('course_modules').rows.length; j++) {

          if (dataCourses.rows[i].getRelated('course_modules').rows[j].getRelated('module')) {
              tableHeadAdditional.child.push({
                  header: dataCourses.rows[i].getRelated('course_modules').rows[j].getRelated('module').fullname,
              });
              moduleIds.push(dataCourses.rows[i].getRelated('course_modules').rows[j].getRelated('module').id)
          }

        }

        if(tableHeadAdditional.child.length > 0){
          paramsExport.table_heads_additional.push(tableHeadAdditional);
        }

      }

    }
    let totModuleku=0;
    let activitystatus = "";
    let score =0;
		let sama=false;
		let completed=0;
		let incompleted=0;
		let competent=0;
		let percentageCompleteModule=0;
    let counter = 0;
    let datasCompletionByUserModule = [];
    let getResultEnrol = await Database.connection('db_reader').raw(this.sqlUserEnrolledData(request.input('journey_id'),request.input('directorateid'),request.input('subdirectorateid'),enrolStartDate,enrolEndDate));

    await getResultEnrol[0].forEach(async (data) => {
      counter++;
      rowValues = [
        counter,
        data.nip.toUpperCase(),
        data.fullname.toUpperCase(),
        data.email,

        data.directorate.toUpperCase(),
        data.subdirectorate.toUpperCase(),
        data.position.toUpperCase(),
      ];
      for (let i = 0; i < moduleIds.length; i++) {
        datasCompletionByUserModule = await Database.connection('db_reader').raw(this.sqlCompletionModuleByCoursePerUser(data.user_id, request.input('journey_id'), moduleIds[i], moduleType, completionStartDate, completionEndDate));
        if(datasCompletionByUserModule[0].length > 0){
          for (let j = 0; j < datasCompletionByUserModule[0].length; j++) {

							if(!datasCompletionByUserModule[0][j].score){
                score=0;
              }

							activitystatus='Incompleted';
							if(1 == datasCompletionByUserModule[0][j].is_completed || '1' == datasCompletionByUserModule[0][j].is_completed){
								activitystatus='Completed';
								completed++;
								sama=true;
							}

							if(1 == datasCompletionByUserModule[0][j].is_competent || '1' == datasCompletionByUserModule[0][j].is_competent){
								activitystatus='Competent';
								competent++;
								sama=true;
							}

							if(!sama){
								activitystatus='Incompleted';
								incompleted++;
							}


              rowValues.push(activitystatus+" "+datasCompletionByUserModule[0][j].tglnya+" ("+score+")")

							totModuleku++;

          }
        }

      }
      rowValues.push((completed/totModuleku*100)+"%");


      paramsExport.datas.push({ row_values: rowValues });
    });
    if (Number.isNaN(completed/totModuleku) ) {
      totalCompletedText += completed + " (" + 0 + "%" + ")";
    }
    else {
      
      totalCompletedText += completed +" ("+(completed/totModuleku*100)+"%"+")";
    }
    if (Number.isNaN(incompleted/totModuleku) ) {
      totalIncompletedText += incompleted+" ("+0+"%"+")";
    }
    else {
      totalIncompletedText += incompleted+" ("+(incompleted/totModuleku*100)+"%"+")";
    }
      
    totalEnrolledText += getResultEnrol[0].length;
    
    

    paramsExport.headers = [
      reportType,
      programName,
      "Enrollment Range : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
      "Completion Range : " + completionStartDate.split('-').join('/') + " - " + completionEndDate.split('-').join('/'),
      totalEnrolledText,
      totalCompletedText,
      totalIncompletedText,
      ""
    ];

    paramsExport.table_heads_end.push({
      header: "Completions",
      width: 30,

    });






    //console.log(paramsExport);

    let result =  await ExportService.ExportJourneyCourseModuleCompletionsToExcel(paramsExport);
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = result.filename;
    daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
    daaFileExport.type        = "export_journey_learning_completions";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(result.fullpath, result.filename);
  }

  sqlUserEnrolledData(journeyId, directorateId, subDirectorateId, startdate, enddate){
    let sql = "SELECT DISTINCT(u.id) AS user_id "+
              ", u.username AS nip "+
              ", CONCAT(u.firstname,' ', u.lastname) AS fullname "+
              ", u.email "+
              ", uid1.data AS directorate "+
              ", uid2.data AS subdirectorate "+
              ", uid3.data AS position "+
              "FROM `user` u "+
              "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL "+
              "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL "+
              "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id AND djce.deleted_at IS NULL "+
              "INNER JOIN user_info_data uid1 ON uid1.`userid`=u.id AND uid1.`fieldid`=11 "+
              "INNER JOIN user_info_data uid2 ON uid2.`userid`=u.id AND uid2.`fieldid`=2 "+
              "INNER JOIN user_info_data uid3 ON uid3.`userid`=u.id AND uid3.`fieldid`=7 "+
              "WHERE dj.visible=1 "+
              "AND u.deleted=0 "+
              "AND u.deleted_at IS NULL "+
              "AND u.suspended=0 "+
              "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+
              "AND DATE(djce.created_at) BETWEEN '"+startdate+"' AND '" +enddate +"' "+
              "AND dj.id=" + journeyId +" ";
              if('0' != directorateId && '' != directorateId && 0 != directorateId) {
                sql += " AND uid1.data= " + "'"+ directorateId+ "' ";
              }
              if ('0' != subDirectorateId && '' != subDirectorateId  && 0 != subDirectorateId ) {
                sql += " AND uid2.data= " + "'"+ subDirectorateId + "' ";
              }

    return sql;
  }

  sqlCompletionModuleByCoursePerUser(userId, journeyId, courseId, moduleType, startCompletionDateRange, endCompletionDateRange){
      let sql = "SELECT cm.userid "+
                ", dcm.module_id "+
                ", c.fullname as module_name "+
                ", IF(ex.created_at IS NULL "+
                " ,'Incompleted' "+
                "  , IF(ex.is_completed=1, 'Completed', 'Competent')) AS statusnya "+
                ", IF(ex.created_at IS NULL,'', ex.created_at) tglnya "+
                ", ex.score "+
                ", ex.is_completed "+
                ", ex.is_competent "+
              "FROM daa_course_modules dcm "+
              "JOIN daa_courses dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL "+
              "JOIN daa_journeys dj ON dj.id = dc.journey_id AND dj.deleted_at IS NULL "+
              "JOIN daa_journey_cohort_enrols djce on djce.journey_id = dj.id AND djce.deleted_at IS NULL "+
              "JOIN cohort_members cm ON cm.cohortid=djce.cohort_id AND cm.deleted_at IS NULL "+
              "JOIN course c ON c.id = dcm.module_id  AND c.deleted_at IS NULL "+
              "LEFT JOIN ( "+
                "SELECT dml.id, dml.user_id, dml.module_id, dml.created_at, dml.score, dml.is_completed, dml.is_competent "+
                "FROM daa_module_logs dml "+
                "WHERE dml.user_id= "+userId+" "+
                "AND cm.deleted_at IS NULL "+
                "AND dml.module_id IN( "+
                  "SELECT c.id "+
                  "FROM daa_course_modules dcm "+
                  "INNER JOIN course c ON c.id = dcm.module_id AND c.deleted_at IS NULL "+
                  "INNER JOIN daa_courses dc ON dc.id = dcm.course_id AND dc.deleted_at IS NULL "+
                  "INNER JOIN daa_journeys dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
                  "WHERE c.visible=1 ";
                if('0'!= moduleType && ''!= moduleType && 0!= moduleType){
                  sql += " AND c.module_type="+moduleType+ " ";
                }

            sql+= "AND dc.visible=1 "+
                  "AND dcm.deleted_at IS NULL "+
                  "AND dj.id="+journeyId+" "+
                  "AND dc.id="+courseId+" "+
                ") ";
            if(0!=startCompletionDateRange && '0'!=startCompletionDateRange && '' != 0!=startCompletionDateRange && 0!=endCompletionDateRange && '0'!=endCompletionDateRange && '' != 0!=endCompletionDateRange){
                sql += " AND DATE(dml.created_at) BETWEEN '"+startCompletionDateRange+"' AND '"+endCompletionDateRange+"' ";
            }


              "GROUP BY dml.module_id "+
              ") ex ON ex.module_id = dcm.module_id "+
              "WHERE dj.visible=1 AND dc.visible=1 AND c.visible=1 ";
              if('0'!= moduleType && ''!= moduleType && 0!= moduleType){
                sql += " AND c.module_type="+moduleType+ " ";
              }
              sql += "AND dcm.deleted_at IS NULL "+
              "AND dj.id="+journeyId+" "+
              "AND dc.id="+courseId+" "+
              "AND cm.userid="+userId+" "+
              "GROUP BY dcm.module_id ORDER BY dcm.id ASC ";
  }
}

module.exports = LearningCompletionV1Controller
