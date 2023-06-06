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
const DaaJourneyCohortEnrol             = use('App/Models/DaaJourneyCohortEnrol')
const DaaJourney                        = use('App/Models/DaaJourney')
const DaaCourse                         = use('App/Models/DaaCourse')
const DaaCourseLog                      = use('App/Models/DaaCourseLog')
const DaaCourseModule                   = use('App/Models/DaaCourseModule')
const ToolRecyclebinCourse              = use('App/Models/ToolRecyclebinCourse')
const Course = use('App/Models/Course')
const Scorm                             = use('App/Models/Scorm')
const DaaFileExport                     = use('App/Models/DaaFileExport')
const User                              = use('App/Models/User')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const TextHelper                        = use('App/Controllers/Http/Helper/TextController')
const Drive                             = use('Drive');
const Role = use('App/Models/Role')
const Database                     = use('Database')



class CourseController {
    constructor() {


      this.text_helper = new TextHelper();

    }
    index = async({ view,auth,request,response,params }) => {
        const authUser = auth.user.toJSON()
        const id = params.id;
        let courses = await Courses.query()
        .with('category','parent','child')
        .select("id","fullname","sortorder","visible")
        .where("category",id)
        .whereNull('deleted_at')
        .fetch()




        return view.render('dashboard.course.index',{ authUser : authUser, courses : courses.rows })

      }
      datatable = async({auth,request,response,params})=>{
        const id = params.id;
        let courses = await Courses.query()
        .with('category','parent','child')
        .select("id","fullname","sortorder")
        .where("category",id)
        .whereNull('deleted_at')
        .fetch()

        var result = Object.keys(course).map((key) => [Number(key), courses[key]]);
        let valueDatatable = {
          draw            : 0,
          recordsTotal    : result[0][1].length,
          recordsFiltered : 10,
          data            : result[0][1]
        };


        // return JSON.stringify(valueDatatable);
        return valueDatatable;
      }

      create = async ({auth,request, response, view,session,params})=>{
        const authUser         = auth.user.toJSON()
        const datasRole        = await Role.query().whereNull('deleted_at').fetch();
        const courseCategories = await CourseCategory.all()
        return view.render('dashboard.course.create',{ authUser : authUser, courseCategories : courseCategories.rows , datasRole : datasRole })
      }
  
     createByCategory = async({ auth, request, response, view, session, params })=> {
        let id = params.category_id
         let category = await CourseCategory.query().where('id', id).first();
        const authUser         = auth.user.toJSON()
        const datasRole        = await Role.query().whereNull('deleted_at').fetch();
        const courseCategories = await CourseCategory.all()
        return view.render('dashboard.course.create_new',{ authUser : authUser, courseCategories : courseCategories.rows , datasRole : datasRole, category: category })
      }

     store = async({ request, response, view, session })=> {
        const rules             = {
          fullname     : 'required',
          shortname    : 'required',
          category     : 'required',
          idnumber     : 'required'
        }

        const validation        = await validate(request.all(), rules)

        if (validation.fails()) {
          session
            .withErrors(validation.messages())


            console.log(validation.messages());

          return response.redirect('back')
        }


        // let image = "";
        // if(request.file('profile_pic')){
        //   const profilePic = request.file('profile_pic', {
        //     types : ['png', 'jpg','jpeg'],
        //     size: '5mb',
        //     overwrite: true
        //   })


        //   image = new Date().getTime()+'.'+profilePic.subtype

        //   await profilePic.move(Helpers.publicPath('uploads/profpic'),{
        //     name: image
        //   })


        //   if(!profilePic.moved()){
        //     session.withErrors([{ notification: 'Successfully create!' , field:'profile_pic', message: profilePic.error().message }]).flashAll() ;
        //     return response.redirect('back')
        //   }
        // }


        const today       = new Date();
        const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const dateTime    = date+' '+time;
        const course = new Course();

        course.fullname         = request.input('fullname');
        course.shortname        = request.input('shortname');
        course.category         = request.input('category');
        course.visible          = request.input('visible');
        course.idnumber         = request.input('idnumber');
        if (request.input('startdate')) {
          if (request.input('startdate') != '') {
            course.startdate    = request.input('startdate')
          }
        }
        if (request.input('enddate')) {
          if (request.input('enddate') != '') {
            course.enddate      = request.input('enddate')
          }
        }
        course.summary          = request.input('summary');
        course.format           = request.input('format');
        course.maxbytes         = request.input('maxbytes');
        course.enablecompletion = request.input('enablecompletion');
        course.timecreated      = dateTime;
        course.timemodified     = dateTime;
        await course.save();

        const formatOption      = await new CourseFormatOption();
        formatOption.courseid   = course.id;
        formatOption.format     = 'singleactivity';
        formatOption.sectionid  = 0;
        formatOption.name       = 'activitytype';
        formatOption.value      = request.input('activitytype');
        await formatOption.save();


        session.flash({ notification: 'Successfully create!' });
        return response.route('dashboard.course.index-by-category',{category_id : course.category })
      }


      edit = async({auth,request, response, view, params}) =>{
        const id                    = params.id;
        const course                = await Course.query().with('format_option').with('kategory').with('scorms').where('id',id).first();
        if(course){
          course.datetime_started     = new Date(course.startdate * 1000);
          course.str_startdate        = '';
          if (course.startdate       != 0) {
            course.str_startdate      =  course.datetime_started.getFullYear()+'-'+(course.datetime_started.getMonth()+1)+'-'+course.datetime_started.getDate();

          }
          course.datetime_enddate = new Date(course.enddate * 1000);
          course.str_enddate          = '';
          if (course.enddate         != 0) {
            course.str_enddate        =  course.datetime_enddate.getFullYear()+'-'+(course.datetime_enddate.getMonth()+1)+'-'+course.datetime_enddate.getDate();
          }
        }


        const datasRole        = await Role.query().whereNull('deleted_at').fetch();
        const authUser = auth.user.toJSON()
        const courseCategories =  await CourseCategory.all()
        return view.render('dashboard.course.edit_new',{ authUser : authUser,  courseCategories : courseCategories.rows , course : course, datasRole : datasRole})
      }

      detail = async({auth,request, response, view, params})=>{
        const id                    = params.id;
        const course                = await Course.query().with('format_option')
          .with('kategory')
          .with('scorms')
                                      .where('id', id).first();
        if(course){
          course.datetime_started     = new Date(course.startdate * 1000);
          course.str_startdate        = '';
          if (course.startdate       != 0) {
            course.str_startdate      =  course.datetime_started.getFullYear()+'-'+(course.datetime_started.getMonth()+1)+'-'+course.datetime_started.getDate();

          }
          course.datetime_enddate = new Date(course.enddate * 1000);
          course.str_enddate          = '';
          if (course.enddate         != 0) {
            course.str_enddate        =  course.datetime_enddate.getFullYear()+'-'+(course.datetime_enddate.getMonth()+1)+'-'+course.datetime_enddate.getDate();
          }
        }


        
        const authUser = auth.user.toJSON()
        
        return view.render('dashboard.course.detail',{ authUser : authUser,  course : course})
      }

      update = async ({auth,request, response, view, params, session})=>{
        const id                = params.id;
        const rules             = {
          fullname     : 'required',
          shortname: 'required',
          
          category     : 'required',
          idnumber     : 'required'

        //   username: 'required|unique:user,username,id,'+id,
        //   firstname: 'required',
        //   lastname: 'required',
        //   phone2: 'required',
        //   city: 'required',
        //   country: 'required',
          //password: 'required|min:10'
        }

        const validation        = await validate(request.all(), rules)

        if (validation.fails()) {
          session
            .withErrors(validation.messages())


            console.log(validation.messages());

          return response.redirect('back')
        }
        let scorm = await Scorm.query().where('course', id).first();
        if (!scorm) {
          scorm = await new Scorm(); 
          scorm.course = id;
        }
       
                 
        
        let file ="";
        if(request.file('scorm_file')){
          const fileScorm = request.file('scorm_file', {
            extnames: ['zip', 'rar'],
            overwrite: true
          });

          file = new Date().getTime()+'.'+fileScorm.extname

          await fileScorm.move(Helpers.publicPath('uploads/scorm'),{
             name: file
          })
          scorm.name = request.input('scorm_name');
          scorm.launch = request.input('scorm_launch');
          scorm.reference = file;
          scorm.scormtype = "local";
          scorm.introformat = 1;
          scorm.version = "SCORM_1.2";
          scorm.maxgrade = 100;
          scorm.grademethod = 1;
          scorm.whatgrade = 0;
          scorm.maxattempt = 0;
          scorm.forcecompleted = 0;
          scorm.forcenewattempt = 0;
          scorm.sha1hash = "";
          scorm.revision = 1;
          scorm.options = "0";
          scorm.width = 100;
          scorm.height = 100;
          scorm.navpositionleft = -100;
          scorm.navpositiontop = -100;

          await scorm.save();
          if(!fileScorm.moved()){
            session.withErrors([{ notification: 'Failed Upload!' , field:'scorm_file', message: fileScorm.error().message }]).flashAll() ;
            return response.redirect('back')
          }
        }


        const today       = new Date();
        const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const dateTime    = date+' '+time;
        const course            = await Course.find(id);
        course.fullname         = request.input('fullname');
        course.shortname        = request.input('shortname');
        course.category         = request.input('category');
        course.visible          = request.input('visible');
        course.idnumber         = request.input('idnumber');
        if (request.input('startdate')) {
          if (request.input('startdate') != '') {
            //course.startdate    = new Date(request.input('startdate')).getTime() / 1000
            course.startdate = request.input('startdate')
          }
        }
        if (request.input('enddate')) {
          if (request.input('enddate') != '') {
            //course.enddate      = new Date(request.input('enddate')).getTime() / 1000
            course.enddate  = request.input('enddate')
          }
        }
        course.summary          = request.input('summary');
        course.format           = request.input('format');
        course.maxbytes         = request.input('maxbytes');
        course.enablecompletion = request.input('enablecompletion');
        //course.timecreated      = new Date().getTime() / 1000;
        course.timemodified     = dateTime;


        await course.save();

        const formatOption      = await CourseFormatOption.query().where('courseid',id).first();
        if(formatOption){
          formatOption.value      = request.input('activitytype');
          await formatOption.save();
        }


        session.flash({ notification: 'Successfully update!' });
        return response.route('dashboard.course.index-by-category',{category_id : course.category })
     }

     delete = async({request, response, view, params, session})=>{
      const id     = params.id;
      const course = await Course.find(id);

      await course.delete();

      session.flash({ notification: 'Successfully delete!' });
      return response.redirect('back')
     }



    softDelete = async ({request, response, view, params, session})=>{
      const id          = params.id;
      const course      = await Course.find(id);

      const today       = new Date();
      const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      const dateTime    = date+' '+time;
      course.deleted_at = dateTime;

      await course.save();

      session.flash({ notification: 'Successfully delete!' });
      return response.redirect('back')
  }
  
  softDeleteRedirectToListCourse = async ({request, response, view, params, session})=>{
      const id          = params.id;
      const course      = await Course.find(id);

      const today       = new Date();
      const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      const dateTime    = date+' '+time;
      course.deleted_at = dateTime;

      await course.save();

      session.flash({ notification: 'Successfully delete!' });
      return response.route('dashboard.course.index-by-category',{ category_id : course.category })
     }
  


    changeCategory = async({request, response, view, params, session, auth})=>{

        let category = request.input('category');
        let arrId = request.input('choose_courses');
        console.log(category, arrId);

        await Course.query()
        .whereIn('id', arrId)
        .update({ category : category });

        session.flash({ notification: 'Successfully move courses!' });
        return response.redirect('back')
     }

     switchVisible = async({request, response, view, params, session})=>{
        const id        = params.id;
        const course    = await Course.find(id);

        if(course.visible == 1){
          course.visible = 0;
          session.flash({ notification: 'Successfully unvisible '+course.fullname +' !' });
        }
        else{
          course.visible = 1;
          session.flash({ notification: 'Successfully visible '+course.fullname +' !' });
        }

        await course.save();


        return response.redirect('back')
    }

    moveUp = async ({request, response, view, params, session})=>{

      const id                = params.id;
      const course    = await Course.find(id);

      if(course){
        let temp              = course.sortorder;

        let getUppers         = await Course.query()
        .where('sortorder','<',course.sortorder)
        .where('category',course.category)
        .orderBy('sortorder','desc')
        .fetch();

        if(getUppers.rows.length > 0){
          course.sortorder                  = getUppers.rows[0].sortorder;
          getUppers.rows[0].sortorder       = temp;
          await getUppers.rows[0].save();
          await course.save();

          session.flash({ successMessage: 'Successfully moveUp' });
        }
        session.flash({ failMessage: 'MoveUp Failed' });
      }

      return response.redirect('back')

    }

    moveDown = async ({request, response, view, params, session})=>{

      const id                = params.id;
      const course            = await Course.find(id);

      if(course){
        let temp              = course.sortorder;

        let getLowers         = await Course.query()
        .where('sortorder','>',course.sortorder)
        .where('category',course.category)
        .orderBy('sortorder','asc')
        .fetch();

        if(getLowers.rows.length > 0){
          course.sortorder          = getLowers.rows[0].sortorder;
          getLowers.rows[0].sortorder       = temp;
          await getLowers.rows[0].save();
          await course.save();

          session.flash({ successMessage: 'Successfully movedown' });
        }
        session.flash({ failMessage: 'Movedown Failed' });
      }

      return response.redirect('back')

    }

    indexExport = async ({request, response, view, auth, params, session})=>{
      await Database.connection('db_reader').raw("SET  @@sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));")
      await Database.connection('db_reader').raw("SET  @@GLOBAL.sql_mode=(SELECT REPLACE(@@GLOBAL.sql_mode,'ONLY_FULL_GROUP_BY',''));")
      let requestParams = {};

      const authUser = auth.user.toJSON()
      const datas     = await Course
                        .query()

                        .with('course_module')
                        .with('course_module.course')
                        .with('course_module.course.journey')
                        .with('course_module.course.journey.cohort_enrols')
                        .where('visible',1)
                        .whereNull('deleted_at')
                        .groupBy('id' )
                        .fetch();

      for (let index in datas.rows) {
        datas.rows[index].description_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].description.substring(0,249), 5)
        datas.rows[index].fullname_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].fullname.substring(0,249), 3)

      }



      return view.render('dashboard.course.index_export',{ authUser : authUser,  datas : datas.rows , requestParams : requestParams})

    }
    datatableExport = async({request, response, view, params, session})=>{
      const datas     = await Course
                        .query()
                        .select('id', 'fullname','description')
                        .with('course_module')
                        .with('course_module.course')
                        .with('course_module.course.journey')
                        .with('course_module.course.journey.cohort_enrols')
                        .where('visible',1)
                        .whereNull('deleted_at')
                        .groupBy('id' )
                        .fetch();
      for (let index in datas.rows) {
        datas.rows[index].description_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].description.substring(0,249), 5)
        datas.rows[index].fullname_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].fullname.substring(0,249), 3)

      }
      var result = Object.keys(datas).map((key) => [Number(key), datas[key]]);
      let valueDatatable = {
        draw            : 0,
        recordsTotal    : result[0][1].length,
        recordsFiltered : 10,
        data            : result[0][1]
      };



      return valueDatatable;
    }
    indexFileExport = async ({request, response, view, params, session, auth})=>{

      let requestParams = {};

      const authUser = auth.user.toJSON()
      const datas     = await  DaaFileExport
                        .query()
                        .with('user')
                        .where('type', 'export_module')
                        .whereNull('deleted_at')
                        .fetch();


      for (let index in datas.rows) {
        //datas.rows[index].user = await User.query().where('id',datas.rows[index].userid).first();


      }

      return view.render('dashboard.course.index_file_export',{ authUser : authUser,  datas : datas , requestParams : requestParams})

    }
    getContentExportDirectory = async({request, response, view, params, session}) => {
      const testFolder = './uploads/';
      //const contents = await Drive.read(testFolder);
      //return contents
      return fs.readdir(testFolder)
      // fs.readdir(testFolder, (err, files) => {
      //   files.forEach(file => {
      //     console.log(file);
      //   });
      // });


      // Drive.readdir(testFolder, (err, files) => {
      //   files.forEach(file => {
      //     console.log(file);
      //   });
      // });
    }
    datatableFileExport = async ({request, response, view, params, session})=>{

      const datas     = await  DaaFileExport
                        .query()
                        .with('user')
                        .where('type', 'export_module')
                        .whereNull('deleted_at')
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
    export = async ({request, response, view, params, session, auth}) => {

      let requestParams = {};

      const authUser = auth.user.toJSON()
      const datas     = await Course
                        .query()
                        .select('id', 'fullname','description')
                        .with('course_module')
                        .with('course_module.course')
                        .with('course_module.course.journey')
                        .with('course_module.course.journey.cohort_enrols')
                        .where('visible',1)
                        .whereNull('deleted_at')
                        .groupBy('id' )
                        .fetch();

      for (let index in datas.rows) {
        datas.rows[index].description_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].description.substring(0,249), 5)
        datas.rows[index].fullname_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].fullname.substring(0,249), 3)

      }

      let splitter = "|";
      let csvtext  = "";
      let effectiveStartDate = "";
      if(datas.rows.length > 0){
        csvtext += 'METADATA' + splitter;
        csvtext += 'LegacyLearningItem' + splitter;
        csvtext += 'LearningItemId' + splitter;
        csvtext += 'EffectiveStartDate' + splitter;
        csvtext += 'EffectiveEndDate' + splitter;
        csvtext += 'LearningItemNumber' + splitter;
        csvtext += 'Title' + splitter;
        csvtext += 'ShortDescription' + splitter;
        csvtext += 'OwnedByPersonId' + splitter;
        csvtext += 'OwnedByPersonNumber' + splitter;
        csvtext += 'SourceType' + splitter;
        csvtext += 'SourceId' + splitter;
        csvtext += 'SourceInfo' + splitter;
        csvtext += 'SourceSystemOwner' + splitter;
        csvtext += 'SourceSystemId';
        csvtext += "\n";
        for (let index in datas.rows) {
          effectiveStartDate = "";
          if(datas.rows[index].getRelated('course_module')){
            if(datas.rows[index].getRelated('course_module').getRelated('course')){
              // if(datas.rows[index].getRelated('course_module').getRelated('course').getRelated('journey').rows.length > 0){
              if(datas.rows[index].getRelated('course_module').getRelated('course').getRelated('journey')){
                if(datas.rows[index].getRelated('course_module').getRelated('course').getRelated('journey').created_at){
                  //effectiveStartDate = datas.rows[index].getRelated('course_module').getRelated('course').getRelated('journey').rows[0].created_at.toLocaleDateString('en-GB').split('/').reverse().join('/');
                  effectiveStartDate = datas.rows[index].getRelated('course_module').getRelated('course').getRelated('journey').created_at.toLocaleDateString('en-GB').split('/').reverse().join('/');
                }
              }
            }
          }
          csvtext += "MERGE" + splitter;
          csvtext += "LegacyLearningItem" + splitter;
          csvtext += "" + splitter;
          csvtext += effectiveStartDate + splitter;
          csvtext += "4712/12/31" + splitter;
          csvtext += "PK_VR_"+""+datas.rows[index].id + splitter;
          csvtext += datas.rows[index].fullname.replace("\r\n", " ").replace("\n", " ").replace("\r"," ") + splitter;
          csvtext += datas.rows[index].description.replace("\r\n", " ").replace("\n", " ").replace("\r"," ")  + splitter;
          csvtext += "" + splitter;
          csvtext += "3016645" + splitter;
          csvtext += "" + splitter;
          csvtext += "" + splitter;
          csvtext += "" + splitter;
          csvtext += "HCMS" + splitter;
          csvtext += "PK_VR_"+""+datas.rows[index].id;
          csvtext += "\n";
        }
      }else{
        csvtext += 'No Data' + splitter;
      }
      const today       = new Date();
      const date        = today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate();
      const time        = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds()+'_'+today.getMilliseconds();
      const dateTime    = date+'__'+time;
      let filename = "export/export_module_"+dateTime+".dat";



      await Drive.put(filename, Buffer.from(csvtext));
      const daaFileExport       = await new DaaFileExport();
      daaFileExport.name        = "export_module_"+dateTime+".dat";
      daaFileExport.full_path   = Helpers.publicPath()+"/"+filename;
      daaFileExport.type        = "export_module";
      daaFileExport.userid      =  auth.user.id;
      await daaFileExport.save();

      return response.download(Helpers.publicPath()+"/"+filename);


    }
    downloadFileExport = async ({request, response, view, params, session})=>{
      let id =  request.input('id');

      let daaFileExport = await DaaFileExport.query().with('user').where('id',id).first();
      return response.download(daaFileExport.full_path);
    }

  indexbyCategory = async ({ request, response, view, params, session, auth }) => {
      const authUser = auth.user.toJSON()
      let sortBy = request.input('sort_by') ? request.input('sort_by') : 'fullname';
      let mode   = request.input('mode') ? request.input('mode') : 'asc';
      let categoryId = params.category_id;
      let courseCategories = await CourseCategory.query()
        .with('childCategory', builder => {
                          builder.whereNull('deleted_at'); //  select columns / pass array of columns
                        })
        .with('parentCategory')
        .select("id","name","sortorder","idnumber","parent","visible")

        .whereNull('deleted_at')
        .orderBy('sortorder','asc')
        .fetch()



      let courseCategoryDetail = await CourseCategory.query()
                                .with('courses', builder => {
                                    builder.orderBy(sortBy,mode); //  select columns / pass array of columns
                                  })
                                .where('id', categoryId).first();

      return view.render('dashboard.course_category.course.index', { authUser: authUser, category: courseCategoryDetail, datasCategory : courseCategories })

    }

}

module.exports = CourseController
