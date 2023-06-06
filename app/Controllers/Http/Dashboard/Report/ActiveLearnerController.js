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

class ActiveLearnerController {
  getActiveUsers( directorateID, subDirectorateID, startdate, enddate, sortBy){

		let andDirectorateID='';
		if('0'!==$directorateID){
      andDirectorateID=" AND uid1.data='"+directorateID+"' ";
    }

		let andSubDirectorateID='';
		if('0'!==subDirectorateID){
      andSubDirectorateID=" AND uid2.data='"+subDirectorateID+"' ";
    }

		let searchQuery1 = " ";
		if('activeUser'==sortBy){
      searchQuery1=" AND dml.user_id IS NOT NULL";
    }
		else if('inactiveUser'==sortBy){
      searchQuery1=" AND dml.user_id IS NULL";
    }

		let sql = "SELECT "+
              "u.username AS nip "+
              ",u.email "+
              ",CONCAT(u.firstname,' ',u.lastname) AS fullname "+
              ",MAX(dml.last_open) AS access_date "+
              ",uid1.data AS directorate "+
              ",uid2.data AS subdirectorate "+
              ",FROM_UNIXTIME(dml.created_at) AS access_date2 "+
              "FROM user u "+
              "JOIN daa_module_logs dml ON dml.user_id =u.id "+
              "JOIN scorm s ON s.course = dml.module_id "+
              "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
              "INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 "+
              "WHERE "+
              "u.username REGEXP '^[0-9]+$' AND LENGTH(u.username) = 8 "+
              "AND u.deleted = 0 "+
              "AND u.suspended = 0 "+
              "AND "+
              "dml.last_open>='"+startdate+"' AND dml.last_open<='"+enddate+"'  "+searchQuery1+andDirectorateID+andSubDirectorateID+" GROUP BY u.username ";

    const result       =  Database.connection('db_reader').raw(sql);

    return result;
	}

  goRegisteredUsers(journeyID, directorateID, subDirectorateID, startdate, enddate){

		let andDirectorateID='';
		if('0'!= directorateID){
      andDirectorateID=" AND uid1.data='"+$directorateID+"' ";
    }
		let andSubDirectorateID='';
		if('0'!=subDirectorateID){
      andSubDirectorateID=" AND uid2.data='"+subDirectorateID+"' ";
    }

		let andJourneyID='';
		if('0'!=journeyID){
      andJourneyID=" AND dj.id="+journeyID;
    }


		// pastikan nama chohort untuk menggunakan 4 digit number di depannya
		let sql = "SELECT uid1.data AS directorate "+
						 ", uid2.data as subdirectorate "+
						 ", uid3.data as positions "+
						 ", u.id AS user_id "+
						 ", u.username as nip "+
						 ", CONCAT(u.firstname,' ',u.lastname) myname "+
						 ", u.email "+
						 ", dj.id AS journey_id "+
						 ", dj.name AS journey_name "+
						 ", djce.created_at as enrolledDate "+
				     "FROM daa_journey_cohort_enrols djce "+
				     "JOIN daa_journeys dj ON dj.id = djce.journey_id "+
					"JOIN cohort ch ON ch.id = djce.cohort_id "+
					"JOIN cohort_members cm ON cm.cohortid = ch.id "+
					"JOIN `user` u ON u.id = cm.userid "+
					"INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
					"INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 " +
					"INNER JOIN user_info_data uid3 ON uid3.userid = u.id AND uid3.fieldid=7 " +
					"WHERE u.deleted = 0 "+
					"AND u.suspended = 0 "+
					"AND dj.visible = 1 "+
					"AND ch.visible = 1 "+
					"AND SUBSTRING(ch.name, 1, 4) regexp '[0-9]' "+
					"AND DATE(djce.created_at) >= '"+startdate+"' AND DATE(djce.created_at) <= '"+enddate+"' "+
				  andDirectorateID+andSubDirectorateID+andJourneyID;

    const result       =  Database.connection('db_reader').raw(sql);

    return result;
	}

  async report({ view, auth, response, request, session, params }) {


    let directorate = await UserInfoDatum.query().where('data', request.input('directorateid')).where('fieldid', 11).first();
    let division = await UserInfoDatum.query().where('data', request.input('subdirectorateid')).where('fieldid', 2).first();
    let sortBy = request.input('sort_by');
    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');



    let paramsExport = {};
    paramsExport.filename = "Active_Learners_";
    let reportType = "Report Type : Active Users ";
    let sql =   "SELECT   u.username AS nip "+
                ", u.email "+
                ", CONCAT(u.firstname,' ', u.lastname) AS fullname "+
                ",  uid1.data as directorate " +
                ", uid2.data as subdirectorate "+
                ", uid3.data as positions "+

                ", dml.created_at AS access_date "+
                "FROM `user` u "+
                "INNER JOIN ( "+
                "SELECT u.id AS userid "+
                "FROM `user` u "+
                "JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL "+
                "JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL "+
                "JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL "+
                "WHERE dj.visible=1 "+
                "AND u.deleted=0 "+
                "AND u.suspended=0 "+
                "AND u.id<>2 "+
                    "AND u.deleted_at IS NULL "+
                "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+

                "AND DATE(djce.created_at) BETWEEN '"+ enrolStartDate + "' AND '"+ enrolEndDate +"' "+
                "GROUP BY u.id "+
                ") AS enrolledUser ON enrolledUser.userid=u.id "+
                "INNER JOIN user_info_data uid1 ON uid1.`userid`=enrolledUser.userid AND uid1.`fieldid`=11 "+
                "INNER JOIN user_info_data uid2 ON uid2.`userid`=enrolledUser.userid AND uid2.fieldid=2 "+
                "INNER JOIN user_info_data uid3 ON uid3.`userid`=enrolledUser.userid AND uid3.fieldid=7 "+
                "LEFT JOIN daa_module_logs dml ON dml.user_id = enrolledUser.userid "+
                "WHERE 1=1 ";

                if('activeUser'==sortBy){
                  sql +=" AND dml.user_id IS NOT NULL";

                  paramsExport.filename += "Active";
                  reportType += "(Active)";
                }

                else if('inactiveUser'==sortBy){
                  sql +=" AND dml.user_id IS NULL";
                  paramsExport.filename += "Inactive";
                  reportType += "(Inactive)";
                }
                else{
                  sql +=" "
                  paramsExport.filename += "All";
                  reportType += "(All)";
                }
                if('0' != request.input('directorateid')) {
                  sql += " AND uid1.data= " + "'"+ request.input('directorateid')+ "'";
                }
                if ('0' != request.input('subdirectorateid')) {
                  sql += " AND uid2.data= " + "'"+ request.input('subdirectorateid') + "'";
                }

                sql += " GROUP BY u.username ";

                console.log(sql);
        let getResult = await Database.connection('db_reader').raw(sql);

        //console.log(getResult[0][0].enrolledDate.toLocaleDateString());

        paramsExport.headers = [
            reportType,
            "Period : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
            ""

        ];
        paramsExport.datas = getResult[0];
        paramsExport.sheetname = "Sheet1";


        paramsExport.table_heads = [
            { header: "No", key: "no", width: 10 },
            { header: "NIP", key: "nip", width: 20 },
            { header: "Name", key: "name", width: 50 },
            { header: "Email", key: "email", width: 50 },
            { header: "Directorate", key: "directorate", width: 50 },
            { header: "Division", key: "division", width: 50 },
            { header: "Position", key: "position", width: 50 },
            { header: "Last Access Date", key: "last_access_date", width: 50 },
            { header: "Last Access Time", key: "last_access_time", width: 50 },

        ];


        //console.log(paramsExport);

        let result =  await ExportService.ExportActiveLearnersToExcel(paramsExport);
        const daaFileExport       = await new DaaFileExport();
        daaFileExport.name        = result.filename;
        daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
        daaFileExport.type        = "export_active_learners";
        daaFileExport.userid      =  auth.user.id;
        await daaFileExport.save();

        return response.download(result.fullpath, result.filename);



  }
}

module.exports = ActiveLearnerController
