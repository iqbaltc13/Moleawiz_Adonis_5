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

class CompletionByDirectorateController {
    constructor() {
        this.startdate = null;
        this.enddate   = null;
        this.orderby   = 'DESC';
        this.status    = 'total_sum_incomplete';
        this.orderbydirectorate = "ASC";
    }

    index = async ({ view, auth, response, request,session,params }) => {

    //   await Database.connection('db_reader').raw("CREATE OR REPLACE VIEW enrolled_users AS "+
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

        this.startdate    = request.input('startdate') ? request.input('startdate') : '2020-12-01';
        this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
        this.orderby = request.input('orderby') ? request.input('orderby') : 'DESC';
        this.status  = request.input('status') ? request.input('status') : 'total_sum_incomplete';
        let orderByStatus = request.input('orderbystatus');

        const authUser = auth.user.toJSON()
        if (authUser.suspended == 1) {
            session.flash({ error: 'Your Account is Suspended' });
            //return response.route('logout')
        }
        return view.render('dashboard.completion.dashbord_chart_by_directorate',{ authUser : authUser, orderByStatus : orderByStatus, startdate :this.startdate , enddate : this.enddate, orderby : this.orderby, status : this.status })



    }
    getDataChart = async ({ view, auth, response, request,session,params }) => {
      let orderByStatus = request.input('orderbystatus');
      this.startdate    = request.input('startdate') ? request.input('startdate') : '2020-12-01';
      this.enddate = request.input('enddate') ? request.input('enddate') : '2020-12-30';
      this.orderby = request.input('orderby') ? request.input('orderby') : 'DESC';
      this.status  = request.input('status') ? request.input('status') : 'total_sum_incomplete';
        if ("DESCCOMPLETE" == orderByStatus) {
            this.orderby = 'DESC';
            this.status = 'total_sum_complete';
            this.orderbydirectorate = 'ASC';

        }

		    else if ("ASCINCOMPLETE" == orderByStatus) {
            this.orderby = 'ASC';
            this.status = 'total_sum_incomplete';
            this.orderbydirectorate = 'DESC';
        }

        else if ("ASCCOMPLETE" == orderByStatus) {
            this.orderby = 'ASC';
            this.status = 'total_sum_complete';
            this.orderbydirectorate = 'DESC';
        }
        let result = await this.getDataChartRaw();

        return result[0];

    }

    getDataChartRaw = () => {



      const sql          = "SELECT uid1.data AS directorate "+
						", COUNT(main.totEnrolledJourney) AS total_sum_enroled "+
						", SUM(IF(main.totEnrolledJourney=main.totJourneyComplete, 1, 0)) AS total_sum_complete "+
						", (COUNT(main.totEnrolledJourney) - sum(IF(main.totEnrolledJourney=main.totJourneyComplete, 1, 0))) AS total_sum_incomplete "+
                        "FROM `user` u "+
                        "LEFT JOIN ( "+
                            "SELECT  u.id AS user_id "+
                                    ", journeyEnrolled.totEnrolledJourney "+
                                    ", journeyCompleted.totJourneyComplete "+
                                    ", (journeyEnrolled.totEnrolledJourney-journeyCompleted.totJourneyComplete) AS total_incompleted "+
                            "FROM `user` u "+
                            "INNER JOIN ( "+

                                // "SELECT u.id AS userid, COUNT(dj.id) AS totEnrolledJourney "+
                                // "FROM `user` u "+
                                // "JOIN cohort_members cm ON cm.userid=u.id "+
                                // "JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid  "+
                                // "JOIN daa_journeys dj ON dj.id=djce.journey_id "+
                                // "WHERE dj.visible=1 "+
                                // "AND u.deleted=0 "+
                                // "AND u.suspended=0 "+
                                // "AND u.id<>2 "+
                                // "AND CONCAT(u.firstname,' ', u.lastname) NOT IN ('Jane Doe', 'John Doe') "+

                                // "AND DATE(djce.created_at) BETWEEN '"+this.startdate+"' AND '"+this.enddate+"' "+
                                // "GROUP BY u.id "+
                                "SELECT user_id AS userid, COUNT(journey_id) AS totEnrolledJourney "+  
                                "FROM enrolled_users "+
                                "WHERE DATE(enrol_date) BETWEEN '" + this.startdate + "' AND '" + this.enddate + "' " +
                                "GROUP BY user_id "+
                            ") AS journeyEnrolled ON journeyEnrolled.userid=u.id "+
						    "LEFT JOIN( "+

                                        "SELECT xx.user_id, COUNT(xx.journey_id) AS totJourneyComplete "+
                                        "FROM ( "+
                                            // "SELECT u.id AS user_id "+
                                            //         ", dj.id AS journey_id "+
                                            //         ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInJourney.jmlModule, 1, 0) completeJourney "+
                                            "SELECT u.id AS user_id "+
                                            ",  jcm.journey_id "+
                                            ", IF(COUNT(DISTINCT(dml.module_id))=totModuleInJourney.jmlModule, 1, 0) completeJourney "+
                                            "FROM `user` u "+
                                            "LEFT JOIN daa_module_logs dml ON dml.user_id=u.id "+
                                            // "INNER JOIN `daa_course_modules` dcm ON dcm.module_id=dml.module_id "+
                                            // "INNER JOIN course c ON c.id=dcm.module_id "+
                                            // "INNER JOIN `daa_courses` dc ON dc.id=dcm.course_id "+
                                            // "INNER JOIN `daa_journeys` dj ON dj.id=dc.journey_id "+
                                            // "INNER JOIN cohort_members cm ON cm.userid=u.id "+
                                            // "INNER JOIN daa_journey_cohort_enrols djce ON djce.cohort_id=cm.cohortid AND djce.journey_id=dj.id "+
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
                                    ") AS journeyCompleted ON journeyCompleted.user_id=u.id	"+
                                ") AS main on main.user_id=u.id "+
                            "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 AND uid1.data<>'-' AND uid1.data<>'' "+
                            "WHERE u.deleted = 0 "+
                            "AND u.suspended = 0 "+

                            "GROUP BY uid1.data "+
                            "ORDER BY "+ this.status +" "+this.orderby+" , total_sum_enroled "+this.orderby+ " , directorate "+  this.orderbydirectorate;
      const result       =  Database.connection('db_reader').raw(sql);

      return result;
    }

}

module.exports = CompletionByDirectorateController
