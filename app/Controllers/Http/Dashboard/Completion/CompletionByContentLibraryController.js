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
const Database                     = use('Database')

class CompletionByContentLibraryController {
  constructor() {
    this.startdate = null;
    this.enddate   = null;
    this.orderby   = 'DESC';
    this.status    = 'total_sum_incomplete';
    this.orderbyjourneyname = "ASC";
    this.directorateid = null;
    this.orderByStatus = "DESCINCOMPLETE";
    this.master_data_helper = new MasterDataHelper();
    this.subdirectorate     = null;
  }

  index = async ({ view, auth, response, request,session,params }) => {
    await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
    await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
    // await Database.connection('db_reader').raw("CREATE OR REPLACE VIEW enrolled_users AS "+
    //       "SELECT u.id AS user_id, u.firstname, u.lastname, u.username, u.email, u.deleted, u.suspended, cm.id AS cohort_members_id, "+
    //       "cm.cohortid AS cohortid, dj.name AS journey_name, dj.id AS journey_id, dj.visible AS journey_visible, ch.visible AS cohort_visible, djce.id AS enrol_id, "+
    //       "djce.created_at AS enrol_date "+
    //       "FROM `user` u "+
    //       "INNER JOIN cohort_members cm ON cm.userid=u.id AND u.deleted_at IS NULL " +
    //       "INNER JOIN cohort ch ON ch.id = cm.cohortid AND ch.deleted_at IS NULL "+
    //       "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=ch.id AND djce.deleted_at IS NULL "+ 
    //       "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL "+
    //       "WHERE dj.visible=1 AND u.deleted=0 AND u.suspended=0 "+
    //       "AND u.deleted_at IS NULL "+
    //       "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') ")
        
    //   await Database.connection('db_reader').raw("CREATE OR REPLACE VIEW journeys_courses_modules AS " +
    //     "SELECT dj.id AS journey_id, dj.name AS journey_name, dj.visible AS journey_visible, dc.id AS course_id " +
    //     ", dc.name AS course_name ,dc.visible AS course_visible , dcm.id AS daa_course_modules_id, "+
    //     "c.id AS module_id , c.fullname AS module_name, c.module_type AS module_type,  c.visible AS module_visible "+
    //     "FROM daa_journeys dj "+
    //     "INNER JOIN daa_courses dc ON dc.journey_id = dj.id  AND dc.deleted_at IS NULL "+
    //     "INNER JOIN daa_course_modules dcm ON dcm.course_id= dc.id  AND dcm.deleted_at IS NULL "+
    //     "INNER JOIN course c ON c.id= dcm.module_id AND c.deleted_at IS NULL "+
    //     "WHERE dj.`deleted_at`IS NULL ");
    this.startdate          = request.input('startdate') ? request.input('startdate') : '2020-12-01';
    this.enddate            = request.input('enddate') ? request.input('enddate') : '2020-12-30';
    this.orderby            = request.input('orderby') ? request.input('orderby') : 'DESC';
    this.status             = request.input('status') ? request.input('status') : 'total_sum_incomplete';

    this.directorateid      = request.input('directorateid');


    const masterDirectorate = await this.master_data_helper.getDataMasterDirectorate();

    const authUser = auth.user.toJSON()
    if (authUser.suspended == 1) {
        session.flash({ error: 'Your Account is Suspended' });
        //return response.route('logout')
    }
    return view.render('dashboard.completion.dashbord_chart_by_content_library',{
      authUser : authUser,
      startdate :this.startdate ,
      enddate : this.enddate,
      orderby : this.orderby,
      directorateid : this.directorateid,
      masterDirectorate : masterDirectorate.rows,

    })



}
getDataChart = async ({ view, auth, response, request,session,params }) => {

  this.startdate    = request.input('startdate') ? request.input('startdate') : '2020-12-01';
  this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
  this.orderby = request.input('orderby') ? request.input('orderby') : 'DESC';
  this.directorateid      = request.input('directorateid');




    let result = await this.getDataChartRaw();

    return result[0];

}

getDataChartRaw = () => {

    let sql            = "SELECT "+
                         "dcl.id "+
                         ", dcl.name AS category "+
                         ", COUNT(xx.user_id) AS total_user_completed "+
                         "FROM `daa_content_library` dcl "+
                         "LEFT JOIN (	"+
                          "SELECT "+
                          "u.id AS user_id "+
                          ", dcl.id AS contentLibrary_id "+
                          ", IF(COUNT(DISTINCT(moduleCompleteContentLib.module_id))=totModuleInContentLibrary.jmlModule, 1, 0) completeContentLibrary "+
                          "FROM `user` u "+
                          "JOIN cohort_members cm ON cm.userid=u.id "+
                          "JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid "+
                          "LEFT JOIN ( "+
                            "SELECT completedModule.user_id, completedModule.module_id "+
                            "FROM ( "+
                              "SELECT dml.user_id, dml.module_id "+
                              "FROM daa_module_logs dml "+
                              "INNER JOIN `user` u ON u.id = dml.user_id " +
                              "INNER JOIN course c ON c.id = dml.module_id "+
                              "WHERE u.deleted=0 AND u.suspended=0 AND c.visible=1 AND is_completed=1 "+
                              "AND u.id IN( "+

                                // "SELECT u.id AS userid " +
                                // "FROM `user` u "+
                                // "JOIN cohort_members cm ON cm.userid=u.id "+
                                // "JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid "+
                                // "JOIN daa_journeys dj ON dj.id=djce.journey_id "+
                                // "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
                                // "WHERE dj.visible=1 "+
                                // "AND u.deleted=0 "+
                                // "AND u.suspended=0 "+
                                // "AND u.id<>2 "+
                                // "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') ";


                                "SELECT eu.user_id AS userid " +
                                "FROM enrolled_users eu "+
                                "INNER JOIN user_info_data uid1 ON uid1.userid = eu.user_id AND uid1.fieldid=11 "+
                                "WHERE eu.journey_visible=1 "+
                                "AND eu.deleted=0 "+
                                "AND eu.suspended=0 "+
                                "AND eu.user_id<>2 "+
                                "AND CONCAT(eu.firstname,' ', eu.lastname) NOT IN ('Jane Doe', 'John Doe') ";
                                if(this.directorateid != null && this.directorateid != ''){
                                    sql = sql + " AND uid1.data='"+this.directorateid+"' ";
                                }
                                sql = sql +" AND DATE(eu.enrol_date) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' "+
                                "GROUP BY eu.user_id "+
                              ") "+
                              "GROUP BY dml.user_id, dml.module_id ASC "+
                            ") AS completedModule "+
                            "WHERE NOT EXISTS( "+
                              "SELECT * "+
                              "FROM ( "+
                                // "SELECT u.id AS user_id, c.id AS module_id "+
                                // "FROM daa_journey_cohort_enrols djce "+
                                // "INNER JOIN cohort_members cm ON cm.cohortid = djce.cohort_id "+
                                // "INNER JOIN `user` u ON u.id = cm.userid "+
                                // "INNER JOIN daa_journeys dj ON dj.id = djce.journey_id "+
                                // "INNER JOIN daa_courses dc ON dc.journey_id = dj.id  "+
                                // "INNER JOIN daa_course_modules dcm ON dcm.course_id = dc.id "+
                                // "INNER JOIN course c ON c.id = dcm.module_id "+
                                // "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
                                // "WHERE u.deleted=0 AND u.suspended=0 AND dj.visible=1 AND dc.visible=1 AND c.visible=1 ";
                                "SELECT eu.user_id, jcm.module_id "+
                                "FROM enrolled_users eu "+
                                "INNER JOIN user_info_data uid1 ON uid1.userid = eu.user_id AND uid1.fieldid=11 "+
                                "INNER JOIN journeys_courses_modules jcm ON jcm.journey_id = eu.journey_id "+
                                "WHERE eu.deleted=0 AND eu.suspended=0 AND jcm.journey_visible=1 AND jcm.course_visible=1 AND jcm.module_visible=1 ";
                                if(this.directorateid != null && this.directorateid != ''){
                                  sql = sql + " AND uid1.data='"+this.directorateid+"' ";
                                }
                                // sql = sql +" AND DATE(djce.created_at) BETWEEN  '"+this.startdate+"' AND '"+this.enddate+"' "+
                                // "GROUP BY u.id, c.id "+
                                // "ORDER BY u.id, c.id ASC "+
                                sql = sql +" AND DATE(eu.enrol_date) BETWEEN  '"+this.startdate+"' AND '"+this.enddate+"' "+
                        
                                "GROUP BY eu.user_id, jcm.module_id "+
                                "ORDER BY eu.user_id, jcm.module_id "+
                              ") AS enrolledModule "+
                              "WHERE enrolledModule.user_id=completedModule.user_id "+
                              "AND enrolledModule.module_id=completedModule.module_id	"+
                            ") "+
                          ") AS moduleCompleteContentLib ON moduleCompleteContentLib.user_id=u.id "+
                          "INNER JOIN `daa_content_library_module` dclm ON dclm.module_id=moduleCompleteContentLib.module_id "+
                          "INNER JOIN `daa_content_library` dcl ON dcl.id=dclm.content_library_id "+
                          "INNER JOIN ( "+

                            "SELECT dcl.id contentLibrary_id, COUNT(DISTINCT(dclm.module_id)) jmlModule "+
                            "FROM daa_content_library dcl "+
                            "INNER JOIN daa_content_library_module dclm ON dclm.content_library_id=dcl.id "+
                            "WHERE dcl.visible = 1 "+
                            "GROUP BY dcl.id "+
                          ") AS totModuleInContentLibrary ON totModuleInContentLibrary.contentLibrary_id=dcl.id "+
                          "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
                          "WHERE u.deleted = 0 "+
                          "AND u.suspended = 0 "+
                          "AND u.id<>2 "+
                          "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') ";
                          if(this.directorateid != null && this.directorateid != ''){
                            sql = sql + " AND uid1.data='"+this.directorateid+"' ";
                          }
                          sql = sql + " AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' "+
                          "GROUP BY user_id, dcl.id "+
                          "HAVING completeContentLibrary=1 "+
                        ") xx ON xx.contentLibrary_id = dcl.id "+
                        "WHERE dcl.visible = 1 "+
                        "GROUP BY dcl.id 	"+
                        "ORDER BY total_user_completed "  + this.orderby;

                        console.log(sql);

    const result       =  Database.connection('db_reader').raw(sql);

    return result;
  }
}

module.exports = CompletionByContentLibraryController
