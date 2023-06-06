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
const Database                     = use('Database')
const Config                       = use('App/Models/Config')

class DashboardController {
    constructor() {
        this.startdate = null;
        this.enddate   = null;
    }
    async index({ view, auth, response, request,session,params }) {

      await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
      await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
      // await Database.connection('db_reader').raw("CREATE OR REPLACE VIEW enrolled_users AS "+
      //     "SELECT u.id AS user_id, u.firstname, u.lastname, u.username, u.email, u.deleted, u.suspended, cm.id AS cohort_members_id, "+
      //     "cm.cohortid AS cohortid, dj.name AS journey_name, dj.id AS journey_id, dj.visible AS journey_visible, ch.visible AS cohort_visible, djce.id AS enrol_id, "+
      //     "djce.created_at AS enrol_date "+
      //     "FROM `user` u "+
      //     "INNER JOIN cohort_members cm ON cm.userid=u.id AND u.deleted_at IS NULL " +
      //     "INNER JOIN cohort ch ON ch.id = cm.cohortid AND ch.deleted_at IS NULL "+
      //     "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=ch.id AND djce.deleted_at IS NULL "+ 
      //     "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id AND dj.deleted_at IS NULL "+
      //     "WHERE dj.visible=1 AND u.deleted=0 AND u.suspended=0 "+
      //     "AND u.deleted_at IS NULL "+
      //     "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') ")
        
      // await Database.connection('db_reader').raw("CREATE OR REPLACE VIEW journeys_courses_modules AS " +
      //   "SELECT dj.id AS journey_id, dj.name AS journey_name, dj.visible AS journey_visible, dc.id AS course_id " +
      //   ", dc.name AS course_name ,dc.visible AS course_visible , dcm.id AS daa_course_modules_id, "+
      //   "c.id AS module_id , c.fullname AS module_name, c.module_type AS module_type,  c.visible AS module_visible "+
      //   "FROM daa_journeys dj "+
      //   "INNER JOIN daa_courses dc ON dc.journey_id = dj.id  AND dc.deleted_at IS NULL "+
      //   "INNER JOIN daa_course_modules dcm ON dcm.course_id= dc.id  AND dcm.deleted_at IS NULL "+
      //   "INNER JOIN course c ON c.id= dcm.module_id AND c.deleted_at IS NULL "+
      //   "WHERE dj.`deleted_at`IS NULL ");
        this.startdate = request.input('startdate') ? request.input('startdate') : '2020-12-01';
        this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';

        const goAdmin                              =  await this.goAdminRaw();

        //console.log(getEnrolledUsers[0],getActiveUsers[0],getCompletionByContentLibraryTop5[0],getCompletionsByDirectorateTop5[0],getCompletionsByLearningProgramTop5[0],getHighestUsersByPoinXtra[0],getHighestUsersByPoinXtraAll[0]);

        const authUser = auth.user.toJSON()
        if (authUser.suspended == 1) {
            session.flash({ error: 'Your Account is Suspended' });
            //return response.route('logout')
        }
        let dataCheckAdmin       =  await Config.query().where('name','siteadmins').first();
        let arrIdAdmin =  dataCheckAdmin.value.split(',');



        if(arrIdAdmin.includes(auth.user.id.toString())){
          return view.render('dashboard.dashboard',{ authUser : authUser, goAdmin : goAdmin, startdate :this.startdate , enddate : this.enddate })
        }
        else{
          return view.render('dashboard.dashboard_non_admin',{ authUser : authUser, goAdmin : goAdmin, startdate :this.startdate , enddate : this.enddate })
        }


    }

    async home({ view, auth, request, session }) {

      const goAdmin =  await this.goAdminRaw();
      const authUser = auth.user.toJSON();

      if (authUser.suspended == 1) {
        session.flash({ error: 'Your Account is Suspended' });
        //return response.route('logout')
      }
      let dataCheckAdmin       =  await Config.query().where('name','siteadmins').first();

      return view.render('dashboard.home',{ authUser : authUser, goAdmin : goAdmin })

    }

    async getEnrolledUserAjax ({ view, auth, response, request,session,params }){
      this.startdate = request.input('startdate') ? request.input('startdate') : '2020-12-01';
      this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
      console.log("--GET ENROLLED USER QUERY--");
      let result = await this.getEnrolledUserRaw()
      console.log("----");
      return result[0];
    }

    async getActiveUsersAjax ({ view, auth, response, request,session,params }){
      this.startdate = request.input('startdate') ? request.input('startdate') : '2020-12-01';
      this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
      console.log("--GET ACTIVE USER QUERY--");
      let result = await this.getActiveUsersRaw()
      console.log("----");
      return result[0];
    }

    async getCompletionsByDirectorateTop5Ajax ({ view, auth, response, request,session,params }){
      this.startdate = request.input('startdate') ? request.input('startdate') : '2020-12-01';
      this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
      console.log("--GET COMPLETION BY DIRECTORATE QUERY--");
      let result = await this.getCompletionsByDirectorateTop5Raw()
      console.log("----");
      return result[0];
    }

    async getCompletionsByLearningProgramTop5Ajax ({ view, auth, response, request,session,params }){
      this.startdate = request.input('startdate') ? request.input('startdate') : '2020-12-01';
      this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
      console.log("--GET COMPLETION BY LEARNING PROGRAM QUERY--");
      let result = await this.getCompletionsByLearningProgramTop5Raw()
      console.log("----");
      return result[0];

    }

    async getCompletionByContentLibraryTop5Ajax ({ view, auth, response, request,session,params }){
      this.startdate = request.input('startdate') ? request.input('startdate') : '2020-12-01';
      this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
      params = {
        arr_user_id_enrolled : request.input('arr_user_id_enrolled')
      };
      console.log("--GET COMPLETION BY CONTENT LIBRARY QUERY--");
      let result = await this.getCompletionByContentLibraryTop5Raw(params);
      console.log("----");
      return result[0];
    }

    async getHighestUsersByPoinXtraAjax ({ view, auth, response, request,session,params }){
      this.startdate = request.input('startdate') ? request.input('startdate') : '2020-12-01';
      this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
      console.log("--GET HIGHEST USERS BY POINT XTRA QUERY--");
      let result = await this.getHighestUsersByPoinXtraRaw()
      console.log("----");
      return result[0];
    }

    async getHighestUsersByPoinXtraAllAjax ({ view, auth, response, request,session,params }){
      this.startdate = request.input('startdate') ? request.input('startdate') : '2020-12-01';
      this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
      console.log("--GET HIGHEST USERS BY POINT XTRA QUERY--");
      let result = await this.getHighestUsersByPoinXtraAllRaw()
      console.log("----");
      return result[0];
    }

    async goAccessUserNewAjax ({ view, auth, response, request,session,params }){
      this.startdate = request.input('startdate') ? request.input('startdate') : '2020-12-01';
      this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
      console.log("--GET ACCESS USER NEW QUERY--");
      let result = await this.goAccessUserNewRaw();
      console.log("----");
      return result[0];
    }

    getEnrolledUser() {
        let exceptionalName = ['Jane Doe', 'John Doe'];
        const enrolledUser =  User.query()
        .with('cohort_member')
        .whereHas('cohort_member', (query) => {
            query.whereHas('cohort', (query4) => {
              query4.whereHas('cohort_enrols', (query2) => {
                query2.whereHas('journey', (query3) => {
                    query3.where('visible',1)
                })
              }).whereBetween('created_at', [this.startdate, this.enddate])
            })

        })
        .select('id')
        //.distinct('id')
        .where('deleted', 0)
        .where('suspended', 0)
        .whereNotIn('firstname',exceptionalName)
        .whereNotIn('lastname', exceptionalName)
        .countDistinct('id')

        return enrolledUser;
    }

    getEnrolledUserRaw(){
      const sql             = "SELECT *  "+
                              "FROM enrolled_users "+
                              "WHERE DATE(enrol_date) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"'";
      // const sql          = "SELECT u.id as user_id, u.firstname,  u.lastname, u.username, u.email, cm.id as cohort_members_id,  cm.cohortid as cohortid,  dj.name as journey_name, dj.id as journey_id , djce.id as enrol_id, djce.created_at as enrol_date "+
                              // "FROM `user` u "+
                              // "INNER JOIN cohort_members cm ON cm.userid=u.id "+
                              // "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid "+
                              // "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id "+
                              // "WHERE dj.visible=1 AND u.deleted=0 AND u.suspended=0 "+
                              // "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+
                              // "AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"'";
      console.log(sql);
      const enrolledUser =  Database.connection('db_reader').raw(sql);

      return enrolledUser;
    }

    getActiveUsersRaw(){


      let sql = "SELECT COUNT(DISTINCT(u.id)) AS active_user "+
                  "FROM `user` u "+
                  "INNER JOIN ( " +
                    "SELECT DISTINCT(user_id) AS userid   "+
                    "FROM enrolled_users "+
                    // "SELECT DISTINCT(u.id) AS userid "+
                    // "FROM `user` u "+
                    // "INNER JOIN cohort_members cm ON cm.userid=u.id "+
                    // "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid "+
                    // "INNER JOIN daa_journeys dj ON dj.id=djce.journey_id "+
                    // "WHERE dj.visible=1 " +
                    // "AND u.deleted=0 "+
                    // "AND u.suspended=0 "+
                    // "AND u.id<>2 "+
                    // "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+
                    " )AS enrolledUser ON enrolledUser.userid=u.id " +
                  "INNER JOIN user_info_data uid1 ON uid1.userid=enrolledUser.userid "+
                  "AND uid1.fieldid=11 "+
                  "INNER JOIN user_info_data uid2 ON uid2.userid=enrolledUser.userid "+
                  "AND uid2.fieldid=2 "+
                  "LEFT JOIN daa_module_logs dml ON dml.user_id = enrolledUser.userid AND dml.deleted_at IS NULL "+
                  "WHERE dml.user_id IS NOT NULL AND u.deleted_at IS NULL AND dml.last_open>='"+this.startdate+"' AND dml.last_open<='"+this.enddate+"'";


      console.log(sql);
      let result = Database.connection('db_reader').raw(sql);
      return result;
    }

    getCompletionsByDirectorateTop5Raw(){

      const sql  = "SELECT uid1.data AS directorate "+
              ", COUNT(main.totEnrolledJourney) AS total_sum_enroled "+
              ", SUM(IF(main.totEnrolledJourney=main.totJourneyComplete, 1, 0)) AS total_sum_complete "+
              ", (COUNT(main.totEnrolledJourney) - sum(IF(main.totEnrolledJourney=main.totJourneyComplete, 1, 0))) AS total_sum_incomplete "+
             "FROM `user` u "+
             "LEFT JOIN "+
             "( "+
             "SELECT  u.id AS user_id "+
                  ", journeyEnrolled.totEnrolledJourney "+
                  ", journeyCompleted.totJourneyComplete "+
                  " , (journeyEnrolled.totEnrolledJourney-journeyCompleted.totJourneyComplete) AS total_incompleted "+
              "FROM `user` u "+
              "INNER JOIN ( "+

                "SELECT user_id AS userid, COUNT(journey_id) AS totEnrolledJourney "+  
                "FROM enrolled_users "+
                "WHERE DATE(enrol_date) BETWEEN '" + this.startdate + "' AND '" + this.enddate + "' " +
                "GROUP BY user_id "+
                // "SELECT u.id AS userid, COUNT(dj.id) AS totEnrolledJourney "+
                // "FROM `user` u "+
                // "JOIN cohort_members cm ON cm.userid=u.id "+
                // "JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid "+
                // "JOIN daa_journeys dj ON dj.id=djce.journey_id "+
                // "WHERE dj.visible=1 "+
                // "AND u.deleted=0 "+
                // "AND u.suspended=0 "+
                // "AND u.id<>2 "+
                // "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+
                // "AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' "+
                // "GROUP BY u.id "+
              ") AS journeyEnrolled ON journeyEnrolled.userid=u.id "+
              "LEFT JOIN( "+

                "SELECT xx.user_id, COUNT(xx.journey_id) AS totJourneyComplete "+
                "FROM ( "+
                  // "SELECT u.id AS user_id "+
                  //     ", dj.id AS journey_id "+
                  //     ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInJourney.jmlModule, 1, 0) completeJourney "+
                  "SELECT u.id AS user_id "+
                      ",  jcm.journey_id "+
                      ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInJourney.jmlModule, 1, 0) completeJourney "+
                  "FROM `user` u "+
                  "LEFT JOIN daa_module_logs dml ON dml.user_id=u.id "+
                  // "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id AND dcm.deleted_at IS NULL "+
                  // "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL "+
                  // "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL "+
                  // "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
                  // "INNER JOIN cohort_members cm ON cm.userid=u.id  AND cm.deleted_at IS NULL "+
                  // "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=dj.id AND djce.deleted_at IS NULL "+
                 
                  "INNER JOIN journeys_courses_modules jcm ON jcm.module_id = dml.module_id  "+
                  "INNER JOIN cohort_members cm ON cm.userid=u.id  AND cm.deleted_at IS NULL "+
                  "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=jcm.journey_id AND djce.deleted_at IS NULL "+
                  "INNER JOIN ( "+

                    // "SELECT dj.id journey_id, COUNT(DISTINCT(c.id)) jmlModule "+
                    // "FROM daa_journeys dj "+
                    // "INNER JOIN daa_courses dc ON dc.journey_id=dj.id AND dc.deleted_at IS NULL "+
                    // "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id AND dcm.deleted_at IS NULL "+
                    // "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL "+
                    // "WHERE c.visible = 1 "+
                    // "AND c.`module_type`=1 "+
                    // "AND dj.visible = 1 AND dj.deleted_at IS NULL "+
                    // "AND dc.visible = 1 "+
                    // "GROUP BY dj.id "+
                    "SELECT jcm.journey_id,  COUNT(DISTINCT(module_id)) jmlModule "+
                    "FROM journeys_courses_modules jcm " +
                    "WHERE jcm.module_visible = 1 "+
                    "AND jcm.module_type =1 "+
                    "AND jcm.journey_visible = 1 "+
                    "AND jcm.course_visible = 1 "+
                    "GROUP BY jcm.journey_id "+
                  //") AS totModuleInJourney ON totModuleInJourney.journey_id=dj.id "+
                  ") AS totModuleInJourney ON totModuleInJourney.journey_id=jcm.journey_id "+
                  "WHERE u.deleted = 0 "+
                  "AND u.suspended = 0 "+

                  "AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' "+
                  // "AND dj.visible = 1 "+
                  // "AND dc.visible = 1 "+
                  // "AND c.visible = 1 "+
                  // "AND c.`module_type`=1 "+
                  // "GROUP BY user_id, dj.id " +
        
                  "AND jcm.module_visible = 1 "+
                  "AND jcm.module_type =1 "+
                  "AND jcm.journey_visible = 1 "+
                  "AND jcm.course_visible = 1 "+
                  "GROUP BY user_id ,jcm.journey_id "+
                  "HAVING completeJourney=1 "+
                ") xx "+
                "GROUP BY xx.user_id "+
              ") AS journeyCompleted ON journeyCompleted.user_id=u.id "+
            ") AS main on main.user_id=u.id "+
            "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 AND uid1.data<>'-' AND uid1.data<>'' "+
            "WHERE u.deleted = 0 "+
            "AND u.suspended = 0 AND u.deleted_at IS NULL "+

            "GROUP BY uid1.data "+
            "ORDER BY total_sum_incomplete DESC, total_sum_enroled DESC, directorate ASC "+
            "LIMIT 5";
      console.log(sql);
      let result = Database.connection('db_reader').raw(sql);
      return result;
    }

     getCompletionsByLearningProgramTop5Raw(){

      const sql  = "SELECT dj.id AS journey_id "+
               ", dj.name AS journey_name "+
               ", journeyEnrolled.totUserEnrolledJourney AS total_user_enrolled "+
               ", IF(journeyCompleted.totUserCompleteJourney IS NULL, 0, journeyCompleted.totUserCompleteJourney)  AS total_user_completed "+
               ", (journeyEnrolled.totUserEnrolledJourney-(IF(journeyCompleted.totUserCompleteJourney IS NULL, 0, journeyCompleted.totUserCompleteJourney))) AS total_user_incomplete "+
            "FROM `daa_journeys` dj "+
            "LEFT JOIN( "+
                "SELECT journey_id, journey_name, COUNT(user_id)  AS totUserEnrolledJourney  " +
                "FROM enrolled_users "+
                // "SELECT dj.id AS journey_id, dj.name AS journey_name, COUNT(u.id) AS totUserEnrolledJourney "+
                // "FROM `user` u "+
                // "JOIN cohort_members cm ON cm.userid=u.id "+
                // "JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid "+
                // "JOIN daa_journeys dj ON dj.id=djce.journey_id "+
                // "WHERE dj.visible=1 "+
                // "AND u.deleted=0 "+
                // "AND u.suspended=0 "+
                // "AND u.id<>2 "+
                // "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+
                
                "WHERE DATE(enrol_date) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' "+
                "GROUP BY journey_id "+
                ") AS journeyEnrolled ON journeyEnrolled.journey_id=dj.id "+
            "LEFT JOIN ( "+

                "SELECT xx.journey_id, COUNT(xx.user_id) AS totUserCompleteJourney "+
                "FROM ( "+
                  "SELECT u.id AS user_id "+
                    //", dj.id AS journey_id "+
                    ", jcm.journey_id "+
                    ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInJourney.jmlModule, 1, 0) completeJourney "+
                  "FROM `user` u "+
                  "LEFT JOIN daa_module_logs dml ON dml.user_id=u.id AND dml.deleted_at IS NULL " +
                  "INNER JOIN journeys_courses_modules jcm ON jcm.module_id = dml.module_id "+
                  // "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id AND dcm.deleted_at IS NULL "+
                  // "INNER JOIN course c ON c.id=dcm.module_id AND c.deleted_at IS NULL "+
                  // "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id AND dc.deleted_at IS NULL "+
                  // "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
                  "INNER JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL "+
                  "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=jcm.journey_id AND djce.deleted_at IS NULL  "+
                  "INNER JOIN ( "+

                    // "SELECT dj.id journey_id, COUNT(DISTINCT(c.id)) jmlModule "+
                    // "FROM daa_journeys dj "+
                    // "INNER JOIN daa_courses dc ON dc.journey_id=dj.id AND dc.deleted_at IS NULL "+
                    // "INNER JOIN daa_course_modules dcm ON dcm.course_id=dc.id AND dcm.deleted_at IS NULL "+
                    // "INNER JOIN course c ON c.id=dcm.module_id AND dc.deleted_at IS NULL "+
                    // "WHERE c.visible = 1 "+
                    // "AND c.`module_type`=1 "+
                    // "AND dj.visible = 1 "+
                    // "AND dc.visible = 1 "+
                    // "GROUP BY dj.id "+
                    "SELECT jcm.journey_id,  COUNT(DISTINCT(module_id)) jmlModule "+
                    "FROM journeys_courses_modules jcm " +
                    "WHERE jcm.module_visible = 1 "+
                    "AND jcm.module_type =1 "+
                    "AND jcm.journey_visible = 1 "+
                    "AND jcm.course_visible = 1 "+
                    "GROUP BY jcm.journey_id "+  
                  ") AS totModuleInJourney ON totModuleInJourney.journey_id=jcm.journey_id " +
                  "WHERE u.deleted = 0 "+
                  "AND u.suspended = 0 "+

                  "AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' "+
                  // "AND dj.visible = 1 " +
                  // "AND dc.visible = 1 " +
                  // "AND c.visible = 1 " +
                  "AND jcm.journey_visible = 1 " +
                  "AND jcm.course_visible = 1 " +
                  "AND jcm.module_visible = 1 " +
                  "AND u.deleted_at IS NULL "+
                  // "AND c.`module_type`=1 "+
                  // "GROUP BY user_id, dj.id "+
                  "AND module_type=1 "+
                  "GROUP BY user_id, jcm.journey_id "+
                  "HAVING completeJourney=1 "+
                ") xx "+
                "GROUP BY xx.journey_id "+
            ") AS journeyCompleted ON journeyCompleted.journey_id=dj.id "+
            "JOIN daa_journey_cohort_enrols djce on djce.journey_id=dj.id AND djce.deleted_at IS NULL "+
            "JOIN cohort ch ON ch.id = djce.cohort_id AND ch.deleted_at IS NULL "+
            "JOIN cohort_members cm ON cm.cohortid = ch.id AND cm.deleted_at IS NULL "+
            "JOIN `user` u ON u.id=cm.userid AND u.deleted_at IS NULL "+
            "WHERE u.deleted = 0 "+
            "AND u.suspended = 0 "+
            "AND dj.visible=1 " +
            "AND u.deleted_at IS NULL "+

            "AND ch.visible = 1 "+
            "GROUP BY dj.id "+
            "ORDER BY total_user_incomplete DESC, total_user_enrolled DESC, journey_name asc "+
            "LIMIT 5";
        console.log(sql);
        let result = Database.connection('db_reader').raw(sql);
        return result;
    }

   getHighestUsersByPoinXtraRaw(){
      const sql  = "SELECT u.id AS user_id, u.username, u.email, u.firstname, u.lastname, uid1.data AS directorate "+
               ", SUM(up.point) AS total_point "+
               ", u.daa_picture "+
            "FROM daa_user_point up "+
            "INNER JOIN `user` u ON u.id = up.user_id AND u.deleted_at IS NULL "+
            "INNER JOIN user_info_data uid1 ON uid1.userid = up.user_id "+
            "WHERE u.deleted=0 AND u.suspended=0 AND uid1.fieldid=11 "+

            "AND DATE(up.created_at) >= '"+this.startdate+"' "+
            "AND DATE(up.created_at) <= '"+this.enddate+"' "+
            "AND up.deleted=0 AND up.deleted_at IS NULL "+
            "GROUP BY u.id "+
            "ORDER BY total_point DESC LIMIT 15";
        console.log(sql);
        let result = Database.connection('db_reader').raw(sql);
        return result;
    }

    getCompletionByContentLibraryTop5Raw(params){

      const sql  = "SELECT dcl.id "+
              ", dcl.name AS category "+
              ", COUNT(xx.user_id) AS total_user_completed "+
            "FROM `daa_content_library` dcl "+
            "LEFT JOIN ( "+
            "SELECT u.id AS user_id "+
                  ", dcl.id AS contentLibrary_id "+
                  ", IF(COUNT(DISTINCT(moduleCompleteContentLib.module_id))=totModuleInContentLibrary.jmlModule, 1, 0) completeContentLibrary "+
              "FROM `user` u "+
              "JOIN cohort_members cm ON cm.userid=u.id AND cm.deleted_at IS NULL "+
              "JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.deleted_at IS NULL "+
              "LEFT JOIN ( "+
                "SELECT completedModule.user_id, completedModule.module_id "+
                "FROM ( "+
                  "SELECT dml.user_id, dml.module_id "+
                  "FROM daa_module_logs dml "+
                  "INNER JOIN `user` u ON u.id = dml.user_id AND u.deleted_at IS NULL " +
                  "INNER JOIN course c ON c.id = dml.module_id AND c.deleted_at IS NULL "+
                  "WHERE u.deleted=0 AND u.suspended=0 AND c.visible=1 AND is_completed=1 AND dml.deleted_at IS NULL "+
                  "AND u.id IN( "+
                    //from enrolled query
                    "SELECT user_id  "+
                    "FROM enrolled_users "+
                    "WHERE DATE(enrol_date) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' "+ 
                  ") "+
                  "GROUP BY dml.user_id, dml.module_id ASC "+
                ")AS completedModule "+
                "WHERE NOT EXISTS( "+
                  "SELECT * "+
                  "FROM ( "+
                    // "SELECT u.id AS user_id, c.id AS module_id "+
                    // "FROM daa_journey_cohort_enrols djce "+
                    // "INNER JOIN cohort_members cm ON cm.cohortid = djce.cohort_id AND cm.deleted_at IS NULL "+
                    // "INNER JOIN `user` u ON u.id = cm.userid AND u.deleted_at IS NULL "+
                    // "INNER JOIN daa_journeys dj ON dj.id = djce.journey_id AND dj.deleted_at IS NULL "+
                    // "INNER JOIN daa_courses dc ON dc.journey_id = dj.id AND dc.deleted_at IS NULL "+
                    // "INNER JOIN daa_course_modules dcm ON dcm.course_id = dc.id AND dcm.deleted_at IS NULL "+
                    // "INNER JOIN course c ON c.id = dcm.module_id AND c.deleted_at IS NULL "+
                    // "WHERE u.deleted=0 AND u.suspended=0 AND dj.visible=1 AND dc.visible=1 AND c.visible=1 "+

                    // "AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"'" +
                    // "GROUP BY u.id, c.id "+
                    // "ORDER BY u.id, c.id ASC "+
        
        
                    "SELECT eu.user_id, jcm.module_id "+
                    "FROM enrolled_users eu "+
                    
                    "INNER JOIN journeys_courses_modules jcm ON jcm.journey_id = eu.journey_id "+
                    "WHERE eu.deleted=0 AND eu.suspended=0 AND jcm.journey_visible=1 AND jcm.course_visible=1 AND jcm.module_visible=1 "+
                    "AND DATE(eu.enrol_date) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"'" +
                    "GROUP BY eu.user_id, jcm.module_id "+
                    "ORDER BY eu.user_id, jcm.module_id "+
                  ") AS enrolledModule "+
                  "WHERE enrolledModule.user_id=completedModule.user_id "+
                  "AND enrolledModule.module_id=completedModule.module_id "+
                ") "+
              ") moduleCompleteContentLib ON moduleCompleteContentLib.user_id=u.id "+
              "INNER JOIN `daa_content_library_module` dclm ON dclm.module_id=moduleCompleteContentLib.module_id AND dclm.deleted_at IS NULL "+
              "INNER JOIN `daa_content_library` dcl ON dcl.id=dclm.content_library_id AND dcl.deleted_at IS NULL "+
              "INNER JOIN ( "+

                "SELECT dcl.id contentLibrary_id, COUNT(DISTINCT(dclm.module_id)) jmlModule "+
                "FROM daa_content_library dcl "+
                "INNER JOIN daa_content_library_module dclm ON dclm.content_library_id=dcl.id AND dclm.deleted_at IS NULL "+
                "WHERE dcl.visible = 1 "+
                "GROUP BY dcl.id "+
              ") AS totModuleInContentLibrary ON totModuleInContentLibrary.contentLibrary_id=dcl.id "+
              "WHERE u.deleted = 0 "+
              "AND u.suspended = 0 "+
              "AND u.id<>2 "+
              "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+

              "AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' "+
              "GROUP BY user_id, dcl.id "+
              "HAVING completeContentLibrary=1 "+
            ") xx ON xx.contentLibrary_id = dcl.id "+
            "WHERE dcl.visible = 1 AND dcl.deleted_at IS NULL "+
            "GROUP BY dcl.id "+
            "ORDER BY total_user_completed DESC "+
            "LIMIT 5";
        console.log(sql);
        let result = Database.connection('db_reader').raw(sql);
        return result;
    }

    // for report excel
    getHighestUsersByPoinXtraAllRaw(){
      const sql  = "SELECT u.id AS user_id, u.username, u.email, u.firstname, u.lastname, uid1.data AS directorate "+
               ", SUM(up.point) AS total_point "+
               ", u.daa_picture "+
            "FROM daa_user_point up "+
            "INNER JOIN `user` u ON u.id = up.user_id AND u.deleted_at IS NULL "+
            "INNER JOIN user_info_data uid1 ON uid1.userid = up.user_id "+
            "WHERE u.deleted=0 AND u.suspended=0 AND uid1.fieldid=11 "+

            "AND DATE(up.created_at) >= '"+this.startdate+"' " +
            "AND DATE(up.created_at) <= '"+this.enddate+"' "+
            "AND up.deleted=0 AND dup.deleted_at IS NULL "+
            "GROUP BY u.id "+
            "ORDER BY total_point DESC";

        let result = Database.connection('db_reader').raw(sql);
        return result;
    }

    // user_access_logs
    goAccessUserNewRaw(){
      const sql  = "SELECT DATE_FORMAT(duad.access_date, '%d %b %y') AS access_date, duad.total_user "+
            "FROM `daa_user_access_daily` duad "+
            "WHERE duad.access_date BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' AND duad.deleted_at IS NULL "+
            "ORDER BY duad.access_date ASC";
      console.log(sql);
      let result = Database.connection('db_reader').raw(sql);
      return result;
    }

    goAdminRaw(){

      const sql  = "SELECT * "+
                   "FROM config "+
                   "WHERE `name` = 'siteadmins'";

      let result = Database.connection('db_reader').raw(sql);
      return result;
    }
}

module.exports = DashboardController
