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

class CompletionByLearningProgramController {
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

  index = async({ view, auth, response, request,session,params }) => {
     await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
     await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
    //  await Database.connection('db_reader').raw("CREATE OR REPLACE VIEW enrolled_users AS "+
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
    this.orderbyjourneyname = request.input('orderbyjourneyname') ? request.input('orderbyjourneyname') : "ASC";
    this.directorateid      = request.input('directorateid');
    this.subdirectorateid   = request.input('subdirectorateid');
    this.orderByStatus      = request.input('orderbystatus') ? request.input('orderbystatus') : 'DESCINCOMPLETE' ;
    let directorateid       = this.directorateid;
    const masterDirectorate    = await this.master_data_helper.getDataMasterDirectorate();
    const masterSubDirectorate = await this.master_data_helper.getDataMasterDivision(directorateid);



    const authUser = auth.user.toJSON()
    if (authUser.suspended == 1) {
        session.flash({ error: 'Your Account is Suspended' });
        //return response.route('logout')
    }
    return view.render('dashboard.completion.dashbord_chart_by_learning_program',{
      authUser : authUser,
      orderByStatus : this.orderByStatus,
      startdate :this.startdate ,
      enddate : this.enddate,
      orderby : this.orderby,
      status : this.status,
      orderbyjourneyname : this.orderbyjourneyname,
      directorateid : this.directorateid,
      subdirectorateid : this.subdirectorateid,
      masterDirectorate : masterDirectorate.rows,
      masterDivision : masterSubDirectorate[0]
    })



}
getDataChart = async ({ view, auth, response, request,session,params }) => {
  let orderByStatus = request.input('orderbystatus');
  this.startdate    = request.input('startdate') ? request.input('startdate') : '2020-12-01';
  this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
  this.orderby = request.input('orderby') ? request.input('orderby') : 'DESC';
  this.status  = request.input('status') ? request.input('status') : 'total_incompleted';
  this.orderbyjourneyname = request.input('orderbyjourneyname') ? request.input('orderbyjourneyname') : "ASC";
  this.directorateid      = request.input('directorateid');
  this.subdirectorateid   = request.input('subdirectorateid');


    if ("DESCCOMPLETE" == orderByStatus) {
        this.orderby = 'DESC';
        this.status = 'total_completed_user';
        this.orderbyjourneyname = 'ASC';

    }

    else if ("ASCINCOMPLETE" == orderByStatus) {
        this.orderby = 'ASC';
        this.status = 'total_incompleted';
        this.orderbyjourneyname = 'DESC';
    }

    else if ("ASCCOMPLETE" == orderByStatus) {
        this.orderby = 'ASC';
        this.status = 'total_completed_user';
        this.orderbyjourneyname = 'DESC';
    }
    let result = await this.getDataChartRaw();

    return result[0];

}

getDataChartRaw = () => {



  let sql = "SELECT dj.id AS journey_id " +
            ", dj.name AS journey_name " +
            ", journeyEnrolled.totUserEnrolledJourney AS total_enrolled_user " +
            ", IF(journeyCompleted.totUserCompleteJourney IS NULL, 0, journeyCompleted.totUserCompleteJourney)  AS total_completed_user " +
            ", (journeyEnrolled.totUserEnrolledJourney-(IF(journeyCompleted.totUserCompleteJourney IS NULL, 0, journeyCompleted.totUserCompleteJourney))) AS total_incompleted " +
            "FROM `daa_journeys` dj  " +
            "LEFT JOIN( " +

                        // "SELECT dj.id AS journey_id, dj.name AS journey_name, COUNT(DISTINCT(u.id)) AS totUserEnrolledJourney "+
                        // "FROM `user` u "+
                        // "JOIN cohort_members cm ON cm.userid=u.id "+
                        // "JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid "+
                        // "JOIN daa_journeys dj ON dj.id=djce.journey_id "+
                        "SELECT eu.journey_id, eu.journey_name, COUNT(eu.user_id)  AS totUserEnrolledJourney  " +
                        "FROM enrolled_users eu " +
                        "INNER JOIN user_info_data uid1 ON uid1.userid = eu.user_id AND uid1.fieldid=11 " +
                        "INNER JOIN user_info_data uid2 ON uid2.userid = eu.user_id AND uid2.fieldid=2 " +
                        // "WHERE dj.visible=1 "+
                        // "AND u.deleted=0 "+
                        // "AND u.suspended=0 "+
                        // "AND u.id<>2 "+
                        // "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+
                        "WHERE eu.journey_visible=1 " +
                        "AND eu.deleted=0 " +
                        "AND eu.suspended=0 " +
                        "AND eu.user_id<>2 " +
                        "AND CONCAT(eu.firstname,' ', eu.lastname) NOT IN ('Jane Doe', 'John Doe') " +

                        //"AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+ this.enddate+"' ";
                        "AND DATE(eu.enrol_date) BETWEEN '" + this.startdate + "' AND '" + this.enddate + "' ";
                        if(this.directorateid != null){
                          sql = sql + " AND uid1.data='"+this.directorateid+"' ";
                        }
                        if(this.subdirectorateid != null && this.subdirectorateid != 0 && this.subdirectorateid != ''){
                          sql = sql + " AND uid2.data='"+this.subdirectorateid +"' ";
                        }

                        //sql = sql +"GROUP BY dj.id "+
                        
                        sql = sql + "GROUP BY journey_id "+
                    ") AS journeyEnrolled ON journeyEnrolled.journey_id=dj.id "+
                    "LEFT JOIN( "+
                        "SELECT xx.journey_id, COUNT(DISTINCT(xx.user_id)) AS totUserCompleteJourney "+
                        "FROM ( "+
                          "SELECT u.id AS user_id "+
                            //", dj.id AS journey_id "+
                            ", jcm.journey_id "+
                            ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInJourney.jmlModule, 1, 0) completeJourney "+
                          "FROM `user` u "+
                          "LEFT JOIN daa_module_logs dml ON dml.user_id=u.id "+
                          // "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id "+
                          // "INNER JOIN course c ON c.id=dcm.module_id "+
                          // "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id "+
                          // "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id "+
                          "INNER JOIN journeys_courses_modules jcm ON jcm.module_id = dml.module_id "+
                          "INNER JOIN cohort_members cm ON cm.userid=u.id "+
                          //"INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=dj.id "+
                          "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=jcm.journey_id AND djce.deleted_at IS NULL  "+
                          "INNER JOIN ( " +

                          //   "SELECT dj.id journey_id, COUNT(DISTINCT(c.id)) jmlModule "+
                          //   "FROM daa_journeys dj "+
                          //   "INNER JOIN daa_courses dc ON dc.journey_id=dj.id "+
                          //   "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id "+
                          //   "INNER JOIN course c ON c.id=dcm.module_id "+
                          //   "WHERE c.visible = 1 "+
                          //   "AND c.`module_type`=1 "+
                          //   "AND dj.visible = 1 "+
                          //   "AND dc.visible = 1 "+
                          //   "GROUP BY dj.id "+
                          // ") AS totModuleInJourney ON totModuleInJourney.journey_id=dj.id "+
                            "SELECT jcm.journey_id,  COUNT(DISTINCT(module_id)) jmlModule "+
                            "FROM journeys_courses_modules jcm " +
                            "WHERE jcm.module_visible = 1 "+
                            "AND jcm.module_type =1 "+
                            "AND jcm.journey_visible = 1 "+
                            "AND jcm.course_visible = 1 "+
                            "GROUP BY jcm.journey_id "+  
                          ") AS totModuleInJourney ON totModuleInJourney.journey_id=jcm.journey_id " +
                          "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
                          "INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 "+
                          "WHERE u.deleted = 0 "+
                          "AND u.suspended = 0 "+

                          "AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+ this.enddate+"' "+
                          // "AND dj.visible = 1 " +
                          // "AND dc.visible = 1 " +
                          // "AND c.visible = 1 " +
                          "AND jcm.journey_visible = 1 " +
                          "AND jcm.course_visible = 1 " +
                          "AND jcm.module_visible = 1 " +
                          "AND u.deleted_at IS NULL "+
                          // "AND c.`module_type`=1 "+
                          
                          "AND jcm.module_type=1 ";
                          
                          if(this.directorateid != null && this.directorateid != 0 && this.directorateid != ''){
                            sql = sql + "AND uid1.data='"+this.directorateid+"' ";
                          }
                          if(this.subdirectorateid != null && this.subdirectorateid != 0 && this.subdirectorateid != ''){
                            sql = sql + " AND uid2.data='"+this.subdirectorateid+"' ";
                          }

                          //sql = sql + "GROUP BY user_id, dj.id " +
                          sql = sql + "GROUP BY user_id, jcm.journey_id "+  
                          "HAVING completeJourney=1 "+
                        ") xx "+
                        "GROUP BY xx.journey_id "+
                    ") AS journeyCompleted ON journeyCompleted.journey_id=dj.id "+
                    "JOIN daa_journey_cohort_enrols djce on djce.journey_id=dj.id "+
                    "JOIN cohort ch ON ch.id = djce.cohort_id "+
                    "JOIN cohort_members cm ON cm.cohortid = ch.id "+
                    "JOIN `user` u ON u.id=cm.userid "+
                    "WHERE u.deleted = 0 "+
                    "AND u.suspended = 0 "+
                    "AND dj.visible=1 "+

                    "AND ch.visible = 1 "+
                    "GROUP BY dj.id "+
                    "ORDER BY "+ this.status +" "+this.orderby+" , total_enrolled_user "+this.orderby+ " , directorate "+  this.orderbyjourneyname;
    const result       =  Database.connection('db_reader').raw(sql);

    return result;
  }
}

module.exports = CompletionByLearningProgramController
