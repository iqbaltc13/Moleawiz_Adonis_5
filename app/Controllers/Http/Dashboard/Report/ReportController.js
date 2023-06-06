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
const Excel                = require('exceljs')

class ReportController {
  constructor() {
    this.startdate = null;
    this.enddate   = null;
    this.orderby   = 'DESC';
    this.status    = 'total_sum_incomplete';
    this.orderbyjourneyname = "ASC";
    this.directorateid = null;
    this.orderByStatus = "DESCINCOMPLETE";
    this.master_data_helper = new MasterDataHelper();
    this.subdirectorateid     = null;
  }



  async index({ view, auth, response, request, session, params }) {
    await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
    await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
    const authUser = auth.user.toJSON()
    return view.render('dashboard.report.index_new',{ authUser : authUser })

  }

  async testExcelJs({ view, auth, response, request, session, params }) {
    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("Sheet1");
    let arrColumnName = [""];
    for (let i = 1; i <= 500; i++) {

      arrColumnName.push(this.getColumnName(i));
    }
    console.log(arrColumnName);

    return true;

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


  async getMasterDirectorate({ view, auth, response, request, session, params }) {
    const masterDirectorate = await this.master_data_helper.getDataMasterDirectorate();
    const result = {
        response_code : 200,
        message: "Success",
        data: masterDirectorate.rows,

      };

    return result;

  }
  async getMasterDivision({ view, auth, response, request, session, params }) {
    let directorateId =   request.input('directorateid');

    const masterDivision = await this.master_data_helper.getDataMasterDivisionRaw(directorateId);
    const result = {
        response_code : 200,
        message: "Success",
        data: masterDivision[0],

      };

    return result;


  }
  async getMasterProgram({ view, auth, response, request,session,params }){
    let directorateId =   request.input('directorateid');
    let division      =   request.input('subdirectorateid');

    //const masterProgram = await this.master_data_helper.getDataMasterProgramRaw(directorateId,division);
    const masterProgram = await DaaJourney.query().whereNull('deleted_at').fetch();
    const result = {
        response_code : 200,
        message: "Success",
        data: masterProgram.rows,

      };

    return result;

  }

  async getMasterProgramSelect2({ view, auth, response, request,session,params }){
    let directorateId =   request.input('directorateid');
    let division      =   request.input('subdirectorateid');

    //const masterProgram = await this.master_data_helper.getDataMasterProgramRaw(directorateId,division);
    let masterProgram = await DaaJourney.query().whereNull('deleted_at').fetch();
    for (let index in masterProgram.rows) {
      masterProgram.rows[index].text = masterProgram.rows[index].name;

    }


    return masterProgram.rows;

  }
  async getMasterCourse({ view, auth, response, request,session,params }){
    let program =   request.input('journeyid');

    const masterCourse = await this.master_data_helper.getDataMasterCourseRaw(program);
    const result = {
        response_code : 200,
        message: "Success",
        data: masterCourse[0],

      };

    return result;
  }
  async getMasterModule({ view, auth, response, request,session,params }){
    let course =   request.input('courseid');

    const masterModule = await this.master_data_helper.getDataMasterModuleRaw(course);
    const result = {
        response_code : 200,
        message: "Success",
        data: masterModule[0],

      };

    return result;
  }
  async getMasterLearner({ view, auth, response, request,session,params }){


    const masterLearner = await this.master_data_helper.getDataMasterLearner();
    const result = {
        response_code : 200,
        message: "Success",
        data: masterLearner.rows,

      };

    return result;
  }
  async getMasterCourseMultipProgram({ view, auth, response, request,session,params }){

    let arrProgram = request.input('multijourney');


    const masterCourse = await this.master_data_helper.getDataMasterCourseMultiJourneyRaw(arrProgram);
    const result = {
        response_code : 200,
        message: "Success",
        data: masterCourse[0],

      };

    return result;

  }

  async getActiveUserTrueData({ view, auth, response, request,session,params }){
    const activeUser = await this.master_data_helper.getActiveUserTrueData();
    const result = {
        response_code : 200,
        message: "Success",
        data: activeUser.rows,

      };

    return result;
  }
  async getContentLibraryData({ view, auth, response, request,session,params }){
    const contentLibrary = await this.master_data_helper.getContentLibraryData();
    const result = {
        response_code : 200,
        message: "Success",
        data: contentLibrary.rows,

    };


    return result;
  }

  async getMasterModuleMultiCourse({ view, auth, response, request,session,params }){
    let arrCourse = [];
    let moduleType = request.input('moduletype');
    let arrSplitId = request.input('multicourse').split('/');
    if(arrSplitId.length > 0){

      for (var i in arrSplitId) {
        let arrSplitSplitId =  arrSplitId[i].split('_')
        if(arrSplitSplitId.length > 0){
          if(arrSplitSplitId[1]!=null){
            arrCourse.push(arrSplitSplitId[1]);
          }
             // Adds "Kiwi"

        }
      }

    }
    const masterModule = await this.master_data_helper.getDataMasterModuleMultiCourseRaw(arrCourse,moduleType);
    const result = {
        response_code : 200,
        message: "Success",
        data: masterModule[0],

      };

    return result;

  }

  getEnrolledUser( journeyID,directorateID, subDirectorateID, startdate, enddate){

		let andDirectorateID='';
    if ('0' != $directorateID) {
      andDirectorateID=" AND uid1.data='"+directorateID+"' ";
    }

		let andSubDirectorateID='';
    if ('0' !== $subDirectorateID) {
      andSubDirectorateID=" AND uid2.data='"+subDirectorateID+"' ";
    }


		let sql = "SELECT uid1.data AS directorate "+
						 ", uid2.data AS subdirectorate "+
						 ", COUNT(DISTINCT(u.id)) AS totEnrolled "+
					"FROM daa_journey_cohort_enrols djce "+
					"JOIN daa_journeys dj ON dj.id = djce.journey_id "+
					"JOIN cohort ch ON ch.id = djce.cohort_id "+
					"JOIN cohort_members cm ON cm.cohortid = ch.id "+
					"JOIN `user` u ON u.id = cm.userid  "+
					"INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
					"INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 "+
					"WHERE u.deleted = 0 "+
					"AND u.suspended = 0 "+
					"AND dj.visible = 1 "+
					"AND dj.id="+journeyID+andDirectorateID+andSubDirectorateID+
					"AND ch.visible = 1 "+
					"AND DATE(djce.created_at) >= '"+startdate+"' AND DATE(djce.created_at) <= '"+enddate+"' "+
					"GROUP BY uid2.data "+
					"ORDER BY uid1.data, uid2.data";

		const result       =  Database.connection('db_reader').raw(sql);

    return result;
  }

  getCompletedCourseBySubDirectorate( journeyID, directorate, subdirectorate, startdate, enddate){

    let sql = "SELECT dc.id AS course_id, sum(if(xx.completeCourse=1, 1,0)) userCompleteCourse " +
      "FROM daa_courses dc " +
      "INNER JOIN daa_journeys dj ON dj.id=dc.journey_id " +
      "LEFT JOIN ( " +
      "SELECT u.id AS user_id " +
      ", dc.id AS course_id " +
      ", dc.name AS course_name " +
      ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInCourse.jmlModule, 1, 0) completeCourse " +
      "FROM `user` u " +
      "LEFT JOIN daa_module_logs dml ON dml.user_id=u.id " +
      "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id " +
      "INNER JOIN course c ON c.id=dcm.module_id " +
      "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id " +
      "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id " +
      "INNER JOIN cohort_members cm ON cm.userid=u.id " +
      "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=dj.id " +
      "INNER JOIN user_info_data uid1 ON uid1.`userid`=u.id AND uid1.`fieldid`=11 " +
      "INNER JOIN user_info_data uid2 ON uid2.`userid`=u.id AND uid2.`fieldid`=2 " +
      "INNER JOIN (" +

      "SELECT dc.id course_id, COUNT(DISTINCT(c.id)) jmlModule " +
      "FROM daa_journeys dj " +
      "INNER JOIN daa_courses dc ON dc.journey_id=dj.id " +
      "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id " +
      "INNER JOIN course c ON c.id=dcm.module_id " +
      "WHERE c.visible = 1 " +
      "AND c.`module_type`=1 " +
      "AND dj.visible = 1 " +
      "AND dc.visible = 1 " +
      "AND dj.id=" + journeyID +
      " GROUP BY dc.id " +
      "ORDER BY dc.name " +
      ") AS totModuleInCourse ON totModuleInCourse.course_id=dc.id " +
      "WHERE u.deleted = 0 " +
      "AND u.suspended = 0 " +

      "AND DATE(djce.created_at) BETWEEN '" + startdate + "' AND '" + enddate + "' " +
      "AND dj.visible = 1 " +
      "AND dc.visible = 1 " +
      "AND c.visible = 1 " +
      "AND c.`module_type`=1 " +
      "AND dj.id=" + journeyID +
      " AND uid1.data='" + $directorate +
      " AND uid2.data='" + subdirectorate +
      " GROUP BY user_id, dc.id "+

			"	  ) xx ON xx.course_id = dc.id "+
			"	WHERE dj.id="+journeyID+
			"	AND dc.visible=1 "+
			" GROUP BY dc.id ORDER BY dc.name";

		const result       =  Database.connection('db_reader').raw(sql);

    return result;
	}

	getCompletedCourseByDirectorate($directorateID, $subDirectorateID, $journeyID, $startdate, $enddate){

		let andDirectorateID="";
		if('0'!==$directorateID){
      andDirectorateID=" AND uid1.data='"+directorateID+"' ";
    }

		let andSubDirectorateID="";
		if('0'!==$subDirectorateID){
      andSubDirectorateID=" AND uid2.data='"+subDirectorateID+"' ";
    }



		$query = "SELECT dc.id AS course_id, sum(if(xx.completeCourse=1, 1,0)) userCompleteCourse "+
		         "FROM daa_courses dc "+
					   "INNER JOIN daa_journeys dj ON dj.id=dc.journey_id "+
					   "LEFT JOIN ( " +
						 "SELECT u.id AS user_id "+
							", dc.id AS course_id "+
							", dc.name AS course_name "+
							", IF(COUNT(DISTINCT(dml.module_id))=totModuleInCourse.jmlModule, 1, 0) completeCourse "+
						"FROM `user` u "+
						"LEFT JOIN daa_module_logs dml ON dml.user_id=u.id "+
						"INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id "+
						"INNER JOIN course c ON c.id=dcm.module_id "+
						"INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id "+
						"INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id "+
						"INNER JOIN cohort_members cm ON cm.userid=u.id "+
						"INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=dj.id "+
						"INNER JOIN user_info_data uid1 ON uid1.`userid`=u.id AND uid1.`fieldid`=11 "+
						"INNER JOIN user_info_data uid2 ON uid2.`userid`=u.id AND uid2.`fieldid`=2 "+
						"INNER JOIN ( "+
							 "SELECT dc.id course_id, COUNT(DISTINCT(c.id)) jmlModule "+
							 "FROM daa_journeys dj  "+
							 "INNER JOIN daa_courses dc ON dc.journey_id=dj.id "+
							 "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id "+
							 "INNER JOIN course c ON c.id=dcm.module_id "+
							 "WHERE c.visible = 1 "+
							 "AND c.`module_type`=1 "+
							 "AND dj.visible = 1 "+
							 "AND dc.visible = 1 "+
							 "AND dj.id="+journeyID+
							 " GROUP BY dc.id "+
							 "ORDER BY dc.name "+
						") AS totModuleInCourse ON totModuleInCourse.course_id=dc.id "+
						"WHERE u.deleted = 0 "+
						"AND u.suspended = 0 "+
						"AND DATE(djce.created_at) BETWEEN '"+startdate+"' AND '"+enddate+"' "+
						"AND dj.visible = 1 "+
						"AND dc.visible = 1 "+
 						"AND c.visible = 1 "+
						"AND c.`module_type`=1 "+
						"AND dj.id="+journeyID+andSubDirectorateID+andDirectorateID+
						" GROUP BY user_id, dc.id "+
						"HAVING completeCourse=1 "+
				   ") xx ON xx.course_id = dc.id "+
					 "WHERE dj.id="+journeyID+
					 " AND dc.visible = 1 "+
				  "GROUP BY dc.id";

		const result       =  Database.connection('db_reader').raw(sql);

    return result;
	}

	getCompletedByJourney(directorateID, subDirectorateID, journeyID, startdate, enddate){
		let andDirectorateID="";
		if('0'!==$directorateID){
      andDirectorateID=" AND uid1.data='"+directorateID+"' ";
    }

		let andSubDirectorateID="";
		if('0'!==$subDirectorateID){
      andSubDirectorateID=" AND uid2.data='"+subDirectorateID+"' ";
    }

		$felter = $andDirectorateID.$andSubDirectorateID;
		let sql = "SELECT xx.journey_id, COUNT(xx.completeJourney) userCompleteJourney, yy.totEnrolled "+
					  "FROM ( "+
						"SELECT u.id AS user_id "+
								", dj.id AS journey_id , dj.name AS journey_name "+
							  ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInJourney.jmlModule, 1, 0) completeJourney "+
						"FROM `user` u "+
						"LEFT JOIN daa_module_logs dml ON dml.user_id=u.id "+
						"INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id "+
						"INNER JOIN course c ON c.id=dcm.module_id "+
						"INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id "+
						"INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id "+
						"INNER JOIN cohort_members cm ON cm.userid=u.id "+
						"INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=dj.id "+
						"INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
						"INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 "+
						"INNER JOIN ( "+
							"SELECT dj.id journey_id, COUNT(DISTINCT(c.id)) jmlModule "+
							"FROM daa_journeys dj "+
							"INNER JOIN daa_courses dc ON dc.journey_id=dj.id "+
							"INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id "+
							"INNER JOIN course c ON c.id=dcm.module_id "+
							"WHERE c.visible = 1 AND c.`module_type`=1 AND dj.visible = 1 AND dc.visible = 1 "+
							"AND dj.id="+journeyID +
						" ) AS totModuleInJourney ON totModuleInJourney.journey_id=dj.id "+
						"WHERE u.deleted = 0 AND u.suspended = 0 "+felter+
						"AND DATE(djce.created_at) BETWEEN '"+startdate+"' AND '"+enddate+"' "+
						"AND dj.visible = 1 AND dc.visible = 1 AND c.visible = 1 AND c.`module_type`=1 "+
						"AND dj.id="+journeyID+
						" GROUP BY user_id, dj.id "+
						"HAVING completeJourney=1 "+
					") xx "+
					"inner join ( "+
						"SELECT dj.id AS journey_id, COUNT(DISTINCT(u.id)) AS totEnrolled "+
						"FROM daa_journey_cohort_enrols djce "+
						"JOIN daa_journeys dj ON dj.id = djce.journey_id "+
						"JOIN cohort ch ON ch.id = djce.cohort_id "+
						"JOIN cohort_members cm ON cm.cohortid = ch.id "+
						"JOIN `user` u ON u.id = cm.userid "+
						"INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
						"INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 "+
						"WHERE u.deleted = 0 AND u.suspended = 0 AND dj.visible = 1 "+
						"AND dj.id="+journeyID+felter+
						"AND ch.visible = 1 "+
						"AND DATE(djce.created_at) >= '"+startdate+"' AND DATE(djce.created_at) <= '"+enddate+"' "+
						"GROUP BY dj.id ) yy on yy.journey_id=xx.journey_id";

		const result       =  Database.connection('db_reader').raw(sql);

    return result;
	}

}

module.exports = ReportController
