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

class LearningLogController {

  async report({ view, auth, response, request, session, params }) {

    let learner = await User.query().where('id', request.input('learnerid')).first();
    const today = new Date();
    let paramsExport = {};
    paramsExport.filename = "Learning_Logs_";
    let reportType = "Report Type : Learning Logs ";
    let sql = "SELECT master.username AS userid, "+
              "master.journey, " +
              "master.course,  " +
              "master.module, " +
              "master.attempt AS attempt, "+
              "CASE "+
              "WHEN other.value='failed' "+
              "THEN '-' "+
              "WHEN other.value='passed' "+
              "THEN (SELECT score FROM daa_module_logs WHERE user_id="+request.input('learnerid')+" AND module_id=master.cid AND daa_module_logs.deleted_at IS NULL LIMIT 1 ) "+
              "WHEN other.value='completed' "+
              "THEN (SELECT score FROM daa_module_logs WHERE user_id="+request.input('learnerid')+" AND module_id=master.cid AND daa_module_logs.deleted_at IS NULL LIMIT 1 ) "+
              "ELSE( "+
              "CASE "+
              "WHEN ("+"SELECT module_id FROM daa_module_logs WHERE user_id="+request.input('learnerid')+" AND module_id=master.cid AND daa_module_logs.deleted_at IS NULL LIMIT 1) "+
              "THEN (SELECT score FROM daa_module_logs WHERE user_id="+request.input('learnerid')+" AND module_id=master.cid AND daa_module_logs.deleted_at IS NULL LIMIT 1) "+
              "ELSE '-' "+
              "END "+
              ") "+
              "END AS score, "+
              "CASE  "+
              "WHEN other.value!='incomplete'  "+
              "THEN other.value  "+
              "ELSE( "+
              "CASE "+
              "WHEN (SELECT module_id FROM daa_module_logs WHERE user_id="+request.input('learnerid')+" AND module_id=master.cid AND daa_module_logs.deleted_at IS NULL LIMIT 1) "+
              "THEN 'passed' "+
              "ELSE 'incomplete' "+
              "END "+
              ") "+
              "END AS `status`, "+
              "IFNULL(other2.value, '0') AS lates_module_page, "+
              "IF(exists(select * "+
                "from daa_module_logs dml "+
                "where dml.module_id = master.cid "+
                "AND dml.user_id="+request.input('learnerid')+ " AND dml.deleted_at IS NULL), "+
                "DATE_FORMAT(master.updated_at, '%Y-%m-%d %H:%i:%s') , '-') as time_end, "+
              "master.duration "+
              "FROM ( "+
              "SELECT u.username, "+
                    "s.id,  "+
                    "c.id AS cid, "+
                    "dj.id AS journey_id, "+
                    "dj.name AS journey, "+
                    "dc.id AS course_id, "+
                    "dc.name AS course, "+
                    "c.fullname AS module, "+
                    "sst.attempt, sst.timemodified, sst.updated_at,  "+
                    "IFNULL(other.value, '-') AS duration "+
              "FROM scorm_scoes_track sst "+
              "INNER JOIN  scorm s ON s.id = sst.scormid "+
              "INNER JOIN course c ON c.id = s.course "+
              "INNER JOIN `user` u ON u.id = sst.userid "+
              "INNER JOIN daa_course_modules dcm ON dcm.module_id = c.id "+
              "INNER JOIN daa_courses dc ON dc.id = dcm.course_id "+
              "INNER JOIN daa_journeys dj ON dj.id = dc.journey_id "+
              "LEFT JOIN ( "+
              "SELECT * FROM scorm_scoes_track WHERE userid="+request.input('learnerid')+" AND element='cmi.core.session_time' AND scorm_scoes_track.deleted_at IS NULL "+
              ") AS other ON other.scormid = sst.scormid AND other.attempt = sst.attempt  "+
              "WHERE sst.userid="+request.input('learnerid') + " AND sst.deleted_at IS NULL " +
              "GROUP BY s.id, sst.attempt "+
              "ORDER BY journey_id, course_id ASC "+
              ") AS `master` "+
              "LEFT JOIN ( "+
              "SELECT * FROM scorm_scoes_track WHERE userid="+request.input('learnerid')+" AND element='cmi.core.lesson_status' AND scorm_scoes_track.deleted_at IS NULL "+
              ") AS other ON other.scormid = master.id AND other.attempt = master.attempt "+
              "LEFT JOIN ( "+
              "SELECT * FROM scorm_scoes_track WHERE userid="+request.input('learnerid')+" AND element='cmi.core.lesson_location' AND scorm_scoes_track.deleted_at IS NULL "+
              ") AS other2 ON other2.scormid = master.id AND other2.attempt = master.attempt ";





                console.log(sql);
        let getResult = await Database.connection('db_reader').raw(sql);

        //console.log(getResult[0][0].enrolledDate.toLocaleDateString());

        paramsExport.headers = [
            reportType,
            "Name : "+learner.firstname.toUpperCase()+' '+learner.lastname.toUpperCase()+' '+'('+learner.username+')',
            "Print Date : "+today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate(),
            ""

        ];
        paramsExport.datas = getResult[0];
        paramsExport.sheetname = "Sheet1";


        paramsExport.table_heads = [
            { header: "No", key: "no", width: 5 },
            { header: "NIP", key: "nip", width: 20 },
            { header: "Program", key: "program", width: 50 },
            { header: "Course", key: "course", width: 50 },
            { header: "Module", key: "module", width: 50 },
            { header: "Attempt", key: "attempt", width: 10 },
            { header: "Score", key: "score", width: 10 },
            { header: "Status", key: "status", width: 10 },
            { header: "Latest Module Page", key: "latest_module_page", width: 20 },
            { header: "Date End", key: "date_end", width: 10 },
            { header: "Time End", key: "time_end", width: 10 },
            { header: "Duration", key: "duration", width: 10 },

        ];


        //console.log(paramsExport);

        let result =  await ExportService.ExportLearningLogToExcel(paramsExport);
        const daaFileExport       = await new DaaFileExport();
        daaFileExport.name        = result.filename;
        daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
        daaFileExport.type        = "export_learning_log";
        daaFileExport.userid      =  auth.user.id;
        await daaFileExport.save();

        return response.download(result.fullpath, result.filename);



  }
}

module.exports = LearningLogController
