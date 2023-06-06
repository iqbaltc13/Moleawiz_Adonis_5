'use strict'

const Route                             = use('Route')
const DaaReward                         = use('App/Models/DaaReward')
const DaaRewardHistory                  = use('App/Models/DaaRewardHistory')
const CourseBridgeLearningEffort        = use('App/Models/CourseBridgeLearningEffort')
const CourseCategory                    = use('App/Models/CourseCategory')
const CourseCompletionAggrMethd         = use('App/Models/CourseCompletionAggrMethd')
const CourseCompletionCriteria          = use('App/Models/CourseCompletionCriterion')
const CourseFormatOption                = use('App/Models/CourseFormatOption')
const CourseModule                      = use('App/Models/CourseModule')
const CourseModuleCompletion            = use('App/Models/CourseModuleCompletion')
const CourseSection                     = use('App/Models/CourseSection')
const DaaJourney                        = use('App/Models/DaaJourney')
const DaaCourse                         = use('App/Models/DaaCourse')
const DaaCourseLog                      = use('App/Models/DaaCourseLog')
const DaaCourseModule                   = use('App/Models/DaaCourseModule')
const ToolRecyclebinCourse              = use('App/Models/ToolRecyclebinCourse')
const Course                            = use('App/Models/Course')
const User                              = use('App/Models/User')
//const Multer                            = use('Multer')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const Database                          = use('Database')
const JourneyController                 = use('App/Controllers/Http/Dashboard/Journey/JourneyController')



class RewardHistoryController {

  constructor() {

    this.journey_controller = new JourneyController();

  }
  indexAll = async ({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()

    const datas        = await DaaRewardHistory.query()
                         .with('journey')
                         .with('user')
                         .with('reward')
                         .whereNull('deleted_at')
                         .orderBy('redeem_date','DESC')
                         .fetch();



    return view.render('dashboard.journey.reward_history.index_all',{ authUser : authUser,  datas : datas.rows})
  }
  index = async ({auth,request, response, view, params, session})=>{

    let id         = params.id;
    const authUser = auth.user.toJSON()

    const datas        = await DaaRewardHistory.query()
                         .with('journey')
                         .with('user')
                         .with('reward')
                         .whereNull('deleted_at')
                         .where('journey_id', id)
                         .orderBy('redeem_date','DESC')
                         .fetch();
    if(datas.rows.length > 0){
      console.log(datas.rows[0]);
    }

    const journey   =  await this.journey_controller.detail(id);

    return view.render('dashboard.journey.reward_history.index',{ authUser : authUser,  datas : datas,journey : journey})
  }

  datatable = async ({auth,request, response, view, params, session})=>{
    let id          = params.id;

    const datas        = await DaaRewardHistory.query()
                         .with('journey')
                         .with('user')
                         .with('reward')
                         .whereNull('deleted_at')
                         .where('journey_id', id)
                         .orderBy('redeem_date','DESC')
                         .fetch();


    var result = Object.keys(datas).map((key) => [Number(key), datas[key]]);
    let valueDatatable = {
      draw            : 0,
      recordsTotal    : result[0][1].length,
      recordsFiltered : 10,
      data            : result[0][1]
    };



    return valueDatatable;
  }
}

module.exports = RewardHistoryController
