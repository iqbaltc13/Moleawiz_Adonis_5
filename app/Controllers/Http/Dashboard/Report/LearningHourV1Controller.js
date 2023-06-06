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

class LearningHourV1Controller {

   async report({ view, auth, response, request, session, params }) {


    let directorate = await UserInfoDatum.query().where('data', request.input('directorateid')).where('fieldid', 11).first();
    let division = await UserInfoDatum.query().where('data', request.input('subdirectorateid')).where('fieldid', 2).first();
    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');
    let completionStartDate = request.input('completion_start_date');
    let completionEndDate = request.input('completion_end_date');
    let sortBy = request.input('sort_by');
    let journey = {};
    journey = await DaaJourney.query().where('id', request.input('journey_id')).first();
    let programName = "Program Name : ";
    if (journey) {
      programName = "Program Name : " + journey.name;
    }

    let course = {};
    course = await DaaCourse.query().where('id', request.input('course_id')).first();
    let courseName = "";
    if (course) {
      courseName = "Course Name : " + course.name;
    }
    let status = "Status : ";




    let paramsExport = {};
    paramsExport.filename = "Learning_Hours_1_Program_" + journey.name.replace(" ", "_");
    if (course) {
        paramsExport.filename += "_Course_"+course.name.replace(" ", "_");
    }
    let reportType = "Report Type : Learning Hours - 1 ";
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
           "AND dj.id=" + request.input('journey_id');
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

    console.log(sqlEnrollmentData);
    let getResultEnrol = await Database.connection('db_reader').raw(sqlEnrollmentData);
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
    getResultEnrol[0].forEach((data) => {
      iterationModuleJourney=1;
      timeArray=[];
      courseLine = "";
      startLDate = "";
      durationCompletionDate ="";
      endLDate = "";
      totModule = 0;
      firstStartLDate = 0;
      totAllModule = 0;
      totCompletedModule = 0;
      totLearningEffort = 0;
      totLearningEffortCourse = 0;
      totLearningHours = 0;
      sqlLearningHour = "SELECT dc.id AS course_id "+
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
                          "WHERE dj.id="+ request.input('journey_id') + " "+
                          "AND dj.visible=1 "+
                          "AND dc.visible=1 AND c.deleted_at IS NULL ";

                          if( request.input('course_id')){
                            sqlLearningHour +=  "AND dc.id="+request.input('course_id')+ " ";
                          }
      sqlLearningHour += ") list_module ON list_module.journey_id= dj.id "+
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
                              "WHERE sst.userid="+data.user_id+" "+
                              "AND sst.deleted_at IS NULL "+
                              "AND dj.id="+ request.input('journey_id') + " "+
                              "AND dj.visible=1 "+
                              "AND dc.visible=1 ";
                              if( request.input('course_id')){
                                sqlLearningHour +=  "AND dc.id="+request.input('course_id')+ " ";
                              }
      sqlLearningHour +=      "AND sst.element='cmi.core.lesson_status' "+
                              "AND sst.value='passed' "+
                              "GROUP BY sst.scormid "+
                          ")t2 ON t2.scormid = sst1.scormid AND sst1.attempt = t2.last_attempt "+
                          "JOIN scorm s ON s.id=sst1.scormid  AND s.deleted_at IS NULL "+
                          "JOIN course c ON c.id=s.course  AND c.deleted_at IS NULL "+
                          "JOIN daa_course_modules dcm ON dcm.module_id=c.id AND  dcm.deleted_at IS NULL "+
                          "JOIN `daa_courses` dc ON dc.id= dcm.`course_id` AND  dc.deleted_at IS NULL "+
                          "JOIN daa_journeys dj ON dj.id=dc.`journey_id`  AND dj.deleted_at IS NULL "+
                          "WHERE sst1.userid="+data.user_id+" "+
                          "AND sst1.deleted_at IS NULL "
                          "AND dj.id="+ request.input('journey_id') + " "+
                          "AND dj.visible=1 "+
                          "AND dc.visible=1 ";
                          if( request.input('course_id')){
                            sqlLearningHour +=  "AND dc.id="+request.input('course_id')+ " ";
                          }
      sqlLearningHour +=  "AND sst1.element='cmi.core.session_time' "+
                        ") scorm_durasi ON scorm_durasi.scormid=s.id AND scorm_durasi.userid=u.id "+
                        "WHERE u.id="+data.user_id+" AND u.deleted_at IS NULL"+
                        "AND dj.id="+ request.input('journey_id') + " "+
                        "AND dj.visible=1 "+
                        " AND DATE(dml.created_at) BETWEEN '"+ completionStartDate +"' AND '"+completionEndDate+"' "+
                        "GROUP BY list_module.id "+
                        "ORDER BY dml.created_at ";
      console.log(sqlLearningHour);
      getResultLearningHour =   Database.connection('db_reader').raw(sqlLearningHour);

      for (let index in getResultLearningHour[0]) {
        if(1==iterationModuleJourney){
          courseLine=getResultLearningHour[0][index].course_id;
        }
        if((getResultLearningHour[0][index].completion_date!=0) && (0==firstStartLDate)){
          startLDate=getResultLearningHour[0][index].completion_date;
          firstStartLDate=1;
        }

        totAllModule++

        // the formula
        if(courseLine==getResultLearningHour[0][index].course_id){
          if("100%"==getResultLearningHour[0][index].completions){
            totCompletedModule = 0;
            totLearningEffort+=getResultLearningHour[0][index].learning_effort;
            timeArray.push(getResultLearningHour[0][index].actual_duration)


          }
        }else{
            if(totLearningEffort>0){
              totLearningEffortCourse=(totLearningEffort/2);
              totLearningHours+=totLearningEffortCourse;

              totLearningEffort=0;
            }


            if("100%"==getResultLearningHour[0][index].completions){
              totCompletedModule++;
              totLearningEffort+=getResultLearningHour[0][index].learning_effort;
              timeArray.push(getResultLearningHour[0][index].actual_duration)



            }
            courseLine=getResultLearningHour[0][index].course_id;

          }

          if((getResultLearningHour[0][index].completion_date!=0) && (totAllModule==$totModule)){
            $endLDate=getResultLearningHour[0][index].completion_date;

          }

				iterationModuleJourney++
      }

      if(totLearningEffort>0){

        if (course) {
          totLearningHours=(totLearningEffort/2).toFixed(2);
        }
        else{
          totLearningHours+=(totLearningEffort/2);
        }

      }

      if(totCompletedModule>0){
        $totalModulData=0;
        data.all_course = DaaCourse.query().where('journey_id',request.input('journey_id')).where('visible',1).fetch();
        data.all_module =  DaaCourseModule.query().whereIn('course_id',  data.all_course.rows.map(res => res.id))
                          .whereHas('module', (query) => { query.where('visible',1)}).fetch();
        if (course) {
          data.all_module =  DaaCourseModule.query().where('course_id', course.id )
                          .whereHas('module', (query) => { query.where('visible',1)}).fetch();

        }
        data.percentageCompleteModule=((totCompletedModule/data.all_module.rows.length)*100);
      }

      data.totActualDuration=this.sum_the_time(timeArray);

      data.row_values = [
        counter,
        journey.name,
        data.nip.toUpperCase(),
        data.fullname.toUpperCase(),
        data.directorate.toUpperCase(),
        data.subdirectorate.toUpperCase(),
        totLearningHours,
        data.totActualDuration,
        Math.round(data.percentageCompleteModule)+"%",
        startLDate,
        endLDate,
        this.diffDate(startLDate,  endLDate)
      ];
      if (course) {
        data.row_values = [
          counter,
          journey.name,
          course.name,
          data.nip.toUpperCase(),
          data.fullname.toUpperCase(),
          data.directorate.toUpperCase(),
          data.subdirectorate.toUpperCase(),
          totLearningHours,
          data.totActualDuration,
          Math.round(data.percentageCompleteModule)+"%",
          startLDate,
          endLDate,
          this.diffDate(startLDate,  endLDate)
        ];
      }

      counter++



    });


    //console.log(getResult[0][0].enrolledDate.toLocaleDateString());

    paramsExport.headers = [
        reportType,
        programName,
        "Enrollment Range : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
        "Completion Range : " + completionStartDate.split('-').join('/') + " - " + completionEndDate.split('-').join('/'),
        status,

        ""

    ];
    if (course) {
        paramsExport.headers = [
        reportType,
        programName,
        courseName,
        "Enrollment Range : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
        "Completion Range : " + completionStartDate.split('-').join('/') + " - " + completionEndDate.split('-').join('/'),
        status,

        ""

    ];
    }
    paramsExport.datas = getResultEnrol[0];
    paramsExport.sheetname = "Sheet1";


    paramsExport.table_heads = [
        { header: "No", key: "no", width: 5 },
        { header: "Program", key: "program", width: 50 },
        { header: "NIP", key: "nip", width: 20 },
        { header: "Name", key: "name", width: 50 },

        { header: "Directorate", key: "directorate", width: 50 },
        { header: "Sub Directorate", key: "division", width: 50 },
        { header: "Learning Hours", key: "leaning_hours", width: 15 },
        { header: "Actual Duration", key: "actual_duration", width: 15 },
        { header: "Completions", key: "completions", width: 15 },
        { header: "Start Date", key: "start_date", width: 20 },
        { header: "End Date", key: "end_date", width: 20 },
        { header: "Duration", key: "duration", width: 20 },

    ];

    if (course) {
        paramsExport.table_heads = [
        { header: "No", key: "no", width: 5 },
        { header: "Program", key: "program", width: 50 },
        { header: "Course", key: "course", width: 50 },
        { header: "NIP", key: "nip", width: 20 },
        { header: "Name", key: "name", width: 50 },

        { header: "Directorate", key: "directorate", width: 50 },
        { header: "Sub Directorate", key: "division", width: 50 },
        { header: "Learning Hours", key: "leaning_hours", width: 15 },
        { header: "Actual Duration", key: "actual_duration", width: 15 },
        { header: "Completions", key: "completions", width: 15 },
        { header: "Start Date", key: "start_date", width: 20 },
        { header: "End Date", key: "end_date", width: 20 },
        { header: "Duration", key: "duration", width: 20 },

        ];
    }
    //console.log(paramsExport);

    let result =  await ExportService.ExportLearningHours1ToExcel(paramsExport);
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = result.filename;
    daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
    daaFileExport.type        = "export_learning_hours_1";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(result.fullpath, result.filename);



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

}

module.exports = LearningHourV1Controller
