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

class LearningCompletionV3Controller {

  async report({ view, auth, response, request, session, params }) {


    let directorate = await UserInfoDatum.query().where('data', request.input('directorateid')).where('fieldid', 11).first();
    let division = await UserInfoDatum.query().where('data', request.input('subdirectorateid')).where('fieldid', 2).first();
    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');
    let completionStartDate = request.input('completion_start_date');
    let completionEndDate = request.input('completion_end_date');
    let moduleType = request.input('module_type');
    let multiJourneyId =  request.input('multi_journey_id');
    let multiCourseId =  request.input('multi_course_id');
    let multiModuleId = request.input('multi_module_id');


    let datasJourney = {
      rows: []
    }
    if(multiJourneyId != ""){
      datasJourney = await DaaJourney.query().with('course', builder => {
        builder.with('course_modules', builderChild => {
          builderChild.with('module').whereNull('deleted_at')
      }).whereNull('deleted_at'); //  select columns / pass array of columns
    }).whereIn('id', multiJourneyId.split(",")).orderBy('id').fetch();
    }
    let datasCourse = {
      rows : []
    }
    if(multiCourseId != ""){
      datasCourse = await DaaCourse.query().with('journey').with('course_modules', builderChild => {
          builderChild.with('module').whereNull('deleted_at')
      }).whereNull('deleted_at').whereIn('id', multiCourseId.split(",")).orderBy('id').fetch();
      datasJourney = await DaaJourney.query().with('course', builder => {
        builder.with('course_modules', builderChild => {
          builderChild.with('module').whereNull('deleted_at')
      }).whereNull('deleted_at').whereIn('id', multiCourseId.split(",")); //  select columns / pass array of columns
    }).whereIn('id', multiJourneyId.split(",")).orderBy('id').fetch();
    }
    let datasModule = {
      rows : []
    }
    if(multiModuleId != ""){
      datasModule = await DaaCourseModule.query().with('course').with('module').whereIn('module_id', multiModuleId.split(",")).orderBy('module_id').fetch();
      datasCourse = await DaaCourse.query().with('journey').with('course_modules', builderChild => {
          builderChild.with('module').whereNull('deleted_at').whereIn('module_id', multiModuleId.split(","))
      }).whereNull('deleted_at').whereIn('id', multiCourseId.split(",")).orderBy('id').fetch();
      datasJourney = await DaaJourney.query().with('course', builder => {
        builder.with('course_modules', builderChild => {
          builderChild.with('module').whereNull('deleted_at').whereIn('module_id', multiModuleId.split(","))
      }).whereNull('deleted_at').whereIn('id', multiCourseId.split(",")); //  select columns / pass array of columns
    }).whereIn('id', multiJourneyId.split(",")).orderBy('id').fetch();
    }
    let paramsExport = {};

    paramsExport.filename = "Learning - Completions - 3";

    let sqlEnrollmentData = "SELECT DISTINCT(u.id) AS user_id " +
                            ", u.username AS nip " +
                            ", CONCAT(u.firstname,' ', u.lastname) AS fullname " +
                            ", u.email " +
                            ", uid1.data AS directorate " +
                            ", uid2.data AS subdirectorate " +
                            ", uid3.data AS position "+
                            "FROM `user` u  " +
                            "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL " +
                            "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL " +
                            "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL " +
                            "INNER JOIN user_info_data uid1 ON uid1.`userid`=u.id AND uid1.`fieldid`=11 " +
                            "INNER JOIN user_info_data uid2 ON uid2.`userid`=u.id AND uid2.`fieldid`=2 " +
                            "INNER JOIN user_info_data uid3 ON uid3.`userid`=u.id AND uid3.`fieldid`=7 "+
                            "WHERE dj.visible=1 AND u.deleted_at IS NULL AND u.deleted=0 AND u.suspended=0 " +
                            "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') " +
                            "AND DATE(djce.created_at) BETWEEN '" + enrolStartDate + "' AND '" + enrolEndDate + "' " +
                            "AND dj.id IN (" +  multiJourneyId +") ";
                            if('0' != request.input('directorateid')) {
                              sqlEnrollmentData += " AND uid1.data= " + "'"+ request.input('directorateid')+ "' ";
                            }
                            if ('0' != request.input('subdirectorateid')) {
                              sqlEnrollmentData += " AND uid2.data= " + "'"+ request.input('subdirectorateid') + "' ";
                            }

    let getResultEnrol = await Database.connection('db_reader').raw(sqlEnrollmentData);

    
    let reportType = "Report Type : Learning Completions - 3 ";
    let remark = "Remark : ";
    let arrJourneyCourseModuleListHeaders = [];





    paramsExport.headers = [
        reportType,
        "Enrollment Range : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
        "Completion Range : " + completionStartDate.split('-').join('/') + " - " + completionEndDate.split('-').join('/'),

    ];
    paramsExport.table_heads_additional = [

    ];
    paramsExport.table_heads = [
      { main_header: "No", key: "no", width: 5, main_header_width: 5 },

      { main_header: "NIP", key: "nip", width: 20, main_header_width: 20 },
      { main_header: "Name", key: "name", width: 50, main_header_width: 50 },
      { main_header: "Email", key: "email", main_header_width: 30 },
      { main_header: "Directorate", key: "directorate", width: 50, main_header_width: 50 },
      { main_header: "Sub Directorate", key: "division", width: 50, main_header_width: 50 },
      { main_header: "Position", key: "position", main_header_width: 50 },

    ];
    let tableHeadAdditional = {};
    if(datasJourney.rows.length > 0){
      remark += datasJourney.rows.length+" Program, ";
      arrJourneyCourseModuleListHeaders.push("Program Name :");
      for (let i = 0; i < datasJourney.rows.length; i++) {
        arrJourneyCourseModuleListHeaders.push(i+1+" "+datasJourney.rows[i].name);
        paramsExport.table_heads.push({
          main_header:datasJourney.rows[i].name,
          main_header_width: 50
        })

      }


    }
    else{
      remark += "All Program, ";

    }
    paramsExport.table_heads.push({
      main_header:"Completions",
      main_header_width: 30
    })
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
    paramsExport.sheetname = "Sheet1 -1";



    paramsExport.datas = [];
    let rowValues = [];
    let counter = 0;
    let resultCheckEnrol = [];
    let percentageSelectedperUser = [];
    let totpercentage = 0;
    let enrolledFull = true;
    let strCompletionPrecentage = '-';
    let strCourseIds = '';
    let strModuleIds = '';
    let arrModuleIds = [];
    let precentageTotalLabel = '-';

    await getResultEnrol[0].forEach(async (data) => {
      precentageTotalLabel = '-'
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
      for (let i = 0; i < datasJourney.rows.length; i++) { 
        resultCheckEnrol = await Database.connection('db_reader').raw(this.sqlCheckEnrolledProgram(data.user_id, datasJourney.rows[i].id, enrolStartDate, enrolEndDate));
        enrolledFull = false;
        if (resultCheckEnrol[0].length > 0)
        {
          enrolledFull = true;
          if (datasJourney.rows.length > 0 && datasCourse.rows.length == 0 && datasModule.rows.length == 0) { 
            percentageSelectedperUser = await Database.connection('db_reader').raw(this.sqlPercentageJourneySelectedPerUser(data.user_id, datasJourney.rows[i].id,  moduleType, completionStartDate, completionEndDate));
          }
          else if (datasJourney.rows.length > 0 && datasCourse.rows.length > 0 && datasModule.rows.length == 0) { 
            strCourseIds = datasJourney.rows[i].getRelated('course').rows.map(res => res.id).join();
            percentageSelectedperUser = await Database.connection('db_reader').raw(this.sqlPercentageJourneyByCourseSelectedPerUser(data.user_id, datasJourney.rows[i].id,strCourseIds,  moduleType, completionStartDate, completionEndDate));
          }
          else if (datasJourney.rows.length > 0 && datasCourse.rows.length > 0 && datasModule.rows.length > 0) { 
            for (let j = 0; j < datasJourney.rows[i].getRelated('course').rows.length; j++) { 
              arrModuleIds = arrModuleIds.concat(datasJourney.rows[i].getRelated('course').rows[j].getRelated('course_modules').rows.map(res => res.module_id))
            } 
            
             strModuleIds = arrModuleIds.join();
             percentageSelectedperUser = await Database.connection('db_reader').raw(this.sqlPercentageJourneyByModuleSelectedPerUser(data.user_id, datasJourney.rows[i].id,strModuleIds,  moduleType, completionStartDate, completionEndDate));
          }
          if (percentageSelectedperUser[0].length > 0) {
            strCompletionPrecentage = (percentageSelectedperUser[0][0].persentase_journey + 0) + "%";
            
            if(percentageSelectedperUser[0][0].persentase_journey>0){
							totpercentage+=percentageSelectedperUser[0][0].persentase_journey;
						}	
          }
          
          
						
        }
        rowValues.push(strCompletionPrecentage);
        
      }
      if (enrolledFull && totpercentage >= 0) {
         if (datasJourney.rows.length > 0 && datasCourse.rows.length == 0 && datasModule.rows.length == 0) {
           precentageTotalLabel = (totpercentage / datasJourney.rows.map(res => res.id).filter((v, i, a) => a.indexOf(v) === i).length).toFixed(2) + "%";
         }
         else if (datasJourney.rows.length > 0 && datasCourse.rows.length > 0 && datasModule.rows.length == 0) {
           precentageTotalLabel = (totpercentage /  datasJourney.rows[i].getRelated('course').rows.map(res => res.id).filter((v, i, a) => a.indexOf(v) === i).length).toFixed(2) + "%";
         }
         else if (datasJourney.rows.length > 0 && datasCourse.rows.length > 0 && datasModule.rows.length > 0) {
            precentageTotalLabel = (totpercentage /  arrModuleIds.map(res => res.id).filter((v, i, a) => a.indexOf(v) === i).length).toFixed(2) + "%";
         }
        
      }
     
      
      rowValues.push(precentageTotalLabel);
      paramsExport.datas.push({ row_values: rowValues });
      
    });




    let result =  await ExportService.ExportMultiJourneyCompletionsToExcel(paramsExport);
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = result.filename;
    daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
    daaFileExport.type        = "export_multi_journey_learning_completions";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(result.fullpath, result.filename);



  }

  sqlCheckEnrolledProgram(userId, journeyId, startdate, enddate) {
    let sql = "SELECT DISTINCT(u.id) AS user_id "+
                                  "FROM user u "+
                                  "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted  IS NULL "+
                                  "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid djce IS NULL"+
                                  "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id dj.deleted_at IS NULL "+
                                  "WHERE dj.visible=1 AND u.deleted_at IS NULL"+
                                  "AND DATE(djce.created_at) BETWEEN '"+startdate+"' AND '"+enddate+"' "+
                                  "AND dj.id ="+journeyId+" AND u.id="+userId;;
    
    return sql;
  }

  sqlPercentageJourneyByModuleSelectedPerUser(userId, journeyId, mIds, moduleType, startCompletionDateRange, endCompletionDateRange) {
    let sql = "SELECT ROUND((COUNT(DISTINCT(dml.module_id))/totModuleInJourney.jmlModule)*100,2) AS persentase_journey "+
              "FROM daa_module_logs dml "+
              "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id AND dcm.deleted_at IS NULL "+
              "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL "+
              "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL "+
              "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
              "INNER JOIN ( "+
                "SELECT dj.id journey_id, COUNT(DISTINCT(c.id)) jmlModule "+ 
                "FROM daa_journeys dj "+
                "INNER JOIN daa_courses dc ON dc.journey_id=dj.id  AND dc.deleted_at IS NULL"+
                "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id AND dcm.deleted_at IS NULL "+	
                "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL "+
                "WHERE c.visible = 1 AND dj.deleted_at IS NULL ";
              if('0'!= moduleType && ''!= moduleType && 0!= moduleType){
                sql += " AND c.module_type="+moduleType+ " ";
              }
              "AND dj.visible = 1 " +
              "AND dc.visible = 1 " +
              "AND dj.id = " + journeyId + " ";	
              if( ''!= mIds ){
                sql += "AND c.id IN (" + mIds + ") ";
              }
					    
            sql += ") AS totModuleInJourney ON totModuleInJourney.journey_id=dj.id " +
              "WHERE dj.id=" + journeyId + " AND dml.deleted_at IS NULL " +
              "AND dml.user_id=" + userId + " ";
              if( ''!= mIds ){
                sql += "AND dml.module_id IN ("+mIds+") ";
              }
              
              if(0!=startCompletionDateRange && '0'!=startCompletionDateRange && '' != 0!=startCompletionDateRange && 0!=endCompletionDateRange && '0'!=endCompletionDateRange && '' != 0!=endCompletionDateRange){
                  sql += " AND DATE(dml.created_at) BETWEEN '"+startCompletionDateRange+"' AND '"+endCompletionDateRange+"' ";
              }
    return sql;
  }

  sqlPercentageJourneyByCourseSelectedPerUser(userId, journeyId, cIds, moduleType, startCompletionDateRange, endCompletionDateRange) {
    let sql = "SELECT ROUND((COUNT(DISTINCT(dml.module_id))/totModuleInJourney.jmlModule)*100,2) AS persentase_journey "+
              "FROM daa_module_logs dml "+
              "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id AND dcm.deleted_at IS NULL "+
              "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL "+
              "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL "+
              "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
              "INNER JOIN ( "+
                "SELECT dj.id journey_id, COUNT(DISTINCT(c.id)) jmlModule "+ 
                "FROM daa_journeys dj "+
                "INNER JOIN daa_courses dc ON dc.journey_id=dj.id "+
                "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id "+	
                "INNER JOIN course c ON c.id=dcm.module_id "+
                "WHERE c.visible = 1 AND dj.deleted_at IS NULL ";
              if('0'!= moduleType && ''!= moduleType && 0!= moduleType){
                sql += " AND c.module_type="+moduleType+ " ";
              }
              "AND dj.visible = 1 "+
					    "AND dc.visible = 1 "+
					    "AND dj.id = "+journeyId+" "+	
					    "AND dc.id IN ("+cIds+") "+
				      ") AS totModuleInJourney ON totModuleInJourney.journey_id=dj.id "+
				      "WHERE dj.id="+journeyId+" "+
				      "AND dml.user_id="+userId+" "+
				      "AND dml.module_id IN ( "+
                "SELECT c.id "+
                "FROM daa_course_modules dcm "+ 
                "INNER JOIN course c ON c.id = dcm.module_id AND c.deleted_at IS NULL "+
                "INNER JOIN daa_courses dc ON dc.id = dcm.course_id AND dc.deleted_at IS NULL "+
                "INNER JOIN daa_journeys dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
                "WHERE c.visible=1 ";
              if('0'!= moduleType && ''!= moduleType && 0!= moduleType){
                sql += " AND c.module_type="+moduleType+ " ";
              }
            sql += "AND dc.visible=1 AND dcm.deleted_at IS NULL " +
              "AND dcm.deleted_at IS NULL " +
              "AND dj.id=" + journeyId + " ";
              if(''!= cIds ){
                sql += "AND dc.id IN (" + cIds + ") ";
              }
                 
              sql += ") ";
              if(0!=startCompletionDateRange && '0'!=startCompletionDateRange && '' != 0!=startCompletionDateRange && 0!=endCompletionDateRange && '0'!=endCompletionDateRange && '' != 0!=endCompletionDateRange){
                  sql += " AND DATE(dml.created_at) BETWEEN '"+startCompletionDateRange+"' AND '"+endCompletionDateRange+"' ";
              }
    return sql;
  }
  sqlPercentageJourneySelectedPerUser(userId, journeyId,  moduleType, startCompletionDateRange, endCompletionDateRange) {
    let sql = "SELECT ROUND((COUNT(DISTINCT(dml.module_id))/totModuleInJourney.jmlModule)*100,2) AS persentase_journey "+
              "FROM daa_module_logs dml "+
              "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id AND dcm.deleted_at IS NULL "+
              "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL "+
              "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL "+
              "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
              "INNER JOIN ( "+
                "SELECT dj.id journey_id, COUNT(DISTINCT(c.id)) jmlModule "+ 
                "FROM daa_journeys dj "+
                "INNER JOIN daa_courses dc ON dc.journey_id=dj.id AND dc.deleted_at IS NULL "+
                "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id AND dcm.deleted_at IS NULL "+	
                "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL "+
                "WHERE c.visible = 1 ";
              if('0'!= moduleType && ''!= moduleType && 0!= moduleType){
                sql += " AND c.module_type="+moduleType+ " ";
              }
              "AND dj.visible = 1 AND dj.deleted_at IS NULL "+
					    "AND dc.visible = 1 "+
					    "AND dj.id = "+journeyId+" "+	
					    
				      ") AS totModuleInJourney ON totModuleInJourney.journey_id=dj.id "+
				      "WHERE dj.id="+journeyId+" "+
				      "AND dml.user_id="+userId+" AND dml.deleted_at IS NULL "+
				      "AND dml.module_id IN ( "+
                "SELECT c.id "+
                "FROM daa_course_modules dcm "+ 
                "INNER JOIN course c ON c.id = dcm.module_id AND c.deleted_at IS NULL "+
                "INNER JOIN daa_courses dc ON dc.id = dcm.course_id AND dc.deleted_at IS NULL "+
                "INNER JOIN daa_journeys dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
                "WHERE c.visible=1 AND dcm.deleted_at IS NULL ";
              if('0'!= moduleType && ''!= moduleType && 0!= moduleType){
                sql += " AND c.module_type="+moduleType+ " ";
              }
              sql+= "AND dc.visible=1 "+
                "AND dcm.deleted_at IS NULL "+
                "AND dj.id=" + journeyId + " " +
              ") ";
              if(0!=startCompletionDateRange && '0'!=startCompletionDateRange && '' != 0!=startCompletionDateRange && 0!=endCompletionDateRange && '0'!=endCompletionDateRange && '' != 0!=endCompletionDateRange){
                  sql += " AND DATE(dml.created_at) BETWEEN '"+startCompletionDateRange+"' AND '"+endCompletionDateRange+"' ";
              }
    return sql;
  }
}

module.exports = LearningCompletionV3Controller
