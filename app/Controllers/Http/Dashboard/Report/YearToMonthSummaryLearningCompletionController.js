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

class YearToMonthSummaryLearningCompletionController {

  async report({ view, auth, response, request, session, params }) {

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let directorate = await UserInfoDatum.query().where('data', request.input('directorateid')).where('fieldid', 11).first();
    let division = await UserInfoDatum.query().where('data', request.input('subdirectorateid')).where('fieldid', 2).first();
    let enrolStartDate = today.getFullYear()+'-'+'01'+'-'+'01';
    let enrolEndDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(new Date(today.getFullYear(),today.getMonth()+1,0).getDate())

    let journey = {};
    journey = await DaaJourney.query().where('id', request.input('journey_id')).first();
    let programName = "Program : ";
    if (journey) {
      programName = "Program : " + journey.name;
    }
    let tableHeadAdditional = {};
    let datasCourse = await DaaCourse.query().where('journey_id', request.input('journey_id')).orderBy('id').fetch();
    let paramsExport = {};
    paramsExport.filename = "Year_To_Month_Summary_Learning_Completions_";
    paramsExport.table_heads_additional = [];
    paramsExport.table_heads_end = [];
    let reportType = "Year To Month Summary Learning Completions ";
    let sqlEnrollmentData = "SELECT uid1.data AS directorate "+
                               ", uid2.data AS subdirectorate "+
                               ", COUNT(DISTINCT(u.id)) AS totEnrolled "+
          "FROM daa_journey_cohort_enrols djce "+
          "JOIN daa_journeys dj ON dj.id = djce.journey_id "+
          "JOIN cohort ch ON ch.id = djce.cohort_id "+
          "JOIN cohort_members cm ON cm.cohortid = ch.id "+
          "JOIN `user` u ON u.id = cm.userid "+
          "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
          "INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 "+
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


    console.log(sqlEnrollmentData);
    let getResultEnrol = await Database.connection('db_reader').raw(sqlEnrollmentData);
    
    paramsExport.datas = [];
    let rowValues = [];
    let directorateLine = "";
    let directorateEnrolled = 0;
    let datasCompletedCourseDirectorate = await Database.connection('db_reader').raw(this.sqlCompletedCourseByDirectorate(request.input('directorateid'),  request.input('subdirectorateid'), request.input('journey_id'), enrolStartDate, enrolEndDate));
    let datasCompletedCourseSubDirectorate = [];
    let userCompleteCourse = 0;
    let directorateEnrolledALL = 0;
    let percentageCompleteCourse = 0;
    let totPrecentageCompleted = 0;
    let averageCompletedCourse = 0;
    let datasNotCompletedCourse = {};
    let averageGrandTotal = 0;
    let averageGrandJum = 0;
    let averageGrandList = "";
    await getResultEnrol[0].forEach(async (data) => {
      rowValues = []
      directorateLine ="Directorate "+data.directorate;
      directorateEnrolledALL = directorateEnrolledALL + directorateEnrolled;
      //datasCompletedCourseDirectorate = Database.connection('db_reader').raw(this.sqlCompletedCourseByDirectorate(data.directorate, data.subdirectorate, request.input('journey_id'),enrolStartDate,enrolEndDate));
      rowValues = [
        "Directorate : " + data.directorate ,
        data.totEnrolled

      ];
      totPrecentageCompleted = 0;
      averageCompletedCourse = 0;
      for (let i = 0; i < datasCompletedCourseDirectorate[0].length; i++) {

        if (datasCompletedCourseDirectorate[0][i].userCompleteCourse > 0) {
            userCompleteCourse=datasCompletedCourseDirectorate[0][i].userCompleteCourse

						percentageCompleteCourse=(datasCompletedCourseDirectorate[0][i].userCompleteCourse/data.totEnrolled*100).toFixed(2);
            totPrecentageCompleted +=percentageCompleteCourse;
        }
        rowValues.push(userCompleteCourse);
        rowValues.push(percentageCompleteCourse+"%");

      }
      
      averageCompletedCourse = (totPrecentageCompleted/ datasCompletedCourseDirectorate[0].length).toFixed(2)
      rowValues.push( averageCompletedCourse+"%");
      directorateEnrolled += data.totEnrolled
      paramsExport.datas.push({ row_values: rowValues });
      rowValues = [
        data.subdirectorate,
        data.totEnrolled

      ];
      datasCompletedCourseSubDirectorate = await Database.connection('db_reader').raw(this.sqlCompletedCourseBySubDirectorate(data.directorate, data.subdirectorate, request.input('journey_id'),enrolStartDate,enrolEndDate));
      
      if (datasCompletedCourseSubDirectorate[0].length > 0) {
        totPrecentageCompleted = 0;
        for (let i = 0; i < datasCompletedCourseSubDirectorate[0].length; i++) {
          if (dataChild.userCompleteCourse > 0) {
              userCompleteCourse=datasCompletedCourseSubDirectorate[0][i].userCompleteCourse

              percentageCompleteCourse=(datasCompletedCourseSubDirectorate[0][i].userCompleteCourse/data.totEnrolled*100).toFixed(2);
              totPrecentageCompleted +=percentageCompleteCourse;
          }
          rowValues.push(userCompleteCourse);
          rowValues.push(percentageCompleteCourse+"%");
        }
        
        averageCompletedCourse = (totPrecentageCompleted/ datasCompletedCourseSubDirectorate[0].length).toFixed(2)
        rowValues.push( averageCompletedCourse+"%");
      }
      else {
        for (let i = 0; i < datasCourse.rows.length; i++) {

          rowValues.push(0,"0%");

        }
         rowValues.push("0%");x
      }
      paramsExport.datas.push({ row_values: rowValues });

    });
    directorateEnrolledALL += directorateEnrolled;
    rowValues = [
        "Directorate : " + directorateLine ,
        directorateEnrolled

    ];
    datasCompletedCourseDirectorate =  await Database.connection('db_reader').raw(this.sqlCompletedCourseByDirectorate(request.input('directorateid'), request.input('subdirectorateid'), request.input('journey_id'),enrolStartDate,enrolEndDate));
    totPrecentageCompleted = 0;
    datasCompletedCourseDirectorate[0].forEach((dataChild) => {
        if (dataChild.userCompleteCourse > 0) {
            userCompleteCourse=dataChild.userCompleteCourse

						percentageCompleteCourse=(dataChild.userCompleteCourse/dataChild.totEnrolled*100).toFixed(2);
            totPrecentageCompleted +=percentageCompleteCourse;
        }
        rowValues.push(userCompleteCourse);
        rowValues.push(percentageCompleteCourse+"%");
    });
    averageCompletedCourse = (totPrecentageCompleted/ datasCompletedCourseDirectorate[0].length).toFixed(2)
    averageGrandList += averageCompletedCourse + "==";
    averageGrandTotal += averageCompletedCourse;
    averageGrandJum++;
    rowValues.push(averageCompletedCourse + "%");
    paramsExport.datas.push({ row_values: rowValues });
    if('0' != request.input('directorateid') && '' != request.input('directorateid')){
      rowValues = [
        "Grand Total " ,
        directorateEnrolledALL

      ];
      datasCompletedCourseDirectorate = await Database.connection('db_reader').raw(this.sqlCompletedCourseByDirectorate(request.input('directorateid'), request.input('subdirectorateid'), request.input('journey_id'),enrolStartDate,enrolEndDate));
      totPrecentageCompleted = 0;
      datasCompletedCourseDirectorate[0].forEach((dataChild) => {
          if (dataChild.userCompleteCourse > 0) {
              userCompleteCourse=dataChild.userCompleteCourse

              percentageCompleteCourse=(dataChild.userCompleteCourse/directorateEnrolledALL*100).toFixed(2);
              totPrecentageCompleted +=percentageCompleteCourse;
          }
          rowValues.push(userCompleteCourse);
          rowValues.push(percentageCompleteCourse+"%");
      });
      averageCompletedCourse = (totPrecentageCompleted/ datasCompletedCourseDirectorate[0].length).toFixed(2)
      rowValues.push(averageCompletedCourse + "%");
      paramsExport.datas.push({ row_values: rowValues });
    }

    let datasCompletedJourney = await Database.connection('db_reader').raw(this.sqlCompletedByJourney( request.input('directorateid'), request.input('subdirectorateid'), request.input('journey_id'),enrolStartDate,enrolEndDate));
    let totalCompletedProgram=0;
    let totalEnrolledProgram = 0;
    if (datasCompletedJourney[0].length > 0) {
      totalCompletedProgram = datasCompletedJourney[0][0].userCompleteJourney;
      totalEnrolledProgram = datasCompletedJourney[0][0].totEnrolled;
      rowValues = [
        "Total Complete Program",
        totalCompletedProgram,
        
       

      ];
      paramsExport.datas.push({ row_values: rowValues });
      rowValues = [
        "Percentage Completions",
        (totalCompletedProgram/totalEnrolledProgram*100).toFixed(2)+"%",

      ];
      paramsExport.datas.push({ row_values: rowValues });
    

    }
    // getResultEnrol[0].forEach((data) => {




    // });


    //console.log(getResult[0][0].enrolledDate.toLocaleDateString());

    paramsExport.headers = [
        reportType,
        programName,
        "Enrollment Range : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
        ""
    ];

    paramsExport.datas = getResultEnrol[0];
    paramsExport.sheetname = "Sheet1";


    paramsExport.table_heads = [
        { header: "Sub Directorate & Directorate", key: "sub_directorate_&_directorate", width: 50 },
        { header: "Enrolled", key: "enrolled", width: 15 },

    ];

    for (let i = 0; i < datasCourse.rows.length; i++) {

      tableHeadAdditional = {};
      tableHeadAdditional.course_header = datasCourse.rows[i].name,
      tableHeadAdditional.course_attribute_header  = ["Complete","% Complete"],
      paramsExport.table_heads_additional.push(tableHeadAdditional);

    }
    paramsExport.table_heads_end.push({
      header: "Average ALL Modules",
      width: 30,

    });




    //console.log(paramsExport);

    let result =  await ExportService.ExportSummaryLearningCompletionsToExcel(paramsExport);
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = result.filename;
    daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
    daaFileExport.type        = "export_year_to_month_summary_learning_completions";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(result.fullpath, result.filename);
  }

  sqlCompletedCourseByDirectorate(directorateLine, subDirectorateId, journeyId, startdate, enddate) {
    let sql = "SELECT dc.id AS course_id, sum(if(xx.completeCourse=1, 1,0)) userCompleteCourse " +
      "FROM daa_courses dc " +
      "INNER JOIN daa_journeys dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL " +
      "LEFT JOIN ( " +
      "SELECT u.id AS user_id " +
      ", dc.id AS course_id " +
      ", dc.name AS course_name " +
      ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInCourse.jmlModule, 1, 0) completeCourse " +
      "FROM `user` u " +
      "LEFT JOIN daa_module_logs dml ON dml.user_id=u.id AND dml.deleted_at IS NULL " +
      "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id AND dcm.deleted_at IS NULL " +
      "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL " +
      "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL " +
      "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL " +
      "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL " +
      "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=dj.id AND djce.deleted_at IS NULL " +
      "INNER JOIN user_info_data uid1 ON uid1.`userid`=u.id AND uid1.`fieldid`=11 " +
      "INNER JOIN user_info_data uid2 ON uid2.`userid`=u.id AND uid2.`fieldid`=2 " +
      "INNER JOIN ( " +

      "SELECT dc.id course_id, COUNT(DISTINCT(c.id)) jmlModule " +
      "FROM daa_journeys dj " +
      "INNER JOIN daa_courses dc ON dc.journey_id=dj.id AND dc.deleted_at IS NULL " +
      "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id AND dcm.deleted_at IS NULL " +
      "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL " +
      "WHERE c.visible = 1 " +
      "AND c.`module_type`=1 " +
      "AND dj.visible = 1 " +
      "AND dc.visible = 1 " +
      "AND dj.id=" + journeyId + " " +
      "GROUP BY dc.id " +
      "ORDER BY dc.name " +
      ") AS totModuleInCourse ON totModuleInCourse.course_id=dc.id " +
      "WHERE u.deleted = 0 " +
      "AND u.suspended = 0 " +

      "AND DATE(djce.created_at) BETWEEN '" + startdate + "' AND '" + enddate + "' " +
      "AND dj.visible = 1 " +
      "AND dc.visible = 1 " +
      "AND c.visible = 1 " +
      "AND c.`module_type`=1 " +
      "AND dj.id=" + journeyId + " ";
            
            if('0' != directorateLine && "" != directorateLine) {
                sql+= " AND uid1.data= " + "'"+ directorateLine+ "' ";
            }
            if ('0' != subDirectorateId && "" != subDirectorateId) {
                sql += " AND uid2.data= " + "'"+ subDirectorateId+ "' ";
            }
			sql +="GROUP BY user_id, dc.id "+
						"HAVING completeCourse=1 "+
				   ") xx ON xx.course_id = dc.id "+
					"WHERE dj.id="+journeyId+ " "+
					"AND dc.visible = 1 "+
				  "GROUP BY dc.id ";
    return sql;
  }

  sqlCompletedCourseBySubDirectorate(directorateLine, subDirectorateId, journeyId, startdate, enddate) {
    let sql = "SELECT dc.id AS course_id, sum(if(xx.completeCourse=1, 1,0)) userCompleteCourse " +
      "FROM daa_courses dc " +
      "INNER JOIN daa_journeys dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL " +
      "LEFT JOIN (  " +
      "SELECT u.id AS user_id " +
      ", dc.id AS course_id " +
      ", dc.name AS course_name " +
      ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInCourse.jmlModule, 1, 0) completeCourse " +
      "FROM `user` u " +
      "LEFT JOIN daa_module_logs dml ON dml.user_id=u.id AND dml.deleted_at IS NULL " +
      "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id AND dcm.deleted_at IS NULL " +
      "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL " +
      "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL " +
      "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL " +
      "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL " +
      "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=dj.id AND djce.deleted_at IS NULL " +
      "INNER JOIN user_info_data uid1 ON uid1.`userid`=u.id AND uid1.`fieldid`=11 " +
      "INNER JOIN user_info_data uid2 ON uid2.`userid`=u.id AND uid2.`fieldid`=2 " +
      "INNER JOIN ( " +

      "SELECT dc.id course_id, COUNT(DISTINCT(c.id)) jmlModule " +
      "FROM daa_journeys dj  " +
      "INNER JOIN daa_courses dc ON dc.journey_id=dj.id AND dc.deleted_at IS NULL " +
      "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id AND dcm.deleted_at IS NULL " +
      "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL " +
      "WHERE c.visible = 1 " +
      "AND c.`module_type`=1 " +
      "AND dj.visible = 1 " +
      "AND dc.visible = 1 " +
      "AND dj.id=" + journeyId + " " +
      "GROUP BY dc.id " +
      "ORDER BY dc.name " +
      ") AS totModuleInCourse ON totModuleInCourse.course_id=dc.id " +
      "WHERE u.deleted = 0 " +
      "AND u.suspended = 0 " +

      "AND DATE(djce.created_at) BETWEEN '" + startdate + "' AND '" + enddate + "' " +
      "AND dj.visible = 1 " +
      "AND dc.visible = 1 " +
      "AND c.visible = 1 " +
      "AND c.`module_type`=1 " +
      "AND dj.id=" + journeyId + " ";
						if('0' != directorateLine && "" != directorateLine) {
                sql+= " AND uid1.data= " + "'"+ directorateLine+ "' ";
            }
            if ('0' != subDirectorateId && "" != subDirectorateId) {
                sql += " AND uid2.data= " + "'"+ subDirectorateId+ "' ";
            }
			sql+= "GROUP BY user_id, dc.id "+

				  ") xx ON xx.course_id = dc.id "+
				"WHERE  dj.id=" + journeyId + " " +
				"AND dc.visible=1 "+
				"GROUP BY dc.id ORDER BY dc.name ";
    return sql;
  }
  sqlNotCompletedCourseBySubDirectorate(type, journeyId, startDate, endDate) {
    let sql = " ";
    return sql;
  }
  sqlCompletedByJourney( directorateLine, subDirectorateId, journeyId, startdate, enddate) {
    let sql = "SELECT xx.journey_id, COUNT(xx.completeJourney) userCompleteJourney, yy.totEnrolled " +
      "FROM ( " +
      "SELECT u.id AS user_id " +
      ", dj.id AS journey_id , dj.name AS journey_name " +
      ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInJourney.jmlModule, 1, 0) completeJourney " +
      "FROM `user` u  " +
      "LEFT JOIN daa_module_logs dml ON dml.user_id=u.id AND dml.deleted_at IS NULL " +
      "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id AND dcm.deleted_at IS NULL " +
      "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL " +
      "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL " +
      "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL " +
      "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL " +
      "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=dj.id AND djce.deleted_at IS NULL " +
      "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11  " +
      "INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2  " +
      "INNER JOIN ( " +
                  
      "SELECT dj.id journey_id, COUNT(DISTINCT(c.id)) jmlModule " +
      "FROM daa_journeys dj " +
      "INNER JOIN daa_courses dc ON dc.journey_id=dj.id AND dc.deleted_at IS NULL " +
      "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id AND dcm.deleted_at IS NULL " +
      "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL " +
      "WHERE c.visible = 1 AND c.`module_type`=1 AND dj.visible = 1 AND dc.visible = 1 " +
      "AND dj.id=" + journeyId + " " +
      ") AS totModuleInJourney ON totModuleInJourney.journey_id=dj.id " +
      "WHERE u.deleted = 0 AND u.suspended = 0 ";
      if('0' != directorateLine && "" != directorateLine) {
          sql+= " AND uid1.data= " + "'"+ directorateLine+ "' ";
      }
      if ('0' != subDirectorateId && "" != subDirectorateId) {
          sql += " AND uid2.data= " + "'"+ subDirectorateId+ "' ";
      }
      sql += "AND dj.deleted_at IS NULL " +
      "AND DATE(djce.created_at) BETWEEN '" + startdate + "' AND '" + enddate + "' " +
      "AND dj.visible = 1 AND dc.visible = 1 AND c.visible = 1 AND c.`module_type`=1 " +
      "AND dj.id=" + journeyId + " " +
      "GROUP BY user_id, dj.id " +
      "HAVING completeJourney=1 " +
      ") xx " +
      "INNER join ( " +
      "SELECT dj.id AS journey_id, COUNT(DISTINCT(u.id)) AS totEnrolled " +
      "FROM daa_journey_cohort_enrols djce " +
      "JOIN daa_journeys dj ON dj.id = djce.journey_id AND dj.deleted_at IS NULL " +
      "JOIN cohort ch ON ch.id = djce.cohort_id AND ch.deleted_at IS NULL " +
      "JOIN cohort_members cm ON cm.cohortid = ch.id AND cm.deleted_at IS NULL " +
      "JOIN `user` u ON u.id = cm.userid AND u.deleted_at IS NULL " +
      "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 " +
      "INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2  " +
      "WHERE u.deleted = 0 AND u.suspended = 0 AND dj.visible = 1  " +
      "AND dj.id=" + journeyId + " ";
      if('0' != directorateLine && "" != directorateLine) {
          sql+= " AND uid1.data= " + "'"+ directorateLine+ "' ";
      }
      if ('0' != subDirectorateId && "" != subDirectorateId) {
          sql += " AND uid2.data= " + "'"+ subDirectorateId+ "' ";
      } 
      sql += "AND ch.visible = 1 "+
                "AND DATE(djce.created_at) >= '"+startdate+"' AND DATE(djce.created_at) <= '"+enddate+"' "+ 
                "AND djce.deleted_at IS NULL "+
                "GROUP BY dj.id "+
              ") yy on yy.journey_id=xx.journey_id ";

    return sql;
  }

}

module.exports = YearToMonthSummaryLearningCompletionController
