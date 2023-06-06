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

class DetailPointXtraController {

    async report({ view, auth, response, request, session, params }) {


    
    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');
    let pointXtraType = request.input('type');
    let journey = {};
    journey = await DaaJourney.query().with('course',(builder)=>{
              //builder.whereNull('deleted_at');
              })
              .where('id', request.input('journey_id')).first();
    let programName = "Program Name : ";
    if (journey) {
      programName = "Program Name : " + journey.name;
    }

    
    




    let paramsExport = {};
    paramsExport.filename = "Detail_of_Learning_Point_";
    let type = "Type : ";
    let reportType = "Report Type : Detail of Learning Point ";

    let sqlEnrollmentDataPointXtra = this.sqlEnrollmentDataPointXtra(pointXtraType,request.input('journey_id'),enrolStartDate,enrolEndDate)
    
    if('users15'==pointXtraType){

        type += " Highest Users (Top 15)";
    }
    if('usersAll'==pointXtraType){
                
        type += " All Users";
        
    }

    console.log(sqlEnrollmentDataPointXtra);
    let getResultEnrol = await Database.connection('db_reader').raw(sqlEnrollmentDataPointXtra);
    let sqlLearningHour = "";
    let badgesPoint = 0;
    let totalPointApproved = 0;
    let actualPoint = 0
    let getResultPointModuleByCoursePerUser = [];
    let getResultPointBadgesApprovedActual = [];
    let counter = 1;
    paramsExport.datas = [];
    let rowValues = [];  
    let pointTotal = 0;  
    getResultEnrol[0].forEach((data) => {
      
      pointTotal = 0;  
      
      rowValues = [
          counter,
          data.nip.toUpperCase(),
          data.fullname.toUpperCase(),
          data.email,
          data.directorate.toUpperCase(),
          data.subdirectorate.toUpperCase(),
          data.positions.toUpperCase(),
        ];
        
        
      if (journey.getRelated('course')) {
        for (let i = 0; i < journey.getRelated('course').rows.length; i++) { 
              getResultPointModuleByCoursePerUser = Database.connection('db_reader').raw(this.sqlPointModuleByCoursePerUser(data.user_id, request.input('journey_id'), journey.getRelated('course').rows[i].id));
              for (let index in getResultPointModuleByCoursePerUser[0]) {
                rowValues.push(getResultPointModuleByCoursePerUser[0][index].mypoint)
                pointTotal += getResultPointModuleByCoursePerUser[0][index].mypoint;
              }
          }
      }
      
      getResultPointBadgesApprovedActual = Database.connection('db_reader').raw(this.sqlPointBadgesApprovedActual(data.user_id, request.input('journey_id'), enrolStartDate, enrolEndDate ))
      badgesPoint=0;
			totalPointApproved=0;
			actualPoint=0;
      if(getResultPointBadgesApprovedActual.length > 0){
        for (let index in  getResultPointBadgesApprovedActual[0]) {
            badgesPoint=getResultPointBadgesApprovedActual[0][index].badges_points;
						totalPointApproved=getResultPointBadgesApprovedActual[0][index].tot_point_approved;
						actualPoint=getResultPointBadgesApprovedActual[0][index].actual_point;	
        }					
      }
      rowValues.push(badgesPoint);
      rowValues.push(totalPointApproved);
      rowValues.push(actualPoint);
      
      paramsExport.datas.push({ row_values: rowValues });
      counter++

    });


    //console.log(getResult[0][0].enrolledDate.toLocaleDateString());

    paramsExport.headers = [
        reportType,
        type,
        programName,
        "Period : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
        ""

    ];

    paramsExport.datas = getResultEnrol[0];
    paramsExport.sheetname = "Sheet1";


    paramsExport.table_heads = [
        { header: "No", key: "no", width: 5 },
        { header: "NIP", key: "nip", width: 20 },
        { header: "Name", key: "name", width: 50 },
        { header: "Email", key: "email", width: 50 },
        { header: "Directorate", key: "directorate", width: 50 },
        { header: "Division", key: "division", width: 50 },
        { header: "Position", key: "position", width: 50 },
    ];
    if (journey) {
        if (journey.getRelated('course')) {
            for (let i = 0; i < journey.getRelated('course').rows.length; i++) { 
                paramsExport.table_heads.push({header : journey.getRelated('course').rows[i].name , key: journey.getRelated('course').rows[i].name.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                                                .map(x => x.toLowerCase()).join('_'), width : 50})
            }
            paramsExport.table_heads.push({ header: "Total Points" ,key: "total_points"  ,width: 30});
            paramsExport.table_heads.push({ header: "Badges Points" ,key: "badges_points"   ,width: 30});
            paramsExport.table_heads.push({ header: "Approved Reward Points" ,key: "approved_reward_points"   ,width: 40});
            paramsExport.table_heads.push({ header: "Actual Points" ,key: "actual_points"   ,width: 30});

        }    
    }
  
    let result =  await ExportService.ExportDetailLearningPointToExcel(paramsExport);
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = result.filename;
    daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
    daaFileExport.type        = "export_detail_learning_points";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(result.fullpath, result.filename);



  }
  sqlEnrollmentDataPointXtra(type,journeyId,startDate,endDate) {
    let sql = "SELECT DISTINCT(u.id) AS user_id "+
	                      ", u.username AS nip "+
											  ", CONCAT(u.firstname,' ', u.lastname) AS fullname "+
											  ", u.email "+
											  ", uid1.data AS directorate "+
											  ", uid2.data AS subdirectorate "+ 
											  ", uid3.data AS positions "+ 
									"FROM `user` u "+
									"INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL "+
									"INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL "+
									"INNER JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL "+
									"INNER JOIN user_info_data uid1 ON uid1.`userid`=u.id AND uid1.`fieldid`=11 "+
									"INNER JOIN user_info_data uid2 ON uid2.`userid`=u.id AND uid2.`fieldid`=2 "+
									"INNER JOIN user_info_data uid3 ON uid3.`userid`=u.id AND uid3.`fieldid`=7 "+
									"WHERE dj.visible=1  "+
									"AND u.deleted=0  "+
									"AND u.suspended=0 "+
                  "AND u.deleted_at IS NULL "+
									"AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+ 
									"AND DATE(djce.created_at) BETWEEN '"+startDate+"' AND '"+endDate+"' "+
                  "AND dj.id = " + journeyId;
    
    if ("users15" == type) {
      sql +=" LIMIT 15 ";
    }
			
                  
    return sql;
  }
  sqlPointModuleByCoursePerUser(userId, journeyId, courseId) {
    let sql="SELECT cm.userid "+
					  ", dcm.module_id "+
					  ", c.fullname AS module_name "+
					  ", IF(ex.point IS NULL, 0, ex.point) AS mypoint "+
					  ", IF(ex.created_at IS NULL, '-', ex.created_at) AS mydate "+
				"FROM daa_course_modules dcm "+
				"JOIN daa_courses dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL "+
				"JOIN daa_journeys dj ON dj.id = dc.journey_id AND dj.deleted_at IS NULL "+
				"JOIN daa_journey_cohort_enrols djce on djce.journey_id = dj.id AND djce.deleted_at IS NULL "+
				"JOIN cohort_members cm ON cm.cohortid=djce.cohort_id AND cm.deleted_at IS NULL "+
				"JOIN course c ON c.id = dcm.module_id  AND c.deleted_at IS NULL"+
				"LEFT JOIN ( "+
					"SELECT id, user_id, module_id, `point`, created_at "+ 
					"FROM daa_user_point "+
					"WHERE user_id="+userId+ " "+
					"AND module_id IN( "+
					  "SELECT c.id "+
						"FROM daa_course_modules dcm "+ 
						"INNER JOIN course c ON c.id = dcm.module_id AND c.deleted_at IS NULL "+
						"INNER JOIN daa_courses dc ON dc.id = dcm.course_id AND dc.deleted_at IS NULL "+
						"INNER JOIN daa_journeys dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
						"WHERE c.visible=1 "+
            "AND dc.visible=1 " +
            "AND dcm.deleted_at IS NULL "+
						"AND dj.id="+journeyId+" "+
						"AND dc.id="+courseId+" "+
					") "+
					"GROUP BY module_id "+
				") ex ON ex.module_id = dcm.module_id "+
				"WHERE dj.visible=1 AND dc.visible=1 AND c.visible=1 "+ 
				"AND dj.id="+journeyId+" "+
				"AND dc.id="+courseId+" "+
				"AND cm.userid="+userId+" "+
				"GROUP BY dcm.module_id ORDER BY dcm.id ASC ";
		
    return sql;
  }
  sqlPointBadgesApprovedActual(userId, journeyId, startDate, endDate ) {
   let sql =  "SELECT IF(up.point IS NULL, 0, SUM(up.point)) AS total_point, "+
					  "IF(point_badge.tot_point_badge IS NULL, 0, point_badge.tot_point_badge) AS badges_points, "+
				      "IF(point_redeem.tot_point_approved IS NULL, 0, point_redeem.tot_point_approved) AS tot_point_approved, "+
				      "((IF(up.point IS NULL, 0, SUM(up.point)) + IF(point_badge.tot_point_badge IS NULL, 0, point_badge.tot_point_badge)) "+
				      "-(IF(point_redeem.tot_point_approved IS NULL, 0, point_redeem.tot_point_approved)) "+
					  ")  "+
					"AS actual_point "+  	
					"FROM daa_user_point up "+
					"INNER JOIN `user` u ON u.id = up.user_id AND u.deleted_at IS NULL "+
					"LEFT JOIN ( "+
					   "SELECT u.id, SUM(drh.point) tot_point_approved "+ 
					   "FROM daa_reward_history drh "+
					   "JOIN `user` u ON u.id=drh.user_id AND u.deleted_at IS NULL "+   
					   "WHERE drh.redeem_status=1 "+
             "AND drh.journey_id=" + journeyId + " " +
             "AND drh.deleted_at IS NULL"
					   "AND drh.user_id="+userId+" "+
					   "GROUP BY u.id	"+
					") point_redeem ON point_redeem.id=u.id "+
					"LEFT JOIN ( "+
					  "SELECT u.id, SUM(dbpc.point) tot_point_badge "+ 
					  "FROM `daa_badge_point_claim` dbpc  "+
					  "JOIN `user` u ON u.id=dbpc.user_id AND u.deleted_at IS NULL "+
					  "JOIN `daa_badges` dbs ON dbs.id=dbpc.badge_id AND dbs.deleted_at IS NULL "+
            "WHERE u.id=" + userId + " " +
            "AND dbpc.deleted_at IS NULL "+   
					  "AND dbs.`daa_journey_id`="+journeyId+" "+ 
					  "GROUP BY u.id "+
					") point_badge ON point_badge.id=u.id "+					
					"WHERE u.deleted=0 AND u.suspended=0  "+
					"AND up.module_id IN ( "+
						"SELECT c.id "+
						"FROM daa_course_modules dcm "+ 
						"INNER JOIN course c ON c.id = dcm.module_id AND c.deleted_at IS NULL "+
						"INNER JOIN daa_courses dc ON dc.id = dcm.course_id AND dc.deleted_at IS NULL "+
						"INNER JOIN daa_journeys dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
            "WHERE c.visible=1  " +
            "AND dcm.deleted_at IS NULL "+   
						"AND dc.visible=1 "+
						"AND dj.id="+journeyId+" "+
					") "+
					"AND DATE(up.created_at) >= '"+startDate+"' "+ 
					"AND DATE(up.created_at) <= '"+endDate+"'  "+
					"AND u.id="+userId+" "+
          "GROUP BY up.user_id";
    
    return sql;
		    
  } 


}

module.exports = DetailPointXtraController
