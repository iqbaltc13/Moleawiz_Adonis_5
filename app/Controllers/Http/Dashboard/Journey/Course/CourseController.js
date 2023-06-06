'use strict'

const DaaCertificate                    = use('App/Models/DaaCertificate')
const DaaCertificate2                   = use('App/Models/DaaCertificate2')
const DaaCertificateUser                = use('App/Models/DaaCertificateUser')
const DaaCertificateUser2               = use('App/Models/DaaCertificateUser2')
const DaaCustomCertificateLog           = use('App/Models/DaaCustomCertificateLog')
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
const JourneyController                 = use('App/Controllers/Http/Dashboard/Journey/JourneyController')
const Database                          = use('Database')
const TextHelper                        = use('App/Controllers/Http/Helper/TextController')


class CourseController {

  constructor() {

    this.journey_controller = new JourneyController();
    this.text_helper = new TextHelper();

  }


  index = async ({auth,request, response, view, params, session})=>{

    let id         = params.id;
    const authUser = auth.user.toJSON()

    const datas        = await DaaCourse.query()
                         .with('journey')
                         .with('previous_restrict',(builder)=>{
                          builder.with('previous_course').with('next_course')
                         })
                         //.with('previous_restrict.previous_course')
                         //.with('previous_restrict.next_course')
                         .whereNull('deleted_at')
                         .where('journey_id', id)
                         .fetch();
    for (let i = 0; i < datas.rows.length; i++) {

      if(datas.rows[i].description){
        datas.rows[i].description_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[i].description.substring(0,249), 5)
      }
      datas.rows[i].name_cut = await this.text_helper.getWrappedBySpaceCharacter( datas.rows[i].name.substring(0,249), 3)
    }

    //console.log(datas.rows[0].modules[0]);
    const journey   =  await this.journey_controller.detail(id);

    return view.render('dashboard.journey.course.index_new',{ authUser : authUser,  datas : datas,journey : journey})
  }

  datatable = async ({auth,request, response, view, params, session})=>{
    let id          = params.id;

    const datas     = await DaaCourse.query()
                      .with('journey')
                         //.with('modules')
                      .with('previous_restrict',(builder)=>{
                        builder.with('previous_course').with('next_course')
                      })
                      .whereNull('deleted_at')
                      .where('journey_id', id)
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

  edit = async ({auth,request, response, view, params, session})=>{
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await DaaCourse.query()
                    .with('journey')
                    .whereNull('deleted_at')
                    .where('id', id)
                    .first();
    const modules  =  await Course.query().whereNull('deleted_at').fetch();
    return view.render('dashboard.journey.course.edit',{authUser : authUser,data: data, modules: modules.rows});
  }
  detail = async ({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()
    let id         = params.id;
    const data     = await DaaCourse.query()
                    .with('journey')
                    .with('previous_restrict',(builder)=>{
                      builder.with('previous_course').with('next_course')
                     })
                    .whereNull('deleted_at')
                    .where('id', id)
                    .first();

    return view.render('dashboard.journey.course.detail',{authUser : authUser,data: data});
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
    const data     = await DaaCourse.find(id);
    let image = "";
    if(request.file('thumbnail_pic')){
      const thumbnailPic = request.file('thumbnail_pic', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      image = new Date().getTime()+'.'+thumbnailPic.subtype
      await thumbnailPic.move(Helpers.publicPath('uploads/assets/images'),{
        name: image
      })
      if(!thumbnailPic.moved()){
        session.withErrors([{ notification: 'Upload file Thumbnail Image Error !' , field:'thumbnail_pic', message: thumbnailPic.error().message }]).flashAll() ;
        return response.redirect('back')
      }

      data.thumbnail   = image;
    }

    data.name          = request.input('name');
    data.description   = request.input('description');
    //data.sort          = parseInt(tempSort) + 1;



    data.visible       = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;

    data.save();
    session.flash({ notification: 'Success update Course '+data.name+'!' });
    return response.route('dashboard.journey.course.index',{id: data.journey_id})
  }
  create = async  ({auth,request, response, view, params, session})=>{

    const journey  =  await this.journey_controller.detail(params.daa_journey_id);
    const authUser = auth.user.toJSON()
    return view.render('dashboard.journey.course.create',{authUser : authUser, journey : journey});
  }
  store = async ({auth,request, response, view, params, session})=>{
    let daaJourneyId        = request.input('journey_id');
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

    const data = new DaaCourse();
    let image = "";
    if(request.file('thumbnail_pic')){
      const thumbnailPic = request.file('thumbnail_pic', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      image = new Date().getTime()+'.'+thumbnailPic.subtype
      await thumbnailPic.move(Helpers.publicPath('uploads/assets/images'),{
        name: image
      })
      if(!thumbnailPic.moved()){
        session.withErrors([{ notification: 'Upload file Thumbnail Image Error !' , field:'thumbnail_pic', message: thumbnailPic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
    }
    let tempSort       = await DaaCourse.query()
                        .where('journey_id', request.input('journey_id'))
                        .orderBy('sort', 'DESC').first();
    data.name          = request.input('name');
    data.description   = request.input('description');
    data.journey_id    = request.input('journey_id');
    data.sort          = tempSort ? parseInt(tempSort.sort) + 1 : 1;
    data.thumbnail     = image;
    data.visible       = request.input('visible');

    data.save();
    session.flash({ notification: 'Success create Course ' +data.name+ '!' });
    return response.route('dashboard.journey.course.index',{id: request.input('journey_id')})
  }
  switchVisible = async ({request, response, view, params, session})=>{
    const id        = params.id;
    const data      = await DaaCourse.query().with('journey').where('id',id).first();

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide '+data.name +' !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show '+data.name +' !' });
    }

    await data.save();


    return response.route('dashboard.journey.course.index',{id: data.journey_id})
   }

  delete = async ({auth,request, response, view, params, session}) => {
    session.flash({ notification: '!' });
    return response.route('index')
  }
  softDelete = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaCourse.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete Course '+data.name+'!' });
    return response.route('dashboard.journey.course.index',{id: data.journey_id})

  }

  softDeleteRestrict = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaRestrict.query()
                        .with('next_course',(builder)=>{
                          builder.with('journey');
                        })
                        //.with('next_course.journey')
                        .where('id',id).first();

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete restrict' + '!' });
    return response.redirect('back')
    //return response.route('dashboard.journey.course.index',{id: request.input('journey_id')})

  }

  moveUp = async ({request, response, view, params, session})=>{

    const id                = params.id;
    const data              = await DaaCourse.find(id);

    if(data){
      let temp              = data.sort;

      let getUppers         = await DaaCourse.query()
                            .where('journey_id',data.journey_id)
                            .where('sort', '<', data.sort).orderBy('sort', 'desc').fetch();

      if(getUppers.rows.length > 0){
        data.sort                    = getUppers.rows[0].sort;
        getUppers.rows[0].sort       = temp;
        await getUppers.rows[0].save();
        await data.save();

        session.flash({ successMessage: 'Successfully moveUp '+data.name+'!' });
      }
      session.flash({ failMessage: 'MoveUp '+data.name+' Failed'+'!' });
    }

    return response.route('dashboard.journey.course.index',{id: data.journey_id})

  }


  moveDown = async ({request, response, view, params, session})=>{

    const id                = params.id;
    const data              = await DaaCourse.find(id);

    if(data){
      let temp              = data.sort;

      let getLowers         = await DaaCourse.query()
                              .where('journey_id',data.journey_id)
                              .where('sort', '>', data.sort).orderBy('sort', 'asc').fetch();

      if(getLowers.rows.length > 0){
        data.sort                         = getLowers.rows[0].sort;
        getLowers.rows[0].sort       = temp;
        await getLowers.rows[0].save();
        await data.save();

        session.flash({ successMessage: 'Successfully movedown '+data.name+'!' });
      }
      session.flash({ failMessage: 'Movedown '+data.name+' Failed'+'!' });
    }

    return response.route('dashboard.journey.course.index',{id: data.journey_id})

  }

  restrictSettingsForm = async ({auth, request, response, view, params, session })=> {
    let id             = params.id;
    const authUser     = auth.user.toJSON();
    const data         = await DaaCourse.query().with('journey').where('id',id).first();
    let sqlListCourse = "SELECT dc.* from daa_courses dc "+
                        "WHERE dc.visible=1 and dc.id!= "+id+
                        " and dc.id not in (select dr.resid from daa_restrict dr where dr.acttype=2 and dr.actid=" +id+ ")"
    let listCourse = await Database.connection('db_reader').raw(sqlListCourse);
    for (let i = 0; i < listCourse[0].length; i++) {

      if(listCourse[0][i].description){
        listCourse[0][i].description_cut = await this.text_helper.getWrappedBySpaceCharacter(listCourse[0][i].description.substring(0,249), 5)
        listCourse[0][i].name_cut = await this.text_helper.getWrappedBySpaceCharacter(listCourse[0][i].name.substring(0,249), 3)
      }



    }
    return view.render('dashboard.journey.course.restrict_settings',{ authUser : authUser, data : data,  datas : listCourse[0], courseId : id})
  }
  restrictSettings = async ({ request, response, view, params, session })=> {

    let courseRestrictId = request.input('courses_id') ? request.input('courses_id') : [];

    let id = params.id;
    let course = await DaaCourse.find(id);
    console.log(courseRestrictId);
    for (let i = 0; i < courseRestrictId.length; i++) {
      let daaRestrict = new DaaRestrict();
      daaRestrict.acttype = 2;
      daaRestrict.actid = id;
      daaRestrict.resid = courseRestrictId[i];

      await daaRestrict.save();


      //console.log(daaRestrict);
    }

    session.flash({ notification: 'Successfully set restrict for '+course.name +' Program' +'!' });
    return response.route('dashboard.journey.course.index', {id: course.journey_id})
  }
}

module.exports = CourseController
