'use strict'

const Route                        = use('Route')
const Country                      = use('App/Models/DaaCountry')
const User                         = use('App/Models/User')
const Cohort                       = use('App/Models/Cohort')
const CohortMember                 = use('App/Models/CohortMember')
const Course                       = use('App/Models/Course')
const CourseModule                 = use('App/Models/CourseModule')
const CourseModuleCompletion       = use('App/Models/CourseModuleCompletion')
const DaaContentLibrary            = use('App/Models/DaaContentLibrary')
const DaaContentLibraryModule      = use('App/Models/DaaContentLibraryModule')
const DaaCourse                    = use('App/Models/DaaCourse')
const DaaCourseLog                 = use('App/Models/DaaCourseLog')
const DaaCourseModule              = use('App/Models/DaaCourseModule')
const DaaJourney                   = use('App/Models/DaaJourney')
const DaaJourneyCohortEnrol        = use('App/Models/DaaJourneyCohortEnrol')
const DaaModuleLog                 = use('App/Models/DaaModuleLog')
const DaaUserAccessDaily           = use('App/Models/DaaUserAccessDaily')
const DaaUserPoint                 = use('App/Models/DaaUserPoint')
const Scorm                        = use('App/Models/Scorm')
const Session                      = use('App/Models/Session')
const UserInfoDatum                = use('App/Models/UserInfoDatum')
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const UploadHelper                 = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                      = use('Helpers')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')
const Database                     = use('Database')
const ImportService                = use('App/Services/ImportService')


class AccountController {
  constructor() {
    this.startdate = null;
    this.enddate   = null;
    this.directorateid = null;
    this.sortBy = " ";
    this.master_data_helper = new MasterDataHelper();
    this.subdirectorateid     = null;
  }
  async index({ view,auth,request,response }) {
    const authUser = auth.user.toJSON()
    let users = await User.query()
    .with('nationality')
    .select("id","firstname","lastname","email","city","lastaccess","country","suspended")
    //.selectRaw("id","firstname","lastname","email","city","lastaccess","country")
    .where('country', '=', 'ID')
    .where('deleted',0)
    //.where('id', '<',2000)
    .fetch()




    return view.render('dashboard.user.account.index',{ authUser : authUser, users : users.rows })

  }
  async datatable({auth,request,response}){
    let users = await User.query()
    .with('nationality')
    .select('id','firstname','lastname','email','city','lastaccess','country')
    //.where('country', '=', 'ID')
    .where('deleted',0)
    //.where('id', '<',20)
    .fetch()

    var result = Object.keys(users).map((key) => [Number(key), users[key]]);
    let valueDatatable = {
      draw            : 0,
      recordsTotal    : result[0][1].length,
      recordsFiltered : 10,
      data            : result[0][1]
    };


    // return JSON.stringify(valueDatatable);
    return valueDatatable;
  }

  async create({auth,request, response, view}){
    const authUser  = auth.user.toJSON()
    const countries =  await Country.all()
    return view.render('dashboard.user.account.create',{ authUser : authUser, countries : countries.rows})
  }

  async store({ request, response, view, session }) {
    const rules             = {
      email: 'required|email|unique:user,email',
      username: 'required|unique:user,username',
      firstname: 'required',
      lastname: 'required',
      phone2: 'required',
      city: 'required',
      country: 'required',
      password: 'required|min:10'
    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())
        .flashExcept(['password'])

        console.log(validation.messages());

      return response.redirect('back')
    }

    // const profilePic = request.file('profpic', {
    //   types: ['image'],
    //   size: '5mb',
    //   overwrite: true
    // })
    let image = "";
    if(request.file('profile_pic')){
      const profilePic = request.file('profile_pic', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })


      image = new Date().getTime()+'.'+profilePic.subtype



      await profilePic.move(Helpers.publicPath('uploads/profpic'),{
        name: image
      })


      if(!profilePic.moved()){
        session.withErrors([{ notification: 'Successfully create!' , field:'profile_pic', message: profilePic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
    }



    const user = new User();

    user.username           = request.input('username');


    user.password           = request.input('password');
    user.suspended          = request.input('suspended');
    user.firstname          = request.input('firstname');
    user.lastname           = request.input('lastname');
    user.email              = request.input('email');
    user.maildisplay        = request.input('maildisplay');
    user.phone2             = request.input('phone2');
    user.city               = request.input('city');
    user.country            = request.input('country');
    user.daa_picture        = image;
    user.imagealt           = request.input('imagealt');
    user.subdirectorate     = request.input('subdirectorate');
    user.group              = request.input('group');
    user.division           = request.input('division');
    user.superior           = request.input('superior');
    user.department         = request.input('department');
    user.position           = request.input('position');
    user.worklocation       = request.input('worklocation');
    user.learningagent      = request.input('learningagent');
    user.directorate        = request.input('directorate');
    user.joindate           = request.input('joindate');
    user.nha                = request.input('nha');
    await user.save();

    session.flash({ notification: 'Successfully create!' });
    return response.route('dashboard.user.account.index')
  }


  async edit({auth,request, response, view, params}){
    const id = params.id;
    const user = await User.find(id);
    const authUser = auth.user.toJSON()
    const countries =  await Country.all()
    return view.render('dashboard.user.account.edit',{ authUser : authUser, user : user, countries : countries.rows})
  }

  async update({auth,request, response, view, params, session}){
    const id                = params.id;
    const rules             = {
      email: 'required|email|unique:user,email,id,'+id,
      username: 'required|unique:user,username,id,'+id,
      firstname: 'required',
      lastname: 'required',
      phone2: 'required',
      city: 'required',
      country: 'required',
      //password: 'required|min:10'
    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())
        .flashExcept(['password'])

        console.log(validation.messages());

      return response.redirect('back')
    }
    let image ="";
    if(request.file('profile_pic')){
      const profilePic = request.file('profile_pic', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })


      image = new Date().getTime()+'.'+profilePic.subtype



      await profilePic.move(Helpers.publicPath('uploads/profpic'),{
         name: image
      })


      if(!profilePic.moved()){
        session.withErrors([{ notification: 'Successfully create!' , field:'profile_pic', message: profilePic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
    }


    const user              = await User.find(id);
    user.username           = request.input('username');

    if (request.input('password') != null){
      user.password         = request.input('password');
    }
    user.suspended          = request.input('suspended');
    user.firstname          = request.input('firstname');
    user.lastname           = request.input('lastname');
    user.email              = request.input('email');
    user.maildisplay        = request.input('maildisplay');
    user.phone2             = request.input('phone2');
    user.city               = request.input('city');
    user.country            = request.input('country');
    user.daa_picture        = image;
    user.imagealt           = request.input('imagealt');
    user.subdirectorate     = request.input('subdirectorate');
    user.group              = request.input('group');
    user.division           = request.input('division');
    user.superior           = request.input('superior');
    user.department         = request.input('department');
    user.position           = request.input('position');
    user.worklocation       = request.input('worklocation');
    user.learningagent      = request.input('learningagent');
    user.directorate        = request.input('directorate');
    user.joindate           = request.input('joindate');
    user.nha                = request.input('nha');



    await user.save();

    session.flash({ notification: 'Successfully update!' });
    return response.route('dashboard.user.account.index')
 }

 async delete({request, response, view, params, session}){
  const id     = params.id;
  const user   = await User.find(id);

  await user.delete();

  session.flash({ notification: 'Successfully delete!' });
  return response.route('dashboard.user.account.index')
 }



 async softDelete({request, response, view, params, session}){
  const id        = params.id;
  const user      = await User.find(id);

  const today     = new Date();
  const date      = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const time      = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime  = date+' '+time;
  user.deleted_at = dateTime;
  user.deleted    = 1;
  await user.save();

  session.flash({ notification: 'Successfully delete!' });
  return response.route('dashboard.user.account.index')
 }

 async switchSuspend({request, response, view, params, session}){
  const id        = params.id;
  const user      = await User.find(id);

  if(user.suspended == 1){
    user.suspended = 0;
    session.flash({ notification: 'Successfully unsuspend '+user.firstname +' '+ user.lastname+'!' });
  }
  else{
    user.suspended = 1;
    session.flash({ notification: 'Successfully suspend '+user.firstname +' '+ user.lastname+'!' });
  }

  await user.save();


  return response.route('dashboard.user.account.index')
 }

 async indexActiveLearners({ view, auth, response, request,session,params }) {

    this.startdate          = request.input('startdate') ? request.input('startdate') : '2020-12-01';
    this.enddate            = request.input('enddate') ? request.input('enddate') : '2020-12-30';


    this.directorateid      = request.input('directorateid');
    this.subdirectorateid   = request.input('subdirectorateid');
    this.sortBy             = request.input('sortBy') ? request.input('sortBy') : ' ' ;
    let directorateid       = this.directorateid;
    const masterDirectorate    = await this.master_data_helper.getDataMasterDirectorate();
    const masterSubDirectorate = await this.master_data_helper.getDataMasterDivision(directorateid);

    let result = await this.getDatatableActiveLearnersRaw();

    console.log(result);

    const authUser = auth.user.toJSON()
    if (authUser.suspended == 1) {
        session.flash({ error: 'Your Account is Suspended' });
        //return response.route('logout')
    }
    return view.render('dashboard.user.dashboard_list_active_users_new',{
      authUser : authUser,

      startdate :this.startdate ,
      enddate : this.enddate,

      results : result[0],
      directorateid : this.directorateid,
      subdirectorateid : this.subdirectorateid,
      masterDirectorate : masterDirectorate.rows,
      masterDivision : masterSubDirectorate[0]
    })



}
async getDatatableActiveLearners({ view, auth, response, request,session,params }) {

  this.startdate          = request.input('startdate') ? request.input('startdate') : '2020-12-01';
  this.enddate            = request.input('enddate') ? request.input('enddate') : '2020-12-30';
  this.sortBy             = request.input('sortBy') ? request.input('sortBy') : ' ' ;
  this.directorateid      = request.input('directorateid');
  this.subdirectorateid   = request.input('subdirectorateid');



    let result = await this.getDatatableActiveLearnersRaw();

    return result[0];

}

async importUserForm({ view,auth,request,response }) {
  const authUser = auth.user.toJSON()

  return view.render('dashboard.user.account.import_user_form',{ authUser : authUser })

}
 async importUser({request,response,session}){

      let delimiter = request.input('delimiter')
      let upload  = request.file('user_file')
      let fname   = `${new Date().getTime()}.${upload.extname}`
      let dir     = 'uploads/'

      //move uploaded file into custom folder
      await upload.move(Helpers.tmpPath(dir), {
          name: fname
      })

      if (!upload.moved()) {
          console.log('error')
          return (upload.error(), 'Error moving files', 500)
      }

      let send = await ImportService.ImportUser('tmp/' + dir + fname,delimiter);

      session.flash({ notification: 'Successfully upload user data' +' !' });
      return response.route('dashboard.user.account.index');
  }

async importSyncActiveUserUserForm({ view,auth,request,response }) {
  const authUser = auth.user.toJSON()

  return view.render('dashboard.user.account.import_sync_active_user_form',{ authUser : authUser })

}
 async importSyncActiveUser({request,response,session}){

      //let delimiter = request.input('delimiter')
      let upload  = request.file('user_file')
      let fname   = `${new Date().getTime()}.${upload.extname}`
      let dir     = 'uploads/'

      //move uploaded file into custom folder
      await upload.move(Helpers.tmpPath(dir), {
          name: fname
      })

      if (!upload.moved()) {
          console.log('error')
          return (upload.error(), 'Error moving files', 500)
      }

      let send = await ImportService.ImporSyncActivetUser('tmp/' + dir + fname);

      session.flash({ notification: 'Successfully sync active user data' +' !' });
      return response.route('dashboard.user.account.index');
 }

  getDatatableActiveLearnersRaw() {



    let sql          = "SELECT "+
                       "u.username AS nip "+
                       ",u.email "+
                       ",CONCAT(u.firstname,' ',u.lastname) AS fullname "+
                       ",MAX(dml.last_open) AS access_date "+
                       ",uid1.data AS directorate "+
                       ",uid2.data AS subdirectorate "+
                       ",FROM_UNIXTIME(dml.created_at) AS access_date2 "+
                       "FROM user u "+
                       "JOIN daa_module_logs dml ON dml.user_id =u.id "+
                       "JOIN scorm s ON s.course = dml.module_id "+
                       "INNER JOIN user_info_data uid1 ON uid1.userid = u.id AND uid1.fieldid=11 "+
                       "INNER JOIN user_info_data uid2 ON uid2.userid = u.id AND uid2.fieldid=2 "+
                       "WHERE "+
                       "u.username REGEXP '^[0-9]+$' AND LENGTH(u.username) = 8 "+
                       "AND u.deleted = 0 "+
                       "AND u.suspended = 0 "+
                       "AND dml.last_open>='"+this.startdate+"' AND dml.last_open<='"+this.enddate+"'  ";
                      if(this.directorateid != null && this.directorateid != 0 && this.directorateid != ''){
                        sql = sql + "AND uid1.data='"+this.directorateid+"' ";
                      }
                      if(this.subdirectorateid != null && this.subdirectorateid != 0 && this.subdirectorateid != ''){
                        sql = sql + " AND uid2.data='"+this.subdirectorateid+"' ";
                      }

                      if(this.sortBy=='activeUser'){
                        sql = sql + " AND dml.user_id IS NOT NULL ";
                      }
                      if(this.sortBy=='inactiveUser'){
                        sql = sql + " AND dml.user_id IS NULL ";
                      }

                      sql = sql + " GROUP BY u.id ";

    console.log(sql);
    const result       =  Database.connection('db_reader').raw(sql);

    return result;
  }

  async detail({ view, auth, response, request,session,params }) {
    let id = params.id;
    const data = await User.query()
                .with('module_logs')
                .with('module_logs.module')
                .with('info')
                .with('nationality')
                .where('id',id).first();
    const authUser = auth.user.toJSON()
    return view.render('dashboard.user.account.detail',{ authUser : authUser, user : data})
  }

  async importLearnersFormWithPreview({ view,auth,request,response }) {
    const authUser = auth.user.toJSON()

    return view.render('dashboard.user.account.import_user_form_with_preview',{ authUser : authUser })

  }
  async importLearnersPreview({ view, auth, response, request,session,params }) {
    const authUser = auth.user.toJSON()

    let delimiter = request.input('delimiter')
    let upload = request.file('user_file')
    let totalPreview = request.input('previewrows');
    let fname   = `${new Date().getTime()}.${upload.extname}`
    let dir     = 'uploads/'

    //move uploaded file into custom folder
    await upload.move(Helpers.tmpPath(dir), {
        name: fname
    })

    if (!upload.moved()) {
        console.log('error')
        return (upload.error(), 'Error moving files', 500)
    }
    let pathFile = 'tmp/' + dir + fname;
    let inputUsersAll = await ImportService.ImportUserPreview('tmp/' + dir + fname, delimiter, totalPreview);
    let inputUsers = inputUsersAll.slice(0, totalPreview);

    session.flash({ notification: 'Successfully upload user data' +' !' });


    return view.render('dashboard.user.account.import_user_preview',{ authUser : authUser, datas : inputUsers, pathFile: pathFile, delimiter: delimiter  })

  }
  async submitImportLearnersAfterPreview({ view, auth, response, request, session, params }) {

    let delimiter = request.input('delimiter')
    let pathFile = request.input('path_file')

    await ImportService.ImportUser(pathFile, delimiter);

    session.flash({ notification: 'Successfully input learner by upload' +' !' });
    return response.route('dashboard.user.account.index');

  }


}

module.exports = AccountController
