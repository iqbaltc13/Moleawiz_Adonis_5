'use strict'

const Route                             = use('Route')
const CourseBridgeLearningEffort        = use('App/Models/CourseBridgeLearningEffort')
const CourseCategory                    = use('App/Models/CourseCategory')
const CourseCompletionAggrMethd         = use('App/Models/CourseCompletionAggrMethd')
const CourseCompletionCriteria          = use('App/Models/CourseCompletionCriterion')
const CourseFormatOption                = use('App/Models/CourseFormatOption')
const CourseModule                      = use('App/Models/CourseModule')
const CourseModuleCompletion            = use('App/Models/CourseModuleCompletion')
const CourseSection                     = use('App/Models/CourseSection')
const DaaJourney                        = use('App/Models/DaaJourney')
const DaaRestrict                       = use('App/Models/DaaRestrict')
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
const DaaReward                         = use('App/Models/DaaReward')
const DaaRewardHistory                  = use('App/Models/DaaRewardHistory')
const Database                          = use('Database')

const TextHelper                        = use('App/Controllers/Http/Helper/TextController')



class JourneyController {

  constructor() {


    this.text_helper = new TextHelper();

  }
  index = async ({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()
    DaaJourney.useConnection = "db_reader"
    const datas    = await DaaJourney.query()
                     .with('course')
                     .with('cohort_enrols')
                     .with('previous_restrict')
                     .with('previous_restrict.previous_program')
                     .with('previous_restrict.next_program')
                     .whereNull('deleted_at')

                     .orderBy('sort')
                     .fetch();
    for (let i = 0; i < datas.rows.length; i++) {
      datas.rows[i].name_cut = await this.text_helper.getWrappedBySpaceCharacter( datas.rows[i].name.substring(0,249), 3)
    }

    return view.render('dashboard.journey.index',{ authUser : authUser,  datas : datas})
  }

  datatable = async ({auth,request, response, view, params, session})=>{
    let datas =  await DaaJourney.query()
                .with('course', 'cohort_enrols')
                .whereNull('deleted_at')
                .orderBy('sort')
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
    const data     = await DaaJourney.find(id);
    return view.render('dashboard.journey.edit',{authUser : authUser,data:data});
  }
  detail = (id) =>{


    const data     = DaaJourney.query().with('course', 'cohort_enrols').where('id',id).first();

    return data;
  }
  update = async ({auth,request, response, view, params, session})=>{
    const rules             = {
      name: 'required',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }
    let id         = params.id;
    const data     = await DaaJourney.find(id);
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
        session.withErrors([{ notification: 'Upload file thumbnail Error !' , field:'thumbnail_pic', message: profilePic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
      data.thumbnail        = image;
    }
    data.name             = request.input('name');
    data.description      = request.input('description');
    data.sort             = request.input('sort');
    data.visible          = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;

    data.save();
    session.flash({ notification: 'Success update Program '+data.name+'!' });
    return response.route('dashboard.journey.index')
  }
  create = async ({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()
    return view.render('dashboard.journey.create',{authUser : authUser});
  }
  store = async ({auth,request, response, view, params, session})=>{

    const rules             = {
      name: 'required',

    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }

    const data = new DaaJourney();
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
        session.withErrors([{ notification: 'Upload file thumbnail Error !' , field:'thumbnail_pic', message: profilePic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
    }
    data.name      = request.input('name');
    data.description      = request.input('description');
    data.thumbnail = image;
    data.visible   = request.input('visible');
    await data.save();
    session.flash({ notification: 'Success create Program ' +data.name+ '!' });
    return response.route('dashboard.journey.index')
  }

  switchVisible = async ({request, response, view, params, session})=>{
    const id        = params.id;
    const data      = await DaaJourney.find(id);

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide '+data.name +' !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show '+data.name +' !' });
    }

    await data.save();


    return response.route('dashboard.journey.index')
   }

  delete = async ({auth,request, response, view, params, session})=>{
    session.flash({ notification: '!' });
    return response.route('index')
  }
  softDelete = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaJourney.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete '+data.name+'!' });
    return response.route('dashboard.journey.index')

  }

  softDeleteRestrict = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaRestrict .find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete restrict' + '!' });
    return response.route('dashboard.journey.index')

  }

  moveUp = async ({request, response, view, params, session})=>{

    const id                = params.id;
    const data              = await DaaJourney.find(id);

    if(data){
      let temp              = data.sort;

      let getUppers         = await DaaJourney.query().where('sort','<',data.sort).orderBy('sort','desc').fetch();

      if(getUppers.rows.length > 0){
        data.sort                    = getUppers.rows[0].sort;
        getUppers.rows[0].sort       = temp;
        await getUppers.rows[0].save();
        await data.save();

        session.flash({ successMessage: 'Successfully moveUp '+data.name+'!' });
      }
      session.flash({ failMessage: 'MoveUp '+data.name+' Failed'+'!' });
    }

    return response.route('dashboard.journey.index')

  }
  changeSettingForm = async ({ request, response, view, params, session, auth })=> {
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await DaaJourney.find(id);
    return view.render('dashboard.journey.settings',{authUser : authUser,data:data});
  }
  changeSetting = async ({request, response, view, params, session})=>{
    const id              = params.id;
    const data            = await DaaJourney.find(id);

    if(data){
      data.is_leaderboard = request.input('is_leaderboard');
      data.is_reward      = request.input('is_reward');
      data.is_simulator   = request.input('is_simulator');
      data.end_date       = request.input('end_date');

      await data.save();
    }
    return data;
  }

  moveDown = async ({request, response, view, params, session})=>{

    const id                = params.id;
    const data              = await DaaJourney.find(id);

    if(data){
      let temp              = data.sort;

      let getLowers         = await DaaJourney.query().where('sort','>',data.sort).orderBy('sort','asc').fetch();

      if(getLowers.rows.length > 0){
        data.sort                         = getLowers.rows[0].sort;
        getLowers.rows[0].sort       = temp;
        await getLowers.rows[0].save();
        await data.save();

        session.flash({ successMessage: 'Successfully movedown '+data.name+'!' });
      }
      session.flash({ failMessage: 'Movedown '+data.name+' Failed'+'!' });
    }

    return response.route('dashboard.journey.index')

  }

  restrictSettingsForm = async ({auth, request, response, view, params, session })=> {
    let id             = params.id;
    const authUser     = auth.user.toJSON();
    let sqlListJourney = "SELECT dj.* from daa_journeys dj "+
		                     "WHERE dj.visible=1 and dj.id!= "+id+" and dj.id not in (select dr.resid from daa_restrict dr where dr.acttype=1 and deleted_at is NOT  NULL and dr.actid="+id+")";
    let listJourney = await Database.connection('db_reader').raw(sqlListJourney);
    for (let i = 0; i <  listJourney[0].length; i++) {
      listJourney[0][i].name_cut = await this.text_helper.getWrappedBySpaceCharacter(  listJourney[0][i].name.substring(0,249), 3)
      listJourney[0][i].description_cut = await this.text_helper.getWrappedBySpaceCharacter(  listJourney[0][i].description.substring(0,249), 5)
    }
    let journey = await DaaJourney.find(id);
    return view.render('dashboard.journey.restrict_settings',{ authUser : authUser,  datas : listJourney[0], journeyId : id, journey : journey})
  }
  restrictSettings = async ({ request, response, view, params, session })=> {

    let journeyRestrictId = request.input('journeys_id') ? request.input('journeys_id') : [];

    let id = params.id;
    let journey = await DaaJourney.find(id);
    console.log(journeyRestrictId);
    for (let i = 0; i < journeyRestrictId.length; i++) {
      let daaRestrict = new DaaRestrict();
      daaRestrict.acttype = 1;
      daaRestrict.actid = id;
      daaRestrict.resid = journeyRestrictId[i];

      await daaRestrict.save();


      //console.log(daaRestrict);
    }

    session.flash({ notification: 'Successfully set restrict for '+journey.name +' Program' +'!' });
    return response.route('dashboard.journey.index')
  }


}

module.exports = JourneyController
