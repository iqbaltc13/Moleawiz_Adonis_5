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
const DaaFileExport                = use('App/Models/DaaFileExport')
const ExportService = use('App/Services/ExportService')
const { validate }                 = use('Validator')
const Database                     = use('Database')
const Helpers = use('Helpers');
class ContentLibraryCompletionController {

  async report({ view, auth, response, request, session, params }) {


    let datasDirectorate = UserInfoDatum.query();
    if (request.input('directorateid') != "" && request.input('directorateid') != "0" && request.input('directorateid') != 0) {
      datasDirectorate = datasDirectorate.where('data', request.input('directorateid'));
    }
    datasDirectorate = await datasDirectorate.where('fieldid', 11).groupBy('data').orderBy('data').fetch();

    let enrolStartDate = request.input('enrol_start_date');
	let enrolEndDate = request.input('enrol_end_date');
	let contentLibrary = await DaaContentLibrary.query().where('id', request.input('content_library_id')).first();
	let datasModule = await DaaContentLibraryModule.query().with('module', builder => {
      builder.whereNull('deleted_at'); //  select columns / pass array of columns
    }).where('content_library_id', request.input('content_library_id')).fetch();

    let tableHeadAdditional = {};

    let paramsExport = {};
    paramsExport.filename = "Content_Library_Completions_";
    paramsExport.table_heads_additional = [];
    paramsExport.table_heads_down_additional = [];

    let reportType = "Report Type : Content Library Completions ";
    let contenLibraryName = "Content Library : ";
    if(contentLibrary){
      contenLibraryName += contentLibrary.name;
    }

    paramsExport.datas = [];
    let rowValues = [];



    paramsExport.headers = [
        reportType,
        contenLibraryName,
        "Enrollment Range : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
        ""
    ];

    //paramsExport.datas = getResultEnrol[0];
    paramsExport.sheetname = "Sheet1 - 1";


    paramsExport.table_heads = [
        { header: "No", key: "no", width: 10 },
        { header: "Module", key: "module", width: 70 },

    ];
    tableHeadAdditional.header = 'Directorate Name';
    paramsExport.table_heads_additional.push(tableHeadAdditional);
    for (let i = 0; i < datasDirectorate.rows.length; i++) {

      paramsExport.table_heads_down_additional.push({
        header: datasDirectorate.rows[i].data
      });
	}
	  let counter = 0;  
	  let completionContentLibraryByDirectorate = [];
	for (let i = 0; i < datasModule.rows.length; i++) {
		counter++
		rowValues = [
			counter,
			datasModule.rows[i].getRelated('module') ? datasModule.rows[i].getRelated('module').fullname.toUpperCase() : '',

		];
		completionContentLibraryByDirectorate = await Database.connection('db_reader').raw(this.getCompletionContentLibraryByDirectorate( request.input('directorateid'), request.input('content_library_id'), datasModule.rows[i].module_id, enrolStartDate, enrolEndDate));
		
		if (completionContentLibraryByDirectorate[0].length > 0) {
			for (let j = 0; j < completionContentLibraryByDirectorate[0].length; j++) {
				rowValues.push(completionContentLibraryByDirectorate[0][j].totCompleteContentLibrary)

			}
		}
		else {
			for (let i = 0; i < datasDirectorate.rows.length; i++) {

				rowValues.push(0);
			}		
		}
		paramsExport.datas.push({ row_values: rowValues });
    }



    //console.log(paramsExport);

    let result =  await ExportService.ExportContentLibraryCompletionsToExcel(paramsExport);
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = result.filename;
    daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
    daaFileExport.type        = "export_content_library_completions";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(result.fullpath, result.filename);
  }
    moduleContentLibraryData(contentLibraryID){
		let sql = "SELECT DISTINCT(dclm.module_id), c.fullname AS module_name "+
				  "FROM daa_content_library dcl "+
				  "JOIN daa_content_library_module dclm ON dclm.content_library_id = dcl.id AND dclm.deleted_at IS NULL "+
				  "JOIN course c ON c.id = dclm.module_id AND c.deleted_at IS NULL "+
				  "WHERE c.visible=1 AND dcl.deleted_at IS NULL AND dcl.id ="+contentLibraryID+" ORDER BY c.fullname";


		const result       =  Database.connection('db_reader').raw(sql);

        return result;
    }

    getCompletionContentLibraryByDirectorate( directorateID, contentLibraryID, module_id, startdate, enddate)
	{
		let andDirectorateID="";
        if ('0' != directorateID && '' != directorateID && 0 != directorateID ) {
            andDirectorateID=" AND uid1.data='"+directorateID+"' ";
        }


		let sql = "SELECT COUNT(DISTINCT(xx.user_id)) AS totCompleteContentLibrary " +
			"FROM `user` u " +
			"INNER JOIN user_info_data uid1 ON uid1.userid=u.id AND uid1.fieldid=11 " +
			"LEFT JOIN( " +
			"SELECT completedModule.user_id, completedModule.module_id " +
			"FROM ( " +
			"SELECT dml.user_id, dml.module_id " +
			"FROM daa_module_logs dml " +
			"INNER JOIN `user` u ON u.id = dml.user_id AND u.deleted_at IS NULL " +
			"INNER JOIN course c ON c.id = dml.module_id AND c.deleted_at IS NULL " +
			"WHERE u.deleted=0 AND u.suspended=0 AND c.visible=1 AND is_completed=1 " +
			"AND u.id IN( " +

			"SELECT u.id AS userid " +
			"FROM `user` u " +
			"JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL " +
			"JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL " +
			"JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL " +
			"INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 " +
			"WHERE dj.visible=1 " +
			"AND u.deleted=0 " +
			"AND u.deleted_at IS NULL " +
			"AND u.suspended=0 " +
			"AND u.id<>2 " +
			"AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') ";
			if ('0' != directorateID && '' != directorateID && 0 != directorateID ) {
            	sql +=" AND uid1.data='"+directorateID+"' ";
        	}
			sql +=" AND DATE(djce.created_at) BETWEEN '"+startdate+"' AND '"+enddate+"' "+
							 "GROUP BY u.id "+
			") " +
				"GROUP BY dml.user_id, dml.module_id ASC " +
				")AS completedModule " +
				"WHERE NOT EXISTS( " +
				"SELECT * " +
				"FROM ( " +
				"SELECT u.id AS user_id, c.id AS module_id " +
				"FROM daa_journey_cohort_enrols djce " +
				"INNER JOIN cohort_members cm ON cm.cohortid = djce.cohort_id AND cm.deleted_at IS NULL  " +
				"INNER JOIN `user` u ON u.id = cm.userid AND u.deleted_at IS NULL " +
				"INNER JOIN daa_journeys dj ON dj.id = djce.journey_id AND dj.deleted_at IS NULL  " +
				"INNER JOIN daa_courses dc ON dc.journey_id = dj.id AND dc.deleted_at IS NULL " +
				"INNER JOIN daa_course_modules dcm ON dcm.course_id = dc.id AND dcm.deleted_at IS NULL  " +
				"INNER JOIN course c ON c.id = dcm.module_id AND c.deleted_at IS NULL " +
				"INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 " +
				"WHERE u.deleted=0 AND djce.deleted_at IS NULL  AND u.suspended=0 AND dj.visible=1 AND dc.visible=1 AND c.visible=1 " + andDirectorateID +
				" AND DATE(djce.created_at) BETWEEN '" + startdate + "' AND '" + enddate + "' GROUP BY u.id, c.id " +
				" ORDER BY u.id, c.id ASC " +
				") AS enrolledModule " +
				"WHERE enrolledModule.user_id=completedModule.user_id " +
				"AND enrolledModule.module_id=completedModule.module_id " +
				") " +
				") xx ON xx.user_id=u.id " +
				"WHERE u.deleted=0 " +
				"AND u.suspended=0 " +
				"AND u.id<>2 " +
				"AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') ";
				if ('0' != directorateID && '' != directorateID && 0 != directorateID ) {
            		sql +=" AND uid1.data='"+directorateID+"' ";
        		}
				sql += " GROUP BY uid1.data "+
				" ORDER BY uid1.data";

		return sql;
    }
}

module.exports = ContentLibraryCompletionController
