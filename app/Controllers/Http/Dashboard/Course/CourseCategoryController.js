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
const User                              = use('App/Models/User')
const Course                            = use('App/Models/Course')
//const Multer                            = use('Multer')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')

class CourseCategoryController {
  index = async ({ view,auth,request,response })=>{

        let detailId = request.input('detail_id');
        const authUser = auth.user.toJSON()

        let courseCategories = await CourseCategory.query()
        .with('courses')
        .select("id","name","sortorder","idnumber","parent","visible")

        .whereNull('deleted_at')
        .orderBy('sortorder','asc')
        .fetch()

        if(!detailId){
          detailId = courseCategories.rows[0].id;
        }

        let courseCategoryDetail = await CourseCategory.query().with('courses').where('id',detailId).first();

        return view.render('dashboard.course_category.index',{ authUser : authUser, courseCategories : courseCategories.rows, curCourseCategory : courseCategoryDetail })

  }
  indexCollapseExpand = async ({ auth, request, response, view, params, session }) => {
    const authUser = auth.user.toJSON()
    let sortBy = request.input('sort_by') ? request.input('sort_by') : 'name' ;
    let mode   = request.input('mode') ? request.input('mode') : 'asc';
    let datas = await CourseCategory.query()
      .withCount('courses')
      .with('childCategory', builder => {
                          builder.withCount('courses').whereNull('deleted_at').orderBy(sortBy,mode); //  select columns / pass array of columns
                        })
      .with('parentCategory')
      .select("id","name","sortorder","idnumber","parent","visible")

      .whereNull('deleted_at')
      .orderBy(sortBy,mode)
      .fetch()
      datas.rows    = datas.rows.filter(item => {

            return !item.getRelated('parentCategory') ||  item.getRelated('childCategory').rows.length > 0;
      })
    return view.render('dashboard.course_category.index_collapse_expand_2', { authUser: authUser, datas: datas })
  }
  datatable = async ({auth,request,response})=>{
        const authUser = auth.user.toJSON()

        let courseCategories = await CourseCategory.query()
        .with('courses')
        .select("id","name","sortorder","idnumber","parent")

        .whereNull('deleted_at')
        .fetch()


        var result = Object.keys(courseCategories).map((key) => [Number(key),courseCategories[key]]);
        let valueDatatable = {
          draw            : 0,
          recordsTotal    : result[0][1].length,
          recordsFiltered : 10,
          data            : result[0][1]
        };


        // return JSON.stringify(valueDatatable);
        return valueDatatable;
      }

  create = async ({auth,request, response, view})=>{
        const authUser         = auth.user.toJSON()
        let   parentCategory   = null;
        if( request.input('parent')){
          parentCategory = await CourseCategory.find(request.input('parent'));
        }
        const courseCategories =  await CourseCategory.all()

        let returnView = 'dashboard.course_category.create';
        if(parentCategory){
          returnView = 'dashboard.course_category.create_sub';
        }


        return view.render(returnView,{ authUser : authUser,  courseCategories : courseCategories.rows, parentCategory : parentCategory})
      }


   store = async ({ request, response, view, session })=> {
        const rules             = {
          idnumber  : 'required|unique:course_categories,idnumber',
          name      : 'required',



        }

        const validation        = await validate(request.all(), rules)

        if (validation.fails()) {
          session
            .withErrors(validation.messages())


            console.log(validation.messages());

          return response.redirect('back')
        }

        console.log(request.input('parent'));


        const parentCourseCategory    = await CourseCategory.find(request.input('parent'));

        const courseCategory          = new CourseCategory();

        courseCategory.name           = request.input('name');
        courseCategory.idnumber       = request.input('idnumber');
        courseCategory.parent         = request.input('parent');
        courseCategory.sortorder      = 10000;

        if(parentCourseCategory){
          courseCategory.sortorder    = parentCourseCategory.sortorder + 10000;
          let allCourseCategories     = await CourseCategory.query().select("id","sortorder").where('sortorder','>',parentCourseCategory.sortorder).orderBy('sortorder','asc').fetch();
          for (let index in allCourseCategories.rows) {
              allCourseCategories.rows[index].sortorder = allCourseCategories.rows[index].sortorder + 10000
              await allCourseCategories.rows[index].save();
          }
        }
        else{
           let allCourseCategories    = await CourseCategory.query().orderBy('sortorder','asc').fetch();
           if(allCourseCategories.rows.length > 0){
            courseCategory.sortorder  = allCourseCategories.rows[allCourseCategories.rows.length-1].sortorder;
           }

        }





        await courseCategory.save();

        session.flash({ notification: 'Successfully create!' });
        return response.route('dashboard.course-category.index-collapse-expand')
      }


      edit = async ({auth,request, response, view, params})=>{
        const id               = params.id;
        const courseCategory   =  await CourseCategory.find(id);
        const authUser         = auth.user.toJSON()
        const courseCategories =  await CourseCategory.all()
        return view.render('dashboard.course_category.edit',{ authUser : authUser,  courseCategories : courseCategories.rows , courseCategory : courseCategory})
      }

      update = async ({auth,request, response, view, params, session})=>{
        const id                = params.id;
        const rules             = {
        //   email: 'required|email|unique:user,email,id,'+id,

          idnumber  : 'required|unique:course_categories,idnumber,id,'+id,
          name      : 'required',


        }

        const validation        = await validate(request.all(), rules)

        if (validation.fails()) {
          session
            .withErrors(validation.messages())


            console.log(validation.messages());

          return response.redirect('back')
        }



        const courseCategory       = await CourseCategory.find(id);
        courseCategory.name        = request.input('name');
        courseCategory.idnumber    = request.input('idnumber');

        let tempSortOrder          = courseCategory.sortorder;

        if(courseCategory.parent != request.input('parent')){
          courseCategory.sortorder   = 10000;

          let allLowerCourseCategories     = await CourseCategory.query().select("id","sortorder").where('sortorder','>',tempSortOrder).orderBy('sortorder','asc').fetch();
          for (let index in allLowerCourseCategories.rows) {
              allLowerCourseCategories.rows[index].sortorder = allLowerCourseCategories.rows[index].sortorder - 10000
              await allLowerCourseCategories.rows[index].save();
          }

          const parentCourseCategory    = await CourseCategory.find(request.input('parent'));

          if(parentCourseCategory){
            courseCategory.sortorder    = parentCourseCategory.sortorder + 10000;
            let allCourseCategories     = await CourseCategory.query().select("id","sortorder").where('sortorder','>',parentCourseCategory.sortorder).orderBy('sortorder','asc').fetch();
            for (let index in allCourseCategories.rows) {
                allCourseCategories.rows[index].sortorder = allCourseCategories.rows[index].sortorder + 10000
                await allCourseCategories.rows[index].save();
            }
          }
          else{
             let allCourseCategories    = await CourseCategory.query().orderBy('sortorder','asc').fetch();
             if(allCourseCategories.rows.length > 0){
              courseCategory.sortorder  = allCourseCategories.rows[allCourseCategories.rows.length-1].sortorder;
             }

          }

        }




        courseCategory.parent      = request.input('parent');
        await courseCategory.save();

        session.flash({ notification: 'Successfully update!' });
        return response.route('dashboard.course-category.index-collapse-expand')
     }

     changeParent = async({request, response, view, params, session, auth})=>{

        let parent = request.input('parent');
        let arrId = request.input('choose_categories');
        console.log(parent, arrId);

        await CourseCategory.query()
        .whereIn('id', arrId)
        .update({ parent : parent });

        session.flash({ notification: 'Successfully move categories!' });
        return response.route('dashboard.course-category.index-collapse-expand')
     }

     changeParentOneData = async ({request, response, view, params, session, auth})=>{

      let parent = request.input('parent');
      let id = request.input('choose_categories');
      console.log(parent, id);
      if(id == parent){
        parent = 0;
      }

      await CourseCategory.query()
      .where('id', id)
      .update({ parent : parent });

      session.flash({ notification: 'Successfully move categories!' });
      return response.route('dashboard.course-category.index-collapse-expand')
   }
     async switchVisible({request, response, view, params, session}){
      const id        = params.id;
      const data      = await CourseCategory.find(id);

      if(data.visible == 1){
        data.visible = 0;
        session.flash({ notification: 'Successfully switch to hide '+data.name +' !' });
      }
      else{
        data.visible = 1;
        session.flash({ notification: 'Successfully switch to show '+data.name +' !' });
      }

      await data.save();


      return response.route('dashboard.course-category.index-collapse-expand')
     }

     async delete({request, response, view, params, session}){
      const id              = params.id;
      const courseCategory  = await CourseCategory.find(id);

      await courseCategory.delete();

      session.flash({ notification: 'Successfully delete!' });
      return response.route('dashboard.course-category.index-collapse-expand')
     }



     async softDelete({request, response, view, params, session}){
      const id                   = params.id;
      const courseCategory       = await CourseCategory.find(id);

      const today                = new Date();
      const date                 = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      const time                 = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      const dateTime             = date+' '+time;
      courseCategory.deleted_at  = dateTime;

      await courseCategory.save();

      session.flash({ notification: 'Successfully delete '+courseCategory.name+ '!' });
      return response.route('dashboard.course-category.index-collapse-expand')
     }

     async switchVisible({request, response, view, params, session}){
        const id                = params.id;
        const courseCategory    = await CourseCategory.find(id);

        if(courseCategory.visible == 1){
          courseCategory.visible = 0;
          session.flash({ notification: 'Successfully unvisible '+courseCategory.name +' !' });
        }
        else{
          courseCategory.visible = 1;
          session.flash({ notification: 'Successfully visible '+courseCategory.name +' !' });
        }

        await courseCategory.save();


        return response.route('dashboard.course-category.index-collapse-expand')
    }

    async moveUp({request, response, view, params, session}){

      const id                = params.id;
      const courseCategory    = await CourseCategory.find(id);

      if(courseCategory){
        let temp              = courseCategory.sortorder;

        let getUppers         = await CourseCategory.query().where('sortorder','<',courseCategory.sortorder).orderBy('sortorder','desc').fetch();

        if(getUppers.rows.length > 0){
          courseCategory.sortorder          = getUppers.rows[0].sortorder;
          getUppers.rows[0].sortorder       = temp;
          await getUppers.rows[0].save();
          await courseCategory.save();

          session.flash({ successMessage: 'Successfully moveUp' });
        }
        session.flash({ failMessage: 'MoveUp Failed' });
      }

      return response.route('dashboard.course-category.index-collapse-expand')

    }

    async moveDown({request, response, view, params, session}){

      const id                = params.id;
      const courseCategory    = await CourseCategory.find(id);

      if(courseCategory){
        let temp              = courseCategory.sortorder;

        let getLowers         = await CourseCategory.query().where('sortorder','>',courseCategory.sortorder).orderBy('sortorder','asc').fetch();

        if(getLowers.rows.length > 0){
          courseCategory.sortorder          = getLowers.rows[0].sortorder;
          getLowers.rows[0].sortorder       = temp;
          await getLowers.rows[0].save();
          await courseCategory.save();

          session.flash({ successMessage: 'Successfully movedown' });
        }
        session.flash({ failMessage: 'Movedown Failed' });
      }

      return response.route('dashboard.course-category.index-collapse-expand')

    }
}

module.exports = CourseCategoryController
