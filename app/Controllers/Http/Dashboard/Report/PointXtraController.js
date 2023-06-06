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

class PointXtraController {

    goLearningLogNew(userid){

		let sql = "SELECT master.username AS userid, "+
		                 "master.journey, "+
						 "master.course, "+
						 "master.mmodule, "+
						 "master.attempt AS attempt, "+
						"CASE "+
						"WHEN other.value='failed' "+
							"THEN '-' "+
						"WHEN other.value='passed' "+
							"THEN (SELECT score FROM daa_module_logs WHERE user_id="+userid+" AND module_id=master.cid LIMIT 1) "+
						"WHEN other.value='completed' "+
							"THEN (SELECT score FROM daa_module_logs WHERE user_id="+userid+" AND module_id=master.cid LIMIT 1) "+
						"ELSE( "+
							"CASE "+
							"WHEN (SELECT module_id FROM daa_module_logs WHERE user_id="+userid+" AND module_id=master.cid LIMIT 1) "+
								"THEN (SELECT score FROM daa_module_logs WHERE user_id="+userid+" AND module_id=master.cid LIMIT 1) "+
							"ELSE '-' "+
							"END "+
						") "+
						"END AS score, "+
						"CASE "+
						"WHEN other.value!='incomplete' "+
							"THEN other.value "+
						"ELSE( "+
							"CASE "+
							"WHEN (SELECT module_id FROM daa_module_logs WHERE user_id="+userid+" AND module_id=master.cid LIMIT 1) "+
								"THEN 'passed' "+
							"ELSE 'incomplete' "+
							"END "+
						") "+
						"END AS `status`, "+
						"IFNULL(other2.value, '0') AS lates_module_page, "+
						"IF(exists(select * "+
								  "from daa_module_logs dml "+
								  "where dml.module_id = master.cid "+
								  "AND dml.user_id="+userid+
						" ), FROM_UNIXTIME(master.timemodified/1000, '%Y-%m-%d %H:%i:%s') , '-') as time_end , "+
						"master.duration "+
				"FROM ( "+
						"SELECT u.username, "+
						        "s.id, "+
								"c.id AS cid, "+
								"dj.id AS journey_id, "+
								"dj.name AS journey , "+
								"dc.id AS course_id, "+
								"dc.name AS course, "+
								"c.fullname AS mmodule, "+
								"sst.attempt, sst.timemodified, "+
								"IFNULL(other.value, '-') AS duration "+
						"FROM scorm_scoes_track sst "+
						"INNER JOIN  scorm s ON s.id = sst.scormid "+
						"INNER JOIN course c ON c.id = s.course "+
						"INNER JOIN `user` u ON u.id = sst.userid "+
						"INNER JOIN daa_course_modules dcm ON dcm.module_id = c.id "+
						"INNER JOIN daa_courses dc ON dc.id = dcm.course_id "+
						"INNER JOIN daa_journeys dj ON dj.id = dc.journey_id "+
						"LEFT JOIN ( "+
							"SELECT * FROM scorm_scoes_track WHERE userid="+userid+" AND element='cmi.core.session_time' "+
						") AS other ON other.scormid = sst.scormid AND other.attempt = sst.attempt "+
						"WHERE sst.userid="+userid+
						" GROUP BY s.id, sst.attempt"+
						" ORDER BY journey_id, course_id ASC "+
				") AS `master` "+
				"LEFT JOIN ( "+
					"SELECT * FROM scorm_scoes_track WHERE userid="+userid+" AND element='cmi.core.lesson_status' "+
				") AS other ON other.scormid = master.id AND other.attempt = master.attempt "+
				"LEFT JOIN ( "+
					"SELECT * FROM scorm_scoes_track WHERE userid="+userid+" AND element='cmi.core.lesson_location' "+
				") AS other2 ON other2.scormid = master.id AND other2.attempt = master.attempt";

		const result       =  Database.connection('db_reader').raw(sql);

        return result;
	}

 async report({ view, auth, response, request, session, params }) {

    let pointXtraType = request.input('type');
    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');



    let paramsExport = {};
    paramsExport.filename = "Learning_Point_";
    let reportType = "Report Type : Learning Point ";
	  let type = "Type :";
    let sql =       "SELECT u.id AS user_id, u.username, u.email, u.firstname, u.lastname "+
					", SUM(up.point) AS total_point "+
					", u.daa_picture "+
					", uid1.data as directorate "+
					", uid2.data as subdirectorate "+
					", uid3.data AS positions "+
					", IF(point_badge.tot_point_badge IS NULL, 0, point_badge.tot_point_badge) AS badges_points "+
					", IF(point_redeem.tot_point_approved IS NULL, 0, point_redeem.tot_point_approved) AS tot_point_approved "+
					", ((IF(up.point IS NULL, 0, SUM(up.point)) + IF(point_badge.tot_point_badge IS NULL, 0, point_badge.tot_point_badge)) "+
						" -(IF(point_redeem.tot_point_approved IS NULL, 0, point_redeem.tot_point_approved)) "+
						") AS actual_point "+
					"FROM daa_user_point up "+
					"INNER JOIN `user` u ON u.id = up.user_id AND u.deleted_at IS NULL "+
					"INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
					"INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 "+
					"INNER JOIN user_info_data uid3 ON uid3.userid = u.id AND uid3.fieldid=7 "+
					"LEFT JOIN ( "+
					   "SELECT u.id, SUM(drh.point) tot_point_approved "+
					   "FROM daa_reward_history drh "+
					   "JOIN `user` u ON u.id=drh.user_id  AND u.deleted_at IS NULL "+
					   "WHERE drh.redeem_status=1 AND drh.deleted_at IS NULL "+
					   "GROUP BY u.id "+
					") point_redeem ON point_redeem.id=u.id "+
					"LEFT JOIN ( "+
					  "SELECT u.id, SUM(dbpc.point) tot_point_badge "+
					  "FROM `daa_badge_point_claim` dbpc "+
					  "JOIN `user` u ON u.id=dbpc.user_id  AND u.deleted_at IS NULL "+
                      "WHERE dbpc.deleted_at IS NULL "+
					  "GROUP BY u.id "+
					") point_badge ON point_badge.id=u.id "+
					"WHERE u.deleted=0 AND u.suspended=0 AND up.deleted_at IS NULL "+
					"AND DATE(up.created_at) >= '"+ enrolStartDate +"' "+
					"AND DATE(up.created_at) <= '"+ enrolEndDate +"' "+
					"GROUP BY u.id "+
					"ORDER BY total_point DESC ";

                if('users15'==pointXtraType){
                  sql +=" LIMIT 15";

                  paramsExport.filename += "Highest Users (Top 15)";
                  type += " Highest Users (Top 15)";
				}
				if('usersAll'==pointXtraType){

					paramsExport.filename += "All_Users_";
					type += " All Users";

                }



                console.log(sql);
        let getResult = await Database.connection('db_reader').raw(sql);

        //console.log(getResult[0][0].enrolledDate.toLocaleDateString());

        paramsExport.headers = [
			reportType,
			type,
            "Period : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
            ""

        ];
        paramsExport.datas = getResult[0];
        paramsExport.sheetname = "Sheet1";


        paramsExport.table_heads = [
            { header: "No", key: "no", width: 5 },
            { header: "NIP", key: "nip", width: 20 },
            { header: "Name", key: "name", width: 50 },
            { header: "Email", key: "email", width: 50 },
            { header: "Directorate", key: "directorate", width: 50 },
            { header: "Division", key: "division", width: 50 },
            { header: "Position", key: "position", width: 50 },
            { header: "Total Points", key: "total_points", width: 20 },
			{ header: "Badges Points", key: "badges_points", width: 20 },
			{ header: "Approved Reward Points", key: "approved_reward_points", width: 20 },
            { header: "Actual Points", key: "actual_points", width: 20 },

        ];


        //console.log(paramsExport);

        let result =  await ExportService.ExportLearningPointToExcel(paramsExport);
        const daaFileExport       = await new DaaFileExport();
        daaFileExport.name        = result.filename;
        daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
        daaFileExport.type        = "export_learning_points";
        daaFileExport.userid      =  auth.user.id;
        await daaFileExport.save();

        return response.download(result.fullpath, result.filename);



  }
}

module.exports = PointXtraController
