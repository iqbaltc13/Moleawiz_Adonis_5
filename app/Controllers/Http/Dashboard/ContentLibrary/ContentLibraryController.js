'use strict'
const Route                             = use('Route')
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
const DaaContentLibrary                 = use('App/Models/DaaContentLibrary')
const DaaContentLibraryModule           = use('App/Models/DaaContentLibraryModule')
const TextHelper                        = use('App/Controllers/Http/Helper/TextController')


class ContentLibraryController {
  constructor() {
    this.text_helper = new TextHelper();

  }

  index = async({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()
    const datas    = await DaaContentLibrary.query()
                     .with('content_library_module')
                     .whereNull('deleted_at')
                     .fetch();

    for (let index in datas.rows) {
      datas.rows[index].name_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].name.substring(0, 50), 15);
      datas.rows[index].note_cut = await this.text_helper.getWrappedBySpaceCharacter(datas.rows[index].note.substring(0, 250), 10);
    }


    return view.render('dashboard.content_library.index',{ authUser : authUser,  datas : datas.rows})


  }

  datatable = async({auth,request, response, view, params, session})=>{
    let datas =  await DaaContentLibrary.query()
                 .with('content_library_module')
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
    const data     = await DaaContentLibrary.find(id);
    return view.render('dashboard.content_library.edit',{authUser : authUser,data:data});
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
    const data     = await DaaContentLibrary.find(id);
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
    data.note      = request.input('note');
    data.thumbnail = image;
    data.visible   = request.input('visible')== 1 || request.input('visible')== '1' ? 1 : 0;

    data.save();
    session.flash({ notification: 'Success update Content Library '+data.name+'!' });
    return response.route('dashboard.content-library.index')
  }
  switchVisible = async({request, response, view, params, session})=>{
    const id        = params.id;
    const data      = await DaaContentLibrary.find(id);

    if(data.visible == 1){
      data.visible = 0;
      session.flash({ notification: 'Successfully switch to hide '+data.name +' !' });
    }
    else{
      data.visible = 1;
      session.flash({ notification: 'Successfully switch to show '+data.name +' !' });
    }

    await data.save();


    return response.route('dashboard.content-library.index')
   }
  create = async ({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()
    return view.render('dashboard.content_library.create',{authUser : authUser});
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

    const data = new DaaContentLibrary();
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
    data.note      = request.input('note');
    data.thumbnail = image;
    data.visible   = request.input('visible');
    data.save();
    session.flash({ notification: 'Success create Content Library ' +data.name+ '!' });
    return response.redirect('/dashboard/content-library/index')
    //return response.redirect('/dashboard/content-library/index'+'?'+'coba_id=5')

  }

  delete = async  ({auth,request, response, view, params, session})=>{
    session.flash({ notification: '!' });
    return response.route('index')
  }
  softDelete = async ({auth,request, response, view, params, session})=>{
    const id          = params.id;
    const data        = await DaaContentLibrary.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    data.deleted_at = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete '+data.name+'!' });
    return response.route('dashboard.content-library.index')

  }
}

module.exports = ContentLibraryController
