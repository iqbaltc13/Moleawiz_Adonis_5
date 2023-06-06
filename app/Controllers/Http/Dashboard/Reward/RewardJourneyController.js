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

class RewardJourneyController {

  async index({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    const datas    = await DaaReward.query()
                     .with('reward_history')
                     .with('reward_history.user')
                     .with('reward_history.journey')
                     .whereNull('deleted_at')
                     .fetch();



    return view.render('dashboard.reward.index',{ authUser : authUser,  datas : datas.rows})


  }

  async datatable({auth,request, response, view, params, session}){
    let datas = await DaaReward.query()
                .with('reward_history')
                .with('reward_history.user')
                .with('reward_history.journey')
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
  async edit({auth,request, response, view, params, session}){
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await   DaaReward.query()
                    .with('reward_history')
                    .with('reward_history.user')
                    .with('reward_history.journey')
                    .where('id',id).first();
    return view.render('dashboard.reward.edit',{authUser : authUser,data:data});
  }
  async detail(id){


    const data     = await  DaaReward.query()
                      .with('reward_history')
                      .with('reward_history.user')
                      .with('reward_history.journey')
                      .where('id',id).first();

    return data;
  }
  async update({auth,request, response, view, params, session}){
    const rules             = {
      title: 'required',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }
    let id         = params.id;
    const data     = await  DaaReward.find(id);
    let image = "";
    if(request.file('thumbnail_pic')){
      const profilePic = request.file('thumbnail_pic', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      image = new Date().getTime()+'.'+profilePic.subtype
      await profilePic.move(Helpers.publicPath('uploads/assets/images'),{
        name: image
      })
      if(!profilePic.moved()){
        session.withErrors([{ notification: 'Upload file image Error !' , field:'thumbnail_pic', message: profilePic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
      data.image        = image;
    }
    data.title             = request.input('title');
    data.description      = request.input('description');

    data.visible          = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;

    await data.save();
    session.flash({ notification: 'Success update Reward '+data.title+'!' });
    return response.route('dashboard.reward.index')
  }
  async create({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    return view.render('dashboard.reward.create',{authUser : authUser});
  }
  async store({auth,request, response, view, params, session}){

    const rules             = {
      title: 'required',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }

    const data = new  DaaReward();
    let image = "";
    if(request.file('thumbnail_pic')){
      const profilePic = request.file('thumbnail_pic', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      image = new Date().getTime()+'.'+profilePic.subtype
      await profilePic.move(Helpers.publicPath('uploads/assets/images'),{
        name: image
      })
      if(!profilePic.moved()){
        session.withErrors([{ notification: 'Upload file image Error !' , field:'thumbnail_pic', message: profilePic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
    }
    data.title      = request.input('title');
    data.description      = request.input('description');
    data.image = image;
    data.visible   = request.input('visible');
    await data.save();
    session.flash({ notification: 'Success create Reward ' +data.title+ '!' });
    return response.route('dashboard.reward.index')
  }

  async delete({auth,request, response, view, params, session}){
    session.flash({ notification: '!' });
    return response.route('index')
  }
  async softDelete({auth,request, response, view, params, session}){
    const id          = params.id;
    const data        = await  DaaReward.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete '+data.title+'!' });
    return response.route('dashboard.reward.index')

  }
}

module.exports = RewardJourneyController
