'use strict'

const Route                        = use('Route')
const User                         = use('App/Models/User')
const Course                       = use('App/Models/Course')
const Session                      = use('App/Models/Session')
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const UploadHelper                 = use('App/Controllers/Http/Helper/UploadFileController')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')
const Database                     = use('Database')
const DaaRatingModule              = use('App/Models/DaaRatingModule')

class RatingModuleController {
  async index({ auth, request, response, view, params, session }) {
    await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
    await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
    const authUser = auth.user.toJSON()
    let sql        = "SELECT drm.module_id, c.fullname, AVG(drm.rating_point) avgPoint, COUNT(drm.rating_point) countPoint"+
                     " FROM daa_rating_module drm "+
                     " JOIN course c ON c.id=drm.module_id "+
                     " WHERE drm.send_notif=1 GROUP BY drm.module_id ";

    const datas    = await Database.connection('db_reader').raw(sql);


    return view.render('dashboard.report.content_rating.index',{ authUser : authUser,  datas : datas[0]})
    //return datas[0];

  }
  async datatable({auth,request, response, view, params, session}){
    let datas    = await DaaRatingModule.query()
                     .select('id,module_id, avg(rating_point)')
                     //.whereHas('user')
                     .whereHas('module')
                     .where('send_notif',1)
                     .whereNull('deleted_at')
                     .groupBy('module_id')
                     .fetch();

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
  async indexDetail({auth,request, response, view, params, session}){
    let moduleId   = params.module_id
    let module     = await Course.find(moduleId);
    const authUser = auth.user.toJSON()
    let datas      = await DaaRatingModule.query()
                     .with('user','module')
                     .select('id', 'module_id','user_id', 'rating_point', 'feedback', 'updated_at')
                     .whereHas('user')
                     .whereHas('module')
                     .where('module_id',moduleId)
                     .where('send_notif',1)
                     .whereNull('deleted_at')
                     //.groupBy('module_id')
                     .fetch();

                     //console.log(datas.rows[0].getRelated('user'))


    return view.render('dashboard.report.content_rating.detail',{ authUser : authUser,  datas : datas.rows, module:module})
    //return datas;

  }
  async datatableDetail({auth,request, response, view, params, session}){
    let moduleId   = params.module_id
    let datas      = await DaaRatingModule.query()
                     .select('id', 'module_id', 'rating_point', 'feedback', 'updated_at')
                     .whereHas('user')
                     .whereHas('module')
                     .where('module_id',moduleId)
                     .where('send_notif',1)
                     .whereNull('deleted_at')
                     //.groupBy('module_id')
                     .fetch();

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

module.exports = RatingModuleController
