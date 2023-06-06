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

class CertificateNumberController {

  async report({ view, auth, response, request, session, params }) {


    let directorate = await UserInfoDatum.query().where('data', request.input('directorateid')).where('fieldid', 11).first();
    let division = await UserInfoDatum.query().where('data', request.input('subdirectorateid')).where('fieldid', 2).first();
    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');
    let journey = {};
    journey = await DaaJourney.query().where('id', request.input('journey_id')).first();
    let programName = "Program Name : "; 
    if (journey) {
      programName = "Program Name : " + journey.name;
    }
    let directorateName = "Directorate : ";
    if (directorate) {
      directorateName += request.input('directorateid');
    }
    let divisionName = "Sub Directorate : ";
     if (division) {
      divisionName += request.input('subdirectorateid');
    }



    let paramsExport = {};
    paramsExport.filename = "Certificate_Number__";
    let reportType = "Report Type : Certificate Number ";
    let sql = "SELECT " +
              "DISTINCT(u.id) AS user_id " +
              ", u.username AS nip " +
              ", CONCAT(u.firstname,' ', u.lastname) AS fullname " +
              ", u.email " +
              ", uid1.data AS directorate " +
              ", uid2.data AS subdirectorate " +
              ", dcertu2.number_certificate " +
              ", IF(dcertu2.created_at IS NOT NULL,DATE_FORMAT(dcertu2.created_at, '%d %M %Y'),'') AS completed_date " +
              ", dcertu2.score " +
              ",dj.name as journey_name " +
              "FROM `user` u " +
              "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL " +
              "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL " +
              "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL " +
              "INNER JOIN user_info_data uid1 ON uid1.`userid`=u.id AND uid1.`fieldid`=11 " +
              "INNER JOIN user_info_data uid2 ON uid2.`userid`=u.id AND uid2.`fieldid`=2 " +
              "JOIN daa_certificate_users2 dcertu2 ON dcertu2.`userid`=u.`id` AND dcertu2.deleted_at IS NULL " +
              "JOIN daa_certificate2 dcert ON dcertu2.`daa_certificate_id`=dcert.`id` AND dcert.deleted_at IS NULL ";
       
                if ('0' != request.input('journey_id')) {
                  sql += " AND dcert.`daa_journey_id` =  " + "'"+ request.input('journey_id') + "' ";
                }
        sql+= "WHERE dj.visible=1 "+
              "AND u.deleted=0 "+
              "AND u.suspended=0 "+
              "AND u.deleted_at IS NULL "+
              "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+ 
              "AND djce.created_at >= '"+ enrolStartDate +"' "+
              "AND djce.created_at <=  '"+ enrolEndDate + "' ";

                
                if('0' != request.input('directorateid')) {
                  sql += " AND uid1.data= " + "'"+ request.input('directorateid')+ "' ";
                }
                if ('0' != request.input('subdirectorateid')) {
                  sql += " AND uid2.data= " + "'"+ request.input('subdirectorateid') + "' ";
                }
                if ('0' != request.input('journey_id')) {
                  sql += " AND dj.id= " + "'"+ request.input('journey_id') + "'";
                }

                

                console.log(sql);
        let getResult = await Database.connection('db_reader').raw(sql);

        //console.log(getResult[0][0].enrolledDate.toLocaleDateString());

        paramsExport.headers = [
            reportType,
            "Period : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
            programName,
            directorateName,
            divisionName ,
            ""

        ];
        paramsExport.datas = getResult[0];
        paramsExport.sheetname = "Sheet1";


        paramsExport.table_heads = [
            { header: "No", key: "no", width: 5 },
            { header: "NIP", key: "nip", width: 20 },
            { header: "Name", key: "name", width: 50 },
          
            { header: "Directorate", key: "directorate", width: 50 },
            { header: "Division", key: "division", width: 50 },
            { header: "Certificate Number", key: "position", width: 50 },
            { header: "Date", key: "date", width: 15 },
            { header: "Score", key: "score", width: 10 },

        ];


        //console.log(paramsExport);

        let result =  await ExportService.ExportCertificateNumberToExcel(paramsExport);
        const daaFileExport       = await new DaaFileExport();
        daaFileExport.name        = result.filename;
        daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
        daaFileExport.type        = "export_certificate_number";
        daaFileExport.userid      =  auth.user.id;
        await daaFileExport.save();

        return response.download(result.fullpath, result.filename);



  }
}

module.exports = CertificateNumberController
