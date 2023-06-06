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
const DaaModuleCategory                 = use('App/Models/DaaModuleCategory')

class ModuleCategoryController {
  index = async ({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()
    const datas    = await DaaModuleCategory.query()
                     .with('module')
                     .whereNull('deleted_at')
                     .fetch();


    return view.render('dashboard.module_category.index',{ authUser : authUser,  datas : datas.rows})


  }

  datatable = async ({auth,request, response, view, params, session})=>{
    let datas = await DaaModuleCategory.query()
                .with('module')
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
    const data     = await DaaModuleCategory.find(id);
    return view.render('dashboard.module_category.edit',{authUser : authUser,data:data});
  }
  update = async ({auth,request, response, view, params, session})=>{
    let id         = params.id;
    const data     = await DaaModuleCategory.find(id);
    data.name      = request.input('name');
    data.visible   = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;

    data.save();
    session.flash({ notification: 'Success update Module Category '+data.name+'!' });
    return response.route('dashboard.module-category.index')
  }
  create = async ({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()
    return view.render('dashboard.module_category.create',{authUser : authUser});
  }
  store = async ({auth,request, response, view, params, session})=>{

    const data = new DaaModuleCategory();

    data.name      = request.input('name');

    data.visible   = request.input('visible');
    data.save();
    session.flash({ notification: 'Success create Module Category ' +data.name+ '!' });
    return response.route('dashboard.module-category.index')
  }

  switchVisible = async ({request, response, view, params, session})=>{
    const id        = params.id;
    const data      = await DaaModuleCategory.find(id);

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide '+data.name +' !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show '+data.name +' !' });
    }

    await data.save();


    return response.route('dashboard.module-category.index')
  }

  delete = async ({auth,request, response, view, params, session})=>{
    session.flash({ notification: '!' });
    return response.route('index')
  }
  softDelete = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaModuleCategory.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete '+data.name+'!' });
    return response.route('dashboard.module-category.index')

  }


}

module.exports = ModuleCategoryController
