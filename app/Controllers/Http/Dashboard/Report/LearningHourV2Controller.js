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

class LearningHourV2Controller {

  async report({ view, auth, response, request, session, params }) {


    let directorate = await UserInfoDatum.query().where('data', request.input('directorateid')).where('fieldid', 11).first();
    let division = await UserInfoDatum.query().where('data', request.input('subdirectorateid')).where('fieldid', 2).first();
    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');
    let completionStartDate = request.input('completion_start_date');
    let completionEndDate = request.input('completion_end_date');
    let sortBy = request.input('sort_by');
    let multiJourneyId =  request.input('multi_journey_id');
    let multiCourseId =  request.input('multi_course_id');
    let multiModuleId = request.input('multi_module_id');


    let datasJourney = {
      rows : []
    }
    if(multiJourneyId != ""){
      datasJourney = await DaaJourney.query().whereIn('id', multiJourneyId.split(",")).orderBy('id').fetch();
    }
    let datasCourse = {
      rows : []
    }
    if(multiCourseId != ""){
      datasCourse = await DaaCourse.query().with('journey').whereIn('id', multiCourseId.split(",")).orderBy('id').fetch();
    }
    let datasModule = {
      rows : []
    }
    if(multiModuleId != ""){
      datasModule = await DaaCourseModule.query().with('course').with('module').whereIn('module_id', multiModuleId.split(",")).orderBy('module_id').fetch();
    }


    let status = "Status : ";




    let paramsExport = {};

    paramsExport.filename = "Learning_Hours_2_";

    let sqlEnrollmentData = "SELECT DISTINCT(u.id) AS user_id " +
                            ", u.username AS nip " +
                            ", CONCAT(u.firstname,' ', u.lastname) AS fullname " +
                            ", u.email " +
                            ", uid1.data AS directorate " +
                            ", uid2.data AS subdirectorate " +
                            "FROM `user` u  " +
                            "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL " +
                            "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL " +
                            "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL " +
                            "INNER JOIN user_info_data uid1 ON uid1.`userid`=u.id AND uid1.`fieldid`=11 " +
                            "INNER JOIN user_info_data uid2 ON uid2.`userid`=u.id AND uid2.`fieldid`=2 " +
                            "WHERE dj.visible=1 AND u.deleted_at IS NULL " +
                            "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') " +
                            "AND DATE(djce.created_at) BETWEEN '" + enrolStartDate + "' AND '" + enrolEndDate + "' " +
                            "AND dj.id IN (" +  multiJourneyId +") ";
                            if('0' != request.input('directorateid')) {
                              sqlEnrollmentData += " AND uid1.data= " + "'"+ request.input('directorateid')+ "' ";
                            }
                            if ('0' != request.input('subdirectorateid')) {
                              sqlEnrollmentData += " AND uid2.data= " + "'"+ request.input('subdirectorateid') + "' ";
                            }
    if('activeUser'==sortBy){
          sqlEnrollmentData +=" AND u.deleted=0 AND u.suspended =0 AND u.deleted_at IS  NULL";

          paramsExport.filename += "_Active";
          status += "Active";
     }

     else if('inactiveUser'==sortBy){
          sqlEnrollmentData +=" AND u.deleted=1 OR u.suspended =1 AND u.deleted_at IS NOT NULL";
          paramsExport.filename += "_Inactive";
          status += "Inactive";
     }
     else{
          sqlEnrollmentData +=" "
          paramsExport.filename += "_All";
          status += "All";
     }
    let getResultEnrol = await Database.connection('db_reader').raw(sqlEnrollmentData);
    let reportType = "Report Type : Learning Hours - 2 ";
    let remark = "Remark : ";
    let arrJourneyCourseModuleListHeaders = [];





    paramsExport.headers = [
        reportType,
        "Enrollment Range : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
        "Completion Range : " + completionStartDate.split('-').join('/') + " - " + completionEndDate.split('-').join('/'),
        status,
    ];
    paramsExport.table_heads_additional = [

    ];
    let tableHeadAdditional = {};
    if(datasJourney.rows.length > 0){
      remark += datasJourney.rows.length+" Program, ";
      arrJourneyCourseModuleListHeaders.push("Program Name :");
      for (let i = 0; i < datasJourney.rows.length; i++) {
        arrJourneyCourseModuleListHeaders.push(i+1+" "+datasJourney.rows[i].name);
        tableHeadAdditional = {};
        tableHeadAdditional.journey_header = datasJourney.rows[i].name,
        tableHeadAdditional.journey_attribute_header  = ["Learning Hours","Actual Durations", "Completions"],
        paramsExport.table_heads_additional.push(tableHeadAdditional);

      }


    }
    else{
      remark += "All Program, ";

    }
    if(datasCourse.rows.length > 0){
      remark += datasCourse.rows.length+" Course, ";
      arrJourneyCourseModuleListHeaders.push("Course Name :");
      for (let i = 0; i < datasCourse.rows.length; i++) {
        arrJourneyCourseModuleListHeaders.push(i+1+" "+datasCourse.rows[i].name +" ("+datasCourse.rows[i].getRelated('journey').name+") ");
      }

    }
    else{
      remark += "All Course, ";

    }
    if(datasModule.rows.length > 0){
      remark += datasModule.rows.length+" Module ";
      arrJourneyCourseModuleListHeaders.push("Module Name :");
      for (let i = 0; i < datasModule.rows.length; i++) {
        if(datasModule.rows[i].getRelated('module') && datasModule.rows[i].getRelated('course')){
          arrJourneyCourseModuleListHeaders.push(i+1+" "+datasModule.rows[i].getRelated('module').fullname +" ("+datasModule.rows[i].getRelated('course').name+") ");
        }

      }
    }
    else{
      remark += "All Module ";
      arrJourneyCourseModuleListHeaders.push("Module Name :");

    }

    paramsExport.headers.push(remark);
    //console.log(arrJourneyCourseModuleListHeaders);
    paramsExport.headers = paramsExport.headers.concat(arrJourneyCourseModuleListHeaders);
    paramsExport.headers.push(" ");



    // paramsExport.datas = getResultEnrol[0];
    paramsExport.sheetname = "Sheet1";


    paramsExport.table_heads = [
        { main_header: "No", key: "no", width: 5, main_header_width: 5 },

        { main_header: "NIP", key: "nip", width: 20, main_header_width: 20 },
        { main_header: "Name", key: "name", width: 50, main_header_width: 50 },

        { main_header: "Directorate", key: "directorate", width: 50, main_header_width: 50 },
        { main_header: "Sub Directorate", key: "division", width: 50, main_header_width: 50 },

    ];
    paramsExport.datas = [];
    paramsExport.counter = 0;
    let rowValues = [];
    let sqlCheckEnrolled = "";
    let resultCheckEnrol = [];
    let resultCompletionActualdateDuration = {};
    if(datasJourney.rows.length > 0 && datasCourse.rows.length == 0 && datasModule.rows.length == 0){

      await getResultEnrol[0].forEach((data) => {
        paramsExport.counter++;
        rowValues = [
          paramsExport.counter,
          data.nip.toUpperCase(),
          data.fullname.toUpperCase(),
          data.directorate.toUpperCase(),
          data.subdirectorate.toUpperCase(),
        ];
        for (let i = 0; i < datasJourney.rows.length; i++) {
          sqlCheckEnrolled =  "SELECT DISTINCT(u.id) AS user_id "+
                                  "FROM user u "+
                                  "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted  IS NULL "+
                                  "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid djce IS NULL"+
                                  "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id dj.deleted_at IS NULL "+
                                  "WHERE dj.visible=1 AND u.deleted_at IS NULL"+
                                  "AND DATE(djce.created_at) BETWEEN '"+enrolStartDate+"' AND '"+enrolEndDate+"' "+
                                  "AND dj.id ="+datasJourney.rows[i].id+" AND u.id="+data.user_id;
         resultCheckEnrol = Database.connection('db_reader').raw(sqlCheckEnrolled);
         console.log(resultCheckEnrol);
         if(resultCheckEnrol.length > 0){
          if (resultCheckEnrol[0].length > 0) {


            for (let i = 0; i < datasJourney.rows.length; i++) {
              data.getlearningHourJourney = this.getLearningHourJourney(datasJourney[i].id, data.user_id, completionStartDate, completionEndDate);
              resultCompletionActualdateDuration = this.getCompletionLearningHourActualDateMultiJourney(data.getlearningHourJourney[0], data, datasJourney[i].id);
              rowValues.push(resultCompletionActualdateDuration.totLearningHours, resultCompletionActualdateDuration.totActualDuration, resultCompletionActualdateDuration.percentageCompleteModule + "%" )
            }

          }
          else{
            continue;
          }
         }

        }

        paramsExport.datas.push({ row_values: rowValues });




      });

    }
    else if(datasJourney.rows.length > 0 && datasCourse.rows.length > 0 && datasModule.rows.length == 0){
     await  getResultEnrol[0].forEach((data) => {
        paramsExport.counter++;
        rowValues = [
          paramsExport.counter,
          data.nip.toUpperCase(),
          data.fullname.toUpperCase(),
          data.directorate.toUpperCase(),
          data.subdirectorate.toUpperCase(),
        ];
        for (let i = 0; i < datasJourney.rows.length; i++) {
          sqlCheckEnrolled =  "SELECT DISTINCT(u.id) AS user_id "+
                                  "FROM user u "+
                                  "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted  IS NULL "+
                                  "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid djce IS NULL"+
                                  "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id dj.deleted_at IS NULL "+
                                  "WHERE dj.visible=1 AND u.deleted_at IS NULL"+
                                  "AND DATE(djce.created_at) BETWEEN '"+enrolStartDate+"' AND '"+enrolEndDate+"' "+
                                  "AND dj.id ="+datasJourney.rows[i].id+" AND u.id="+data.user_id;
          resultCheckEnrol =    Database.connection('db_reader').raw(sqlCheckEnrolled);
          console.log(resultCheckEnrol);
          if(resultCheckEnrol.length > 0){
            if(resultCheckEnrol[0].length > 0){
              for (let i = 0; i < datasJourney.rows.length; i++) {
                data.getlearningHourCourse = this.getLearningHourCourse(datasJourney[i].id, multiCourseId.split(","),data.user_id, completionStartDate, completionEndDate);
                resultCompletionActualdateDuration = this.getCompletionLearningHourActualDateMultiCourse(data.getlearningHourCourse[0], data, datasJourney[i].id);
                rowValues.push(resultCompletionActualdateDuration.totLearningHours, resultCompletionActualdateDuration.totActualDuration, resultCompletionActualdateDuration.percentageCompleteModule + "%");
              }
            }
            else{
              continue;
            }
          }

        }

        paramsExport.datas.push({ row_values: rowValues });

      });
    }
    else if(datasJourney.rows.length > 0 && datasCourse.rows.length > 0 && datasModule.rows.length > 0){
     await getResultEnrol[0].forEach((data) => {
        paramsExport.counter++;
        rowValues = [
          paramsExport.counter,
          data.nip.toUpperCase(),
          data.fullname.toUpperCase(),
          data.directorate.toUpperCase(),
          data.subdirectorate.toUpperCase(),
        ];
        for (let i = 0; i < datasJourney.rows.length; i++) {
          sqlCheckEnrolled =  "SELECT DISTINCT(u.id) AS user_id "+
                                  "FROM user u "+
                                  "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted  IS NULL "+
                                  "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid djce IS NULL"+
                                  "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id dj.deleted_at IS NULL "+
                                  "WHERE dj.visible=1 AND u.deleted_at IS NULL"+
                                  "AND DATE(djce.created_at) BETWEEN '"+enrolStartDate+"' AND '"+enrolEndDate+"' "+
                                  "AND dj.id ="+datasJourney.rows[i].id+" AND u.id="+data.user_id;
          resultCheckEnrol =    Database.connection('db_reader').raw(sqlCheckEnrolled);
          console.log(resultCheckEnrol);
          if(resultCheckEnrol.length > 0){
            if(resultCheckEnrol[0].length > 0){
              for (let i = 0; i < datasJourney.rows.length; i++) {
                data.getlearningHourModule = this.getLearningHourModule(datasJourney[i].id, multiModuleId.split(","),data.user_id, completionStartDate, completionEndDate);
                resultCompletionActualdateDuration = this.getCompletionLearningHourActualDateMultiCourse(data.getlearningHourModule[0], data, datasJourney[i].id);
                rowValues.push(resultCompletionActualdateDuration.totLearningHours, resultCompletionActualdateDuration.totActualDuration, resultCompletionActualdateDuration.percentageCompleteModule + "%");
              }
            }
            else{
              continue;
            }
          }

        }

        paramsExport.datas.push({ row_values: rowValues });

      });
    }





    let result =  await ExportService.ExportLearningHours2ToExcel(paramsExport);
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = result.filename;
    daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
    daaFileExport.type        = "export_learning_hours_2";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(result.fullpath, result.filename);



  }

  getLearningHourJourney(journeyId,userId,startCompletionDate,endCompletionDate){

    let query = "SELECT dc.id AS course_id "+
		           ", u.username AS nip "+
						   ", list_module.fullname AS module_name "+
						   ", list_module.learning_effort "
						   ", IF(scorm_durasi.value IS NULL, '00:00:00', TIME_FORMAT(scorm_durasi.value, \"%H:%i:%s\")) AS actual_duration "+
						   ", IF(dml.module_id IS NULL, '0%', '100%') AS completions "+
						   ", IF(dml.created_at IS NULL, '0', dml.created_at) AS completion_date "+
					"FROM `user` u "+
					"JOIN cohort_members cm ON cm.userid=u.id  "+
					"JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid "+
					"JOIN daa_journeys dj ON dj.id=djce.journey_id "+
					"JOIN ( "+
						"SELECT c.id, c.fullname, c.`learning_effort`, dj.id AS journey_id "+
						"FROM course c "+
						"JOIN daa_course_modules dcm ON dcm.module_id=c.id "+
						"JOIN `daa_courses` dc ON dc.id= dcm.`course_id`  "+
						"JOIN daa_journeys dj ON dj.id=dc.`journey_id` "+
						"WHERE dj.id= "+journeyId+" "+
						"AND dj.visible=1 "+
						"AND dc.visible=1 "+
					") list_module ON list_module.journey_id= dj.id "+
					"JOIN `daa_course_modules` dcm ON dcm.module_id=list_module.id "+
					"JOIN `daa_courses` dc ON dc.id= dcm.course_id "+
					"JOIN scorm s ON s.course=list_module.id "+
					"LEFT JOIN daa_module_logs dml ON dml.module_id=list_module.id AND dml.user_id=u.id "+
					"LEFT JOIN ( "+
						"SELECT sst1.* "+
						"FROM scorm_scoes_track sst1 "+
						"INNER JOIN ( "+
							"SELECT sst.scormid , MAX(sst.attempt) AS last_attempt "+
							"FROM `scorm_scoes_track` sst "+
							"JOIN scorm s ON s.id=sst.scormid "+
							"JOIN course c ON c.id=s.course "+
							"JOIN daa_course_modules dcm ON dcm.module_id=c.id "+
							"JOIN `daa_courses` dc ON dc.id= dcm.`course_id` "+
							"JOIN daa_journeys dj ON dj.id=dc.`journey_id` "+
							"WHERE sst.userid="+userId+" "+
							"AND dj.id="+journeyId+" "+
							"AND dj.visible=1 "+
							"AND dc.visible=1 "+
							"AND sst.element='cmi.core.lesson_status' "+
							"AND sst.value='passed' "+
							"GROUP BY sst.scormid "+
						")t2 ON t2.scormid = sst1.scormid AND sst1.attempt = t2.last_attempt "+
						"JOIN scorm s ON s.id=sst1.scormid "+
						"JOIN course c ON c.id=s.course "+
						"JOIN daa_course_modules dcm ON dcm.module_id=c.id "+
						"JOIN `daa_courses` dc ON dc.id= dcm.`course_id` "+
						"JOIN daa_journeys dj ON dj.id=dc.`journey_id` "+
						"WHERE sst1.userid="+userId+" "+
						"AND dj.id="+journeyId+" "+
						"AND dj.visible=1 "+
						"AND dc.visible=1 "+
						"AND sst1.element='cmi.core.session_time' "+
					") scorm_durasi ON scorm_durasi.scormid=s.id AND scorm_durasi.userid=u.id "+
					"WHERE u.id="+userId+" "+
					"AND dj.id="+journeyId+" "+
					"AND dj.visible=1 AND DATE(dml.created_at) BETWEEN '"+startCompletionDate+"' AND '"+endCompletionDate+"' "
					"GROUP BY list_module.id "+
					"ORDER BY dml.created_at";
    let getDataResult =  Database.connection('db_reader').raw(query);
    return getDataResult;

  }

  getLearningHourCourse(journeyId,courseIds,userId,startCompletionDate,endCompletionDate){
    let query = "SELECT dc.id AS course_id "+
		           ", u.username AS nip "+
						   ", list_module.fullname AS module_name "+
						   ", list_module.learning_effort "
						   ", IF(scorm_durasi.value IS NULL, '00:00:00', TIME_FORMAT(scorm_durasi.value, \"%H:%i:%s\")) AS actual_duration "+
						   ", IF(dml.module_id IS NULL, '0%', '100%') AS completions "+
						   ", IF(dml.created_at IS NULL, '0', dml.created_at) AS completion_date "+
					"FROM `user` u "+
					"JOIN cohort_members cm ON cm.userid=u.id  AND cm.deleted_at IS NULL "+
					"JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL "+
					"JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL "+
					"JOIN ( "+
						"SELECT c.id, c.fullname, c.`learning_effort`, dj.id AS journey_id "+
						"FROM course c "+
						"JOIN daa_course_modules dcm ON dcm.module_id=c.id AND dcm.deleted_at IS NULL "+
						"JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND dc.deleted_at IS NULL "+
						"JOIN daa_journeys dj ON dj.id=dc.`journey_id` AND dj.deleted_at IS NULL "+
						"WHERE dj.id="+journeyId+" "+
						"AND dj.visible=1 AND c.deleted_at IS NULL "+
						"AND dc.id IN ("+courseIds+") AND dc.visible=1 "+
					") list_module ON list_module.journey_id= dj.id "+
					"JOIN scorm s ON s.course=list_module.id "+
					"LEFT JOIN daa_module_logs dml ON dml.module_id=list_module.id AND dml.user_id=u.id AND dml.deleted_at IS NULL "+
					"LEFT JOIN ( "+
						"SELECT sst1.* "+
						"FROM scorm_scoes_track sst1 "+
						"INNER JOIN ( "+
							"SELECT sst.scormid , MAX(sst.attempt) AS last_attempt "+
							"FROM `scorm_scoes_track` sst "+
							"JOIN scorm s ON s.id=sst.scormid AND s.deleted_at IS NULL "+
							"JOIN course c ON c.id=s.course AND c.deleted_at IS NULL "+
							"JOIN daa_course_modules dcm ON dcm.module_id=c.id AND dcm.deleted_at IS NULL "+
							"JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND dc.deleted_at IS NULL "+
							"JOIN daa_journeys dj ON dj.id=dc.`journey_id` AND dj.deleted_at IS NULL"+
							"WHERE sst.userid="+userId+" "+
							"AND dj.id="+journeyId+" "+
							"AND dj.visible=1 AND sst.deleted_at IS NULL"+
							"AND dc.id IN ("+courseIds+") AND dc.visible=1 "+
							"AND sst.element='cmi.core.lesson_status' "+
							"AND sst.value='passed' "+
							"GROUP BY sst.scormid "+
						")t2 ON t2.scormid = sst1.scormid AND sst1.attempt = t2.last_attempt "+
						"JOIN scorm s ON s.id=sst1.scormid "+
						"JOIN course c ON c.id=s.course AND c.deleted_at IS NULL "+
						"JOIN daa_course_modules dcm ON dcm.module_id=c.id  AND  dcm.deleted_at IS NULL "+
						"JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND  dc.deleted_at IS NULL "+
						"JOIN daa_journeys dj ON dj.id=dc.`journey_id` AND  dj.deleted_at IS NULL "+
						"WHERE sst1.userid="+userId+" "+
						"AND dj.id="+journeyId+" "+
						"AND dj.visible=1 "+
						"AND dc.id IN ("+courseIds+") AND dc.visible=1 "+
						"AND sst1.element='cmi.core.session_time' "+
					") scorm_durasi ON scorm_durasi.scormid=s.id AND scorm_durasi.userid=u.id "+
					"WHERE u.id="+userId+" "+
					"AND dj.id="+journeyId+" "+
					"AND dj.visible=1 AND DATE(dml.created_at) BETWEEN '"+startCompletionDate+"' AND '"+endCompletionDate+"' "+
					"GROUP BY list_module.id "+
					"ORDER BY dml.created_at";
    let getDataResult =  Database.connection('db_reader').raw(query);
    return getDataResult;
  }
  getLearningHourModule(journeyId,moduleIds,userId,startCompletionDate,endCompletionDate){
    let query = "SELECT dc.id AS course_id "+
		           ", u.username AS nip "+
						   ", list_module.fullname AS module_name "+
						   ", list_module.learning_effort "
						   ", IF(scorm_durasi.value IS NULL, '00:00:00', TIME_FORMAT(scorm_durasi.value, \"%H:%i:%s\")) AS actual_duration "+
						   ", IF(dml.module_id IS NULL, '0%', '100%') AS completions "+
						   ", IF(dml.created_at IS NULL, '0', dml.created_at) AS completion_date "+
					"FROM `user` u "+
					"JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL "+
					"JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid  AND dce.deleted_at IS NULL "+
					"JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL "+
					"JOIN ( "+
						"SELECT c.id, c.fullname, c.`learning_effort`, dj.id AS journey_id "+
						"FROM course c "+
						"JOIN daa_course_modules dcm ON dcm.module_id=c.id AND dcm.deleted_at IS NULL "+
						"JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND dc.deleted_at IS NULL "+
						"JOIN daa_journeys dj ON dj.id=dc.`journey_id`  AND dj.deleted_at IS NULL "+
						"WHERE dj.id="+journeyId+" "+
						"AND dj.visible=1 AND c.deleted_at IS NULL "+
						"AND c.id IN ("+moduleIds+")  AND dc.visible=1 "+
					") list_module ON list_module.journey_id= dj.id "+
					"JOIN scorm s ON s.course=list_module.id "+
					"LEFT JOIN daa_module_logs dml ON dml.module_id=list_module.id AND dml.user_id=u.id AND dml.deleted_at IS NULL "+
					"LEFT JOIN ( "+
						"SELECT sst1.* "+
						"FROM scorm_scoes_track sst1 "+
						"INNER JOIN ( "+
							"SELECT sst.scormid , MAX(sst.attempt) AS last_attempt "+
							"FROM `scorm_scoes_track` sst "+
							"JOIN scorm s ON s.id=sst.scormid AND s.deleted_at IS NULL "+
							"JOIN course c ON c.id=s.course AND c.deleted_at IS NULL "+
							"JOIN daa_course_modules dcm ON dcm.module_id=c.id  AND dcm.deleted_at IS NULL "+
							"JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND dc.deleted_at IS NULL "+
							"JOIN daa_journeys dj ON dj.id=dc.`journey_id` AND dj.deleted_at IS NULL "+
							"WHERE sst.userid="+userId+" "+
							"AND dj.id="+journeyId+" "+
							"AND dj.visible=1 "+
							"AND c.id IN ("+moduleIds+") AND dc.visible=1 AND sst.deleted_at IS NULL "+
							"AND sst.element='cmi.core.lesson_status' "+
							"AND sst.value='passed' "+
							"GROUP BY sst.scormid "+
						")t2 ON t2.scormid = sst1.scormid AND sst1.attempt = t2.last_attempt "+
						"JOIN scorm s ON s.id=sst1.scormid AND s.deleted_at IS NULL "+
						"JOIN course c ON c.id=s.course AND c.deleted_at IS NULL "+
						"JOIN daa_course_modules dcm ON dcm.module_id=c.id AND dcm.deleted_at IS NULL "+
						"JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND dc.deleted_at IS NULL "+
						"JOIN daa_journeys dj ON dj.id=dc.`journey_id` AND dj.deleted_at IS NULL "+
						"WHERE sst1.userid="+userId+" "+
						"AND dj.id="+journeyId+" "+
						"AND dj.visible=1 "+
						"AND c.id IN ("+moduleIds+") AND dc.visible=1 "+
						"AND sst1.element='cmi.core.session_time' "+
					") scorm_durasi ON scorm_durasi.scormid=s.id AND scorm_durasi.userid=u.id "+
					"WHERE u.id="+userId+" "+
					"AND dj.id="+journeyId+" "+
					"AND dj.visible=1 AND DATE(dml.created_at) BETWEEN '"+startCompletionDate+"' AND '"+endCompletionDate+"' "
					"GROUP BY list_module.id "+
					"ORDER BY dml.created_at";
    let getDataResult =  Database.connection('db_reader').raw(query);
    return getDataResult;
  }

  sum_the_time(times) {
		// loop throught all the times
		let all_seconds = 0;
    let splitTime = [];
    times.forEach((time) => {
      splitTime = time.split(":");
      all_seconds += parseInt(splitTime[0])*3600;
      all_seconds += parseInt(splitTime[1])*60;
      all_seconds += parseInt(splitTime[2]);
    });
    let totalMinutes = Math.floor(all_seconds/60);
    let seconds = all_seconds % 60;
    let hours = Math.floor(totalMinutes/60);
    let minutes = totalMinutes % 60;

		return hours+":"+minutes+":"+seconds;


	}

  diffDate(date1, date2){
    const startDate = new Date(date1);
    const endDate = new Date(date2);
    const days = parseInt((endDate - startDate) / (1000 * 60 * 60 * 24));
    const hours = parseInt(Math.abs(endDate - startDate) / (1000 * 60 * 60) % 24);
    const minutes = parseInt(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60) % 60);
    const seconds = parseInt(Math.abs(endDate.getTime() - startDate.getTime()) / (1000) % 60);

    return days+" Days"+", "+hours+" Hours"+", "+minutes+" Minutes"+", "+seconds+" Seconds";
  }




  sqlLearningHour(journeyID, courseId,  userId,  startCompletionDateRange, endCompletionDateRange){
    let sql = "SELECT dc.id AS course_id "+
                    ", u.username AS nip "+
                    ", list_module.fullname AS module_name "+
                    ", list_module.learning_effort "+
                    ", IF(scorm_durasi.value IS NULL, '00:00:00', TIME_FORMAT(scorm_durasi.value, \"%H:%i:%s\")) AS actual_duration "+
                    ", IF(dml.module_id IS NULL, '0%', '100%') AS completions "+
                    ", IF(dml.created_at IS NULL, '0', dml.created_at) AS completion_date "+
              "FROM `user` u "+
              "JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL "+
              "JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL "+
              "JOIN daa_journeys dj ON dj. id=djce.journey_id AND dj.deleted_at IS NULL "+
              "JOIN ( "+
                "SELECT c.id, c.fullname, c.`learning_effort`, dj.id AS journey_id "+
                "FROM course c "+
                "JOIN daa_course_modules dcm ON dcm.module_id=c.id AND dcm.deleted_at IS NULL "+
                "JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND dc.deleted_at IS NULL "+
                "JOIN daa_journeys dj ON dj.id=dc.`journey_id` AND dj.deleted_at IS NULL "+
                "WHERE dj.id="+ journeyID + " "+
                "AND dj.visible=1 "+
                "AND dc.visible=1 AND c.deleted_at IS NULL "+
              ") list_module ON list_module.journey_id= dj.id "+
              "JOIN `daa_course_modules` dcm ON dcm.module_id=list_module.id AND dcm.deleted_at IS NULL "+
              "JOIN `daa_courses` dc ON dc.id= dcm.course_id AND dc.deleted_at IS NULL "+
              "JOIN scorm s ON s.course=list_module.id AND s.deleted_at IS NULL "+
              "LEFT JOIN daa_module_logs dml ON dml.module_id=list_module.id AND dml.user_id=u.id "+
              "LEFT JOIN ( "+
                "SELECT sst1.* "+
                "FROM scorm_scoes_track sst1 "+
                "INNER JOIN ( "+
                    "SELECT sst.scormid , MAX(sst.attempt) AS last_attempt "+
                    "FROM `scorm_scoes_track` sst   "+
                    "JOIN scorm s ON s.id=sst.scormid  AND s.deleted_at IS NULL "+
                    "JOIN course c ON c.id=s.course  AND c.deleted_at IS NULL  "+
                    "JOIN daa_course_modules dcm ON dcm.module_id=c.id AND dcm.deleted_at IS NULL "+
                    "JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND dc.deleted_at IS NULL "+
                    "JOIN daa_journeys dj ON dj.id=dc.`journey_id` AND dj.deleted_at IS NULL "+
                    "WHERE sst.userid="+userId+" "+
                    "AND sst.deleted_at IS NULL "+
                    "AND dj.id="+ journeyID + " "+
                    "AND dj.visible=1 "+
                    "AND dc.visible=1 "+
                    "AND sst.element='cmi.core.lesson_status' "+
                    "AND sst.value='passed' "+
                    "GROUP BY sst.scormid "+
                ")t2 ON t2.scormid = sst1.scormid AND sst1.attempt = t2.last_attempt "+
                "JOIN scorm s ON s.id=sst1.scormid  AND s.deleted_at IS NULL "+
                "JOIN course c ON c.id=s.course  AND c.deleted_at IS NULL "+
                "JOIN daa_course_modules dcm ON dcm.module_id=c.id AND  dcm.deleted_at IS NULL "+
                "JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND  dc.deleted_at IS NULL "+
                "JOIN daa_journeys dj ON dj.id=dc.`journey_id`  AND dj.deleted_at IS NULL "+
                "WHERE sst1.userid="+userId+" "+
                "AND sst1.deleted_at IS NULL "
                "AND dj.id="+ journeyID + " "+
                "AND dj.visible=1 "+
                "AND dc.visible=1 "+
                "AND sst1.element='cmi.core.session_time' "+
              ") scorm_durasi ON scorm_durasi.scormid=s.id AND scorm_durasi.userid=u.id "+
              "WHERE u.id="+userId+" AND u.deleted_at IS NULL"+
              "AND dj.id="+ journeyID + " "+
              "AND dj.visible=1 "+
              " AND DATE(dml.created_at) BETWEEN '"+ startCompletionDateRange +"' AND '"+endCompletionDateRange+"' "+
              "GROUP BY list_module.id "+
              "ORDER BY dml.created_at ";

    return sql;
  }

  getColumnName(param){
    let columnIndex = Math.abs(param);

    // When using position comment the line above and uncomment the one below
    // $columnIndex = abs($columnIndex) - 1;

    let alphabet = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
        'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z'
    ];

    // Recursive approach
    if(columnIndex >= 1 && columnIndex <= 26)
    {
        return alphabet[columnIndex -1 ];
    }
    else
    {
        // . is string conactenation in php
        // % is modulus

        return this.getColumnName(Math.floor(columnIndex / 26)) + this.getColumnName((columnIndex % 26));
    }
  }

  getCompletionLearningHourActualDate(resultQueryLearningHour){

  }
  getCompletionLearningHourActualDateMultiJourney(resultQueryLearningHour,resultEnrol,journeyID){
    let sqlLearningHour = "";
    let duration = "";
    let getResultLearningHour = {};
    let iterationModuleJourney=1;
    let courseLine = "";
    let startLDate= "";
		let durationCompletionDate= "";
		let endLDate= "";
    let totModule=0;
		let firstStartLDate=0;
    let totAllModule=0;
    let totCompletedModule=0;
    let totLearningEffort=0;
    let timeArray=[];
    let totLearningEffortCourse=0;
    let totLearningHours=0;
    let counter = 1;

    for (let index in resultQueryLearningHour) {
      if(1==iterationModuleJourney){
        courseLine=resultQueryLearningHour[index].course_id;
      }
      if((resultQueryLearningHour[index].completion_date!=0) && (0==firstStartLDate)){
        startLDate=resultQueryLearningHour[index].completion_date;
        firstStartLDate=1;
      }

      totAllModule++

      // the formula
      if(courseLine==resultQueryLearningHour[index].course_id){
        if("100%"==resultQueryLearningHour[index].completions){
          totCompletedModule = 0;
          totLearningEffort+=resultQueryLearningHour[index].learning_effort;
          timeArray.push(resultQueryLearningHour[index].actual_duration)


        }
      }else{
          if(totLearningEffort>0){
            totLearningEffortCourse=(totLearningEffort/2);
            totLearningHours+=totLearningEffortCourse;

            totLearningEffort=0;
          }


          if("100%"==resultQueryLearningHour[index].completions){
            totCompletedModule++;
            totLearningEffort+=resultQueryLearningHour[index].learning_effort;
            timeArray.push(resultQueryLearningHour[index].actual_duration)



          }
          courseLine=resultQueryLearningHour[index].course_id;

        }

        if((resultQueryLearningHour[index].completion_date!=0) && (totAllModule==$totModule)){
          $endLDate=gresultQueryLearningHour[index].completion_date;

        }

      iterationModuleJourney++
    }

    if(totLearningEffort>0){
      totLearningEffortCourse=(totLearningEffort/2).toFixed(2);
      totLearningHours+=totLearningEffortCourse;


    }

    if(totCompletedModule>0){
      $totalModulData=0;
      resultEnrol.all_course = DaaCourse.query().where(journeyID).where('visible',1).fetch();
      resultEnrol.all_module =  DaaCourseModule.query().whereIn('course_id',  resultEnrol.all_course.rows.map(res => res.id))
                        .whereHas('module', (query) => { query.where('visible',1)}).fetch();
      if (course) {
        resultEnrol.all_module =  DaaCourseModule.query().where('course_id', course.id )
                        .whereHas('module', (query) => { query.where('visible',1)}).fetch();

      }
      resultEnrol.percentageCompleteModule=((totCompletedModule/data.all_module.rows.length)*100);
    }
    resultEnrol.totLearningHours = totLearningHours;
    resultEnrol.totActualDuration=this.sum_the_time(timeArray);

    return resultEnrol;
  }

  getCompletionLearningHourActualDateMultiCourse(resultQueryLearningHour,resultEnrol,journeyID){
    let sqlLearningHour = "";
    let duration = "";
    let getResultLearningHour = {};
    let iterationModuleJourney=1;
    let courseLine = "";
    let startLDate= "";
		let durationCompletionDate= "";
		let endLDate= "";
    let totModule= resultQueryLearningHour.length;
		let firstStartLDate=0;
    let totAllModule=0;
    let totCompletedModule=0;
    let totLearningEffort=0;
    let timeArray=[];
    let totLearningEffortCourse=0;
    let totLearningHours=0;
    let counter = 1;

    if (resultQueryLearningHour.length > 0) {
      for (let index in resultQueryLearningHour) {
        totAllModule++

        if ("100%" == resultQueryLearningHour[index].completions) {
          //courseLine=resultQueryLearningHour[index].course_id;
            totCompletedModule++
            totLearningEffort += resultQueryLearningHour[index].learning_effort;
            timeArray.push(resultQueryLearningHour[index].actual_duration);
            if (1 == totCompletedModule) {
              startLDate=resultQueryLearningHour[index].completion_date;
            }
            if (totAllModule == totModule) {
              endLDate=resultQueryLearningHour[index].completion_date;
            }


        }
        if(startLDate && endLDate){
            durationCompletionDate=this.diffDate(startLDate, endLDate);
        } else {
          durationCompletionDate='';
        }
      }

    }

    if(totLearningEffort>0){
      totLearningEffortCourse=(totLearningEffort/2);
      totLearningHours+=totLearningEffortCourse;

    }

    if(totCompletedModule>0){
      $totalModulData=0;
      resultEnrol.all_course = DaaCourse.query().where(journeyID).where('visible',1).fetch();
      resultEnrol.all_module =  DaaCourseModule.query().whereIn('course_id',  resultEnrol.all_course.rows.map(res => res.id))
                        .whereHas('module', (query) => { query.where('visible',1)}).fetch();
      if (course) {
        resultEnrol.all_module =  DaaCourseModule.query().where('course_id', course.id )
                        .whereHas('module', (query) => { query.where('visible',1)}).fetch();

      }
      resultEnrol.percentageCompleteModule=((totCompletedModule/data.all_module.rows.length)*100);
    }
    resultEnrol.totLearningHours = totLearningHours;
    resultEnrol.totActualDuration=this.sum_the_time(timeArray);

    return resultEnrol;
  }

}

module.exports = LearningHourV2Controller
