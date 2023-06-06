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
const DaaNotification                   = use('App/Models/DaaNotification')
const DaaJourneyReward                  = use('App/Models/DaaJourneyReward')

class RewardJourneyController {

  constructor() {

    this.journey_controller = new JourneyController();

  }
  index = async ({auth,request, response, view, params, session})=>{

    let id         = params.id;
    const authUser = auth.user.toJSON()
    const datas    = await DaaJourneyReward.query()
                     .with('journey')
                     .with('reward')
                     .where('journey_id', id)
                     .whereNull('deleted_at')
                     .fetch();
  const journey   =  await this.journey_controller.detail(id);

  return view.render('dashboard.journey.reward.index',{ authUser : authUser,  datas : datas , journey : journey})


  }

  datatable = async ({auth,request, response, view, params, session})=>{
    let datas = await DaaJourneyReward.query()
                .with('journey')
                .with('reward')
                .where('journey_id', id)
                .whereNull('deleted_at')
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
  edit = async ({auth,request, response, view, params, session})=>{
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const datasReward    = await DaaReward.query()
                          .with('reward_history')
                          .with('reward_history.user')
                          .with('reward_history.journey')
                          .whereNull('deleted_at')
                          .fetch();
    const data     = await DaaJourneyReward.query()
                    .with('journey')
                     .with('reward')
                    .where('id',id).first();
    return view.render('dashboard.journey.reward.edit',{authUser : authUser,data:data , datas_reward: datasReward});
  }
  detail = async (id)=>{


    const data     = await  DaaJourneyReward.query()
                      .with('journey')
                      .with('reward')
                      .where('id',id).first();

    return data;
  }
  update = async ({auth,request, response, view, params, session})=>{

    let id         = params.id;
    let data     = await  DaaJourneyReward.query().where('id',id).first();

    data.journey_id       = request.input('journey_id');
    data.reward_id        = request.input('reward_id');
    data.point            = request.input('point');
    data.expired_date     = request.input('expired_date');
    data.qty              = request.input('qty');



    await data.save();
    session.flash({ notification: 'Success update Program Reward '+'!' });
    return response.route('dashboard.journey.reward.index',{id: data.journey_id })
  }
  create = async ({auth,request, response, view, params, session})=>{
    let id         = params.daa_journey_id;

    const datasReward    = await DaaReward.query()
                          .with('reward_history')
                          .with('reward_history.user')
                          .with('reward_history.journey')
                          .whereNull('deleted_at')
                          .fetch();
    const journey  =  await this.journey_controller.detail(id);
    const authUser = auth.user.toJSON()
    return view.render('dashboard.journey.reward.create',{authUser : authUser , journey : journey, datas_reward: datasReward});
  }
  store = async ({auth,request, response, view, params, session})=>{

    const data = new  DaaJourneyReward();

    data.journey_id       = request.input('journey_id');
    data.reward_id        = request.input('reward_id');
    data.point            = request.input('point');
    data.expired_date     = request.input('expired_date');
    data.qty              = request.input('qty');
    await data.save();
    session.flash({ notification: 'Success create Program Reward ' + '!' });
    return response.route('dashboard.journey.reward.index',{id: data.journey_id })
  }

  delete = async  ({auth,request, response, view, params, session})=>{
    session.flash({ notification: '!' });
    return response.route('index')
  }
  softDelete = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await  DaaJourneyReward.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete Program Reward'+'!' });
    return response.route('dashboard.journey.reward.index',{id: data.journey_id })

  }
}

module.exports = RewardJourneyController
