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

class AccessLearnerController {

  async report({ view, auth, response, request, session, params }) {

    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');


    //console.log(directorate, division, enrolStartDate, enrolEndDate, journey);


    let sql =  "SELECT DATE_FORMAT(duad.access_date, '%d %b %y') AS access_date "+
               " , duad.h0 "+
               " , duad.h1 "+
               " , duad.h2 "+
               " , duad.h3 "+
               " , duad.h4 "+
               " , duad.h5 "+
               " , duad.h6 "+
               " , duad.h7 "+
               " , duad.h8 "+
               " , duad.h9 "+
               " , duad.h10 "+
               " , duad.h11 "+
               " , duad.h12 "+
               " , duad.h13 "+
               " , duad.h14 "+
               " , duad.h15 "+
               " , duad.h16 "+
               " , duad.h17 "+
               " , duad.h18 "+
               " , duad.h19 "+
               " , duad.h20 "+
               " , duad.h21 "+
               " , duad.h22 "+
               " , duad.h23 "+
               " , duad.total_user "+
               " FROM `daa_user_access_daily` duad "+
               " WHERE duad.access_date BETWEEN '"+ enrolStartDate +"' AND '"+ enrolEndDate +"' "+

               " UNION "+

               " SELECT DATE_FORMAT(NOW(), '%d %b %y') AS access_date "+
               " , SUM(duad.h0) AS h0 "+
               " , SUM(duad.h1) AS h1 "+
               " , SUM(duad.h2) AS h2 "+
               " , SUM(duad.h3) AS h3 "+
               " , SUM(duad.h4) AS h4 "+
               " , SUM(duad.h5) AS h5 "+
               " , SUM(duad.h6) AS h6 "+
               " , SUM(duad.h7) AS h7 "+
               " , SUM(duad.h8) AS h8 "+
               " , SUM(duad.h9) AS h9 "+
               " , SUM(duad.h10) AS h10 "+
               " , SUM(duad.h11) AS h11 "+
               " , SUM(duad.h12) AS h12 "+
               " , SUM(duad.h13) AS h13 "+
               " , SUM(duad.h14) AS h14 "+
               " , SUM(duad.h15) AS h15 "+
               " , SUM(duad.h16) AS h16 "+
               " , SUM(duad.h17) AS h17 "+
               " , SUM(duad.h18) AS h18 "+
               " , SUM(duad.h19) AS h19 "+
               " , SUM(duad.h20) AS h20 "+
               " , SUM(duad.h21) AS h21 "+
               " , SUM(duad.h22) AS h22 "+
               " , SUM(duad.h23) AS h23 "+
               " , SUM(duad.total_user) AS total_user "+
               " FROM `daa_user_access_daily` duad "+
               " WHERE duad.access_date BETWEEN '"+ enrolStartDate + "' AND '"+ enrolEndDate +"'";




    let getResult = await Database.connection('db_reader').raw(sql);
    //console.log(getResult[0][0].enrolledDate.toLocaleDateString());
    let paramsExport = {};
    paramsExport.headers = [
        "Report Type : Users Access",
        "Period : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),

        ""

    ];
    paramsExport.datas = getResult[0];
    paramsExport.sheetname = "Sheet1";
    paramsExport.filename = "Users_Access_";

    paramsExport.table_heads = [
        { header: "Date", key: "date", width: 10 },
        { header: "Time Access", key: "time_access", width: 360 },
        { header: "Total Unique Users", key: "total_unique_users", width: 20 },
    ];
    paramsExport.table_heads_child = [

    ];
    for (let i = 0; i <  24; i++) {
      if(i<10){
        paramsExport.table_heads_child.push("0"+i+":"+"00")
      }
      else{
        paramsExport.table_heads_child.push(i+":"+"00")
      }
    }



    //console.log(paramsExport);

    let result =  await ExportService.ExportLearnerAccessToExcel(paramsExport);
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = result.filename;
    daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
    daaFileExport.type        = "export_learner_access";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(result.fullpath, result.filename);

  }
  async reportDetail({ view, auth, response, request, session, params }) {

    let enrolStartDate = request.input('enrol_start_date');
    let enrolEndDate = request.input('enrol_end_date');

    let sql =  "SELECT DATE_FORMAT(duad.access_date, '%d %b %y') AS access_date "+
               ", u.username "+
               ", CONCAT(u.firstname,' ', u.lastname) fullname "+
               "FROM `daa_user_access_detail` duad "+
               "JOIN `user` u ON u.id=duad.user_id AND u.deleted_at IS NULL "+
               "WHERE duad.access_date BETWEEN '"+ enrolStartDate + "' AND '"+ enrolEndDate +"' " +
               "ORDER BY duad.access_date ";


        let getResult = await Database.connection('db_reader').raw(sql);
        //console.log(getResult[0][0].enrolledDate.toLocaleDateString());
        let paramsExport = {};
        paramsExport.headers = [
            "Report Type : Detail of Learners Access",
            "Enrollment Range : " + enrolStartDate.split('-').join('/') + " - " + enrolEndDate.split('-').join('/'),
            ""

        ];
        paramsExport.datas = getResult[0];
        paramsExport.sheetname = "Sheet1";
        paramsExport.filename = "Learners_Access_Detail";

        paramsExport.table_heads = [
            { header: "Date", key: "no", width: 20 },
            { header: "NIP", key: "nip", width: 50 },
            { header: "Name", key: "name", width: 50 },

        ];


        //console.log(paramsExport);

        let result =  await ExportService.ExportDetailOfLearnerAccesssToExcel(paramsExport);
        const daaFileExport       = await new DaaFileExport();
        daaFileExport.name        = result.filename;
        daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
        daaFileExport.type        = "export_detail_of_learner_access";
        daaFileExport.userid      =  auth.user.id;
        await daaFileExport.save();

        return response.download(result.fullpath, result.filename);



  }
}

module.exports = AccessLearnerController
