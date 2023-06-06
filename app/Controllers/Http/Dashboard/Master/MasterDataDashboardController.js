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
const Database                     = use('Database')
class MasterDataDashboardController {
  getContentLibraryData(){
    const datas = DaaContentLibrary.query()
                  .select('id','name')
                  .where('visible',1)
                  .orderBy('name')
                  .fetch();

    return datas;
  }
  getActiveUserTrueData(){
    const datas = User.query()
                  .select('id','firstname','lastname','username')
                  .where('id','>',2)
                  .where('deleted',0)
                  .where('suspended',0)
                  .orderBy('firstname')
                  .fetch();

    return datas;
  }
  getDataMasterDirectorate() {
    const datas = UserInfoDatum.query()
                  .with('user')
                  .select('id','data')
                  .where('fieldid', '=', 11)
                  .where('data','!=','-')
                  .groupBy('data')
                  .fetch();
    //console.log(datas);
    return datas;

  }
  getDataMasterDirectorateRaw(){
    const sql = "SELECT uid1.data AS directorate "+
                "FROM 'user_info_data' AS uid1 "+
                "JOIN user u ON u.id=uid1.`userid` AND uid1.`fieldid`=11 "+
                "WHERE u.deleted=0 AND u.suspended=0 AND uid1.data<>'-' "+
                "GROUP BY directorate "+
                "ORDER BY directorate ";

    const result       =  Database.connection('db_reader').raw(sql);

    return result;
  }
  getDataMasterLearner(){
    let users =  User.query()
    .select("id","firstname","lastname","username")
    .where('id','>',2)
    .where('deleted',0)
    .whereNull('deleted_at')
    .fetch()
    return users;
  }
  getDataMasterDivision(directorateid){
    // const datas = UserInfoDatum.query()
    //               .with('user')
    //               .select('id','data')
    //               .where('fieldid', '=', 2)
    //               .where('data','!=','-');
    // datas       = datas.groupBy('data')
    //               .fetch();
    const datas    = this.getDataMasterDivisionRaw(directorateid);
    return datas;

  }
  getDataMasterDivisionRaw(directorateid){

    let sql = "SELECT DISTINCT(uid2.data) AS subdirectorate " +
                "FROM user_info_data AS uid2 "+
                "JOIN user u ON u.id=uid2.`userid` AND uid2.`fieldid`=2 "+
                "JOIN user_info_data AS uid1 ON u.id=uid1.`userid` AND uid1.`fieldid`=11 "+
                "WHERE  u.deleted=0 AND u.suspended=0 AND  uid2.data<>'-' AND uid2.data<>'' ";
    if(directorateid != "0" && directorateid!=null && directorateid!='' ){
      sql = sql+" AND uid1.data='"+directorateid+"' ";
    }
    //sql =  sql+" GROUP BY subdirectorate ORDER BY subdirectorate  ";

    const result       =  Database.connection('db_reader').raw(sql);

    return result;

  }

  getDataMasterProgramRaw(directorateid, subdirectorateid){
    let sql = "SELECT DISTINCT(j.id) AS journey_id "+
              ", j.name AS journey_name "+
              "FROM daa_journey_cohort_enrols jce "+
              "JOIN daa_journeys j ON j.id = jce.journey_id "+
              "JOIN cohort ch ON ch.id = jce.cohort_id "+
              "JOIN cohort_members cm ON cm.cohortid = ch.id "+
              "JOIN `user` u ON u.id = cm.userid "+
              "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
              "INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 "+
              "WHERE u.deleted = 0 "+
              "AND u.suspended = 0 "+
              "AND j.visible = 1 "+
              "AND ch.visible = 1 ";
    if(directorateid != "0" && directorateid!='' && directorateid != null ){
      sql = sql+" AND uid1.data='"+directorateid+"' ";
    }
    if(subdirectorateid != "0" && subdirectorateid!='' && subdirectorateid != null ){
      sql = sql+" AND uid2.data='"+subdirectorateid+"' ";
    }
    sql =  sql+" ORDER BY j.name  ";

    const result       =  Database.connection('db_reader').raw(sql);

    return result;
  }

  getDataMasterCourseRaw(journeyid){
    let sql = "SELECT dc.id AS course_id, dc.name AS course_name "+
              "FROM daa_course_modules dcm "+
              "INNER JOIN course c ON c.id = dcm.module_id "+
              "INNER JOIN daa_courses dc ON dc.id = dcm.course_id "+
              "INNER JOIN daa_journeys dj ON dj.id=dc.journey_id "+
              "WHERE c.visible=1 "+
              "AND c.module_type=1 "+
              "AND dc.visible=1 ";
    if(journeyid != "0" && journeyid!='' && journeyid != null ){
      sql = sql+" AND dj.id='"+journeyid+"' ";
    }

    sql =  sql+" GROUP BY dc.id ORDER BY dc.name  ";

    const result       =  Database.connection('db_reader').raw(sql);

    return result;
  }
  getDataMasterCourseMultiJourneyRaw(arrJourneyId){

    let arrSqlJourneyId = arrJourneyId;


    let sql = "SELECT dc.id AS course_id, CONCAT(dc.name,' (',dj.name,')') AS course_name "+
              "FROM daa_courses dc "+
              "INNER JOIN daa_journeys dj ON dj.id=dc.journey_id AND dj.deleted_at IS NULL "+
              "WHERE  dc.visible=1 AND dc.deleted_at IS NULL ";
    if(arrSqlJourneyId != "" ){
      sql = sql+" AND dj.id IN  ("+arrSqlJourneyId+") ";
    }

    sql =  sql+" GROUP BY dc.id ORDER BY dj.name, dc.name  ";

    const result       =  Database.connection('db_reader').raw(sql);

    return result;
  }
  getDataMasterModuleMultiCourseRaw(arrCourseId,moduleType){
    let arrSqlCourseId = arrCourseId;;




    let sql =  "SELECT c.id AS module_id, CONCAT(c.fullname,' (',dc.name,')') AS module_name "+
               "FROM course c "+
               "INNER JOIN daa_course_modules dcm ON dcm.module_id = c.id AND dcm.deleted_at IS NULL "+
               "INNER JOIN daa_courses dc ON dc.id = dcm.course_id AND dc.deleted_at IS NULL "+

               "WHERE c.visible=1 AND c.deleted_at IS NULL ";
    if('0'!=moduleType && 0!=moduleType && moduleType != null && moduleType != ""){
      sql= sql +" AND c.module_type="+moduleType;
    }
    if(arrSqlCourseId!=""){
      sql = sql+ " AND dc.id IN ("+arrSqlCourseId+")";
    }
    sql =  sql+ " ORDER BY dc.id ";



    const result       =  Database.connection('db_reader').raw(sql);

    return result;

  }

  getDataMasterModuleRaw(courseid){


    let sql =  "SELECT CONCAT(dj.id, '_', dc.id, '_', c.id) AS module_id, CONCAT(c.fullname,' (',dc.name,')') AS module_name "+
               "FROM course c "+
               "INNER JOIN daa_course_modules dcm ON dcm.module_id = c.id "+
               "INNER JOIN daa_courses dc ON dc.id = dcm.course_id "+
               "INNER JOIN daa_journeys dj ON dj.id = dc.journey_id "+
               "WHERE c.visible=1 ";
    // if('0'!=moduleType && 0!=moduleType){
    //   $sql= sql +" AND c.module_type="+moduleType;
    // }
    sql = sql+ " AND dc.id = '"+courseid+"' ";;



    const result       =  Database.connection('db_reader').raw(sql);

    return result;

  }

}

module.exports = MasterDataDashboardController
