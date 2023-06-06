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

class RegsteredUserController {
    async report({ view, auth, response, request, session, params }) {
        let directorate = await UserInfoDatum.query().where('data', request.input('directorateid')).where('fieldid', 11).first();
        let division = await UserInfoDatum.query().where('data', request.input('subdirectorateid')).where('fieldid', 2).first();
        let enrolStartDate = request.input('enrol_start_date');
        let enrolEndDate = request.input('enrol_end_date');
        let journey = await DaaJourney.query().where('id', request.input('journey_id')).first();

        //console.log(directorate, division, enrolStartDate, enrolEndDate, journey);


        let sql =  "SELECT uid1.data AS directorate " +
            ", uid2.data as subdirectorate " +
            ", uid3.data as positions " +
            ", u.id AS user_id " +
            ", u.username as nip " +
            ", CONCAT(u.firstname,' ',u.lastname) myname " +
            ", u.email " +
            ", dj.id AS journey_id " +
            ", dj.name AS journey_name " +
            ", djce.created_at as enrolledDate " +
            "FROM daa_journey_cohort_enrols djce " +
            "JOIN daa_journeys dj ON dj.id = djce.journey_id " +
            "JOIN cohort ch ON ch.id = djce.cohort_id AND ch.deleted_at IS NULL " +
            "JOIN cohort_members cm ON cm.cohortid = ch.id AND ch.deleted_at IS NULL " +
            "JOIN `user` u ON u.id = cm.userid " +
            "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 " +
            "INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 " +
            "INNER JOIN user_info_data uid3 ON uid3.userid = u.id AND uid3.fieldid=7 " +
            "WHERE u.deleted = 0 " +
            "AND u.suspended = 0 " +
            "AND dj.visible = 1 " +
            "AND ch.visible = 1 " +
            "AND u.deleted_at IS NULL " +
            "AND djce.deleted_at IS NULL "+
            "AND SUBSTRING(ch.name, 1, 4) regexp '[0-9]' " +
            "AND DATE(djce.created_at) >= '" + enrolStartDate + "' AND DATE(djce.created_at) <= '" + enrolEndDate + "' ";


            if('0' != request.input('directorateid')) {
                sql += " AND uid1.data= " + "'"+ request.input('directorateid')+ "'";
            }

            if ('0' != request.input('subdirectorateid')) {
                sql += " AND uid2.data= " + "'"+ request.input('subdirectorateid') + "'";
            }

            if ('0' != request.input('journey_id')) {
                sql += " AND dj.id= " + request.input('journey_id');
            }
            
        let getResult = await Database.connection('db_reader').raw(sql);
        //console.log(getResult[0][0].enrolledDate.toLocaleDateString());
        let paramsExport = {};
        paramsExport.headers = [
            "Report Type : Registered Users",
            "Period : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
            "Directorate : " + request.input('directorateid'),
            "Division : " + request.input('subdirectorateid'),
            "Program : " + journey.name,
            ""

        ];
        paramsExport.datas = getResult[0];
        paramsExport.sheetname = "Sheet1";
        paramsExport.filename = "Registered_Learners_";

        paramsExport.table_heads = [
            { header: "No", key: "no", width: 20 },
            { header: "NIP", key: "nip", width: 20 },
            { header: "Name", key: "name", width: 20 },
            { header: "Email", key: "name", width: 20 },
            { header: "Directorate", key: "directorate", width: 20 },
            { header: "Division", key: "division", width: 20 },
            { header: "Position", key: "position", width: 20 },
            { header: "Program Name", key: "journey", width: 20 },
            { header: "Enrolled Date", key: "enrolled_date", width: 20 },
            { header: "Enrolled Time", key: "enrolled_time", width: 20 },
        ];


        //console.log(paramsExport);

        let result =  await ExportService.ExportRegisteredLearnersToExcel(paramsExport);
        const daaFileExport       = await new DaaFileExport();
        daaFileExport.name        = result.filename;
        daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
        daaFileExport.type        = "export_registered_learners";
        daaFileExport.userid      =  auth.user.id;
        await daaFileExport.save();

        return response.download(result.fullpath, result.filename);

    }
}

module.exports = RegsteredUserController
