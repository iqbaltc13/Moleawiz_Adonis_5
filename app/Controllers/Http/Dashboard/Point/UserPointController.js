'use strict'

const User                              = use('App/Models/User')
const DaaUserPoint                      = use('App/Models/DaaUserPoint')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const TextHelper                        = use('App/Controllers/Http/Helper/TextController')
const Database                          = use('Database')


class UserPointController {

  constructor() {
    this.text_helper = new TextHelper();

  }

  async index({ auth, request, response, view, params, session }) {
    await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
    await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
    const authUser = auth.user.toJSON()
    let sql        = "SELECT dup.user_id , sum(dup.point) totPoint, u.* FROM " +
    "daa_user_point dup JOIN user u ON u.id = dup.user_id GROUP BY dup.user_id ORDER BY dup.point  DESC LIMIT 100  ";

    const datas    = await Database.connection('db_reader').raw(sql);



    return view.render('dashboard.point.user-point.index',{ authUser : authUser,  datas : datas[0]})


  }

  async datatable({auth,request, response, view, params, session}){
    let sql        = "SELECT dup.user_id , sum(dup.point) totPoint, u.* FROM " +
    "daa_user_point dup JOIN user u ON u.id = dup.user_id GROUP BY dup.user_id ORDER BY dup.point DESC ";

    const datas    = await Database.connection('db_reader').raw(sql);

    var result = Object.keys(datas).map((key) => [Number(key), datas[key]]);
    let valueDatatable = {
      draw            : 0,
      recordsTotal    : result[0][1].length,
      recordsFiltered : 10,
      data            : result[0][1]
    };


    // return JSON.stringify(valueDatatable);
    return valueDatatable;
  }

   async detail({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()

    let userId = params.user_id;
    let user   = await User.query().where('id',userId).first();
    let sql    = "SELECT dup.point AS my_point, c.fullname  AS my_fullname, 'MODULE' AS my_flag, dup.created_at  AS my_created_at, dup.point_attempt AS my_point_attempt "+
                 "FROM  daa_user_point dup "+
                 "JOIN course c ON c.id=dup.module_id "+
                 "WHERE dup.user_id= "+userId +
                 " UNION "+
                 "SELECT dbpc.point  AS my_point, db.name AS my_fullname, 'BADGE' AS my_flag,  dbpc.`claim_date` AS my_created_at, '-' AS my_point_attempt "+
                 "FROM `daa_badge_point_claim` dbpc "+
                 "JOIN `user` u ON u.id=dbpc.user_id "+
                 "JOIN  `daa_badges` db ON db.id=dbpc.badge_id "+
                 "WHERE dbpc.user_id= "+userId +
                 " UNION "+
                 "SELECT drh.point AS my_point, dr.title AS my_fullname, 'REWARD' AS my_flag, drh.redeem_status_date AS my_created_at, '-' AS my_point_attempt " +
                 "FROM daa_reward_history drh "+
                 "JOIN `user` u ON u.id=drh.user_id "+
                 "JOIN `daa_reward` dr ON dr.id=drh.reward_id "+
                 "WHERE drh.redeem_status=1 "+
                 "AND drh.user_id= "+userId+
                 " ORDER BY my_created_at DESC ";

     const datas = await Database.connection('db_reader').raw(sql);
     let detail = {};
     detail.total_point           =  datas[0]
                                    .filter(
                                      (item) =>
                                        item.my_flag == "MODULE"
                                    )
                                    .reduce((accumulator, item) => {
                                      return accumulator + item.my_point;
                                    }, 0);
     detail.badges_point         = datas[0]
                                    .filter(
                                      (item) =>
                                        item.my_flag == "BADGE"
                                    )
                                    .reduce((accumulator, item) => {
                                      return accumulator + item.my_point;
                                    }, 0);

     detail.approved_reward_point = datas[0]
                                      .filter(
                                        (item) =>
                                          item.my_flag == "REWARD"
                                      )
                                      .reduce((accumulator, item) => {
                                        return accumulator + item.my_point;
                                      }, 0);
     detail.actual_point = detail.total_point + detail.badges_point - detail.approved_reward_point;


    return view.render('dashboard.point.user-point.detail',{ authUser : authUser,  datas : datas[0], learner : user, detail : detail})


  }

  async datatableDetail({auth,request, response, view, params, session}){

    let sql    = "SELECT dup.point AS my_point, c.fullname  AS my_fullname, 'MODULE' AS my_flag, dup.created_at  AS my_created_at, dup.point_attempt AS my_point_attempt "+
                 "FROM  daa_user_point dup "+
                 "JOIN course c ON c.id=dup.module_id "+
                 "WHERE dup.user_id= "+userId +
                 " UNION "+
                 "SELECT dbpc.point  AS my_point, db.name AS my_fullname, 'BADGE' AS my_flag,  dbpc.`claim_date` AS my_created_at, '-' AS my_point_attempt "+
                 "FROM `daa_badge_point_claim` dbpc "+
                 "JOIN `user` u ON u.id=dbpc.user_id "+
                 "JOIN  `daa_badges` db ON db.id=dbpc.badge_id "+
                 "WHERE dbpc.user_id= "+userId +
                 " UNION "+
                 "SELECT drh.point AS my_point, dr.title AS my_fullname, 'REWARD' AS my_flag, drh.redeem_status_date AS my_created_at, '-' AS my_point_attempt " +
                 "FROM daa_reward_history drh "+
                 "JOIN `user` u ON u.id=drh.user_id "+
                 "JOIN `daa_reward` dr ON dr.id=drh.reward_id "+
                 "WHERE drh.redeem_status=1 "+
                 "AND drh.user_id= "+userId+
                 "ORDER BY my_created_at DESC ";

    const datas    = await Database.connection('db_reader').raw(sql);



    var result = Object.keys(datas).map((key) => [Number(key), datas[key]]);
    let valueDatatable = {
      draw            : 0,
      recordsTotal    : result[0][1].length,
      recordsFiltered : 10,
      data            : result[0][1]
    };


    // return JSON.stringify(valueDatatable);
    return valueDatatable;
  }
}

module.exports = UserPointController
