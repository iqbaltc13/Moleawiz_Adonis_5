'use strict'
const ThemeSetting                 = use('App/Models/ThemeSetting')
const Route                        = use('Route')
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const UploadHelper                 = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                      = use('Helpers')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')
const Database                     = use('Database')
const ImportService                = use('App/Services/ImportService')

class ThemeController {

  async set({ auth, request, response, view, params, session }) {
    
     let jsonValue  = {

      //logo: image,
      //logo_login: imagelLogin,
      //logo_login_background : imagelLoginBackground,
      color_scheme: request.input('color_scheme') ? request.input('color_scheme') : "#DF2333",
      secondary_color : request.input('secondary_color') ? request.input('secondary_color') : "#FFA5A9",
      primary_color : request.input('primary_color') ? request.input('primary_color') : "#A3090F",
      footer: request.input('footer') ? request.input('footer') : "2021 © digima ASIA" ,
      
    };
   
    let image = "";
    if(request.file('logo')){
      const logoPic = request.file('logo', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      image = 'logo'+'.'+logoPic.subtype
      await logoPic.move(Helpers.publicPath('uploads/assets/images'),{
        name: image,
        overwrite: true
      })
      jsonValue.logo = image;
      if(!logoPic.moved()){
        session.withErrors([{ notification: 'Upload logo Error !' , field:'logo', message: logoPic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
    }

    let imagelLogin = "";
    if(request.file('logo_login')){
      const logologinPic = request.file('logo_login', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      imagelLogin = 'logo_login'+'.'+logologinPic.subtype
      await logologinPic.move(Helpers.publicPath('uploads/assets/images'),{
        name: imagelLogin,
        overwrite: true
      })
      jsonValue.logo_login = imagelLogin;
      if(!logologinPic.moved()){
  
          
        session.withErrors([{ notification: 'Upload logo login Error !', field: 'logo_login', message: logologinPic.error().message }]).flashAll();
        return response.redirect('back')
      }
    }

    let imagelLoginBackground = "";
    if(request.file('logo_login_background')){
      const logologinbackgroundPic = request.file('logo_login_background', {
        types : ['png', 'jpg','jpeg'],
        size: '5mb',
        overwrite: true
      })
      imagelLoginBackground = 'logo_login_background'+'.'+logologinbackgroundPic.subtype
      await logologinbackgroundPic.move(Helpers.publicPath('uploads/assets/images'),{
        name: imagelLoginBackground,
        overwrite: true
      })
      jsonValue.logo_login_background = imagelLoginBackground;
      if(!logologinbackgroundPic.moved()){
        session.withErrors([{ notification: 'Upload logo login Error !' , field:'logo_login_background', message: logologinbackgroundPic.error().message }]).flashAll() ;
        return response.redirect('back')
      }
    }

    
    
    

    let data = await ThemeSetting.updateOrCreate(
      {
        name: 'fundamentals',

      },
      {
        value : JSON.stringify(jsonValue),

      }

    );
    //console.log(data);


    session.flash({ notification: 'Success set theme!' });
    return response.route('setting.set-theme-form')

  }
  async setForm({auth,request, response, view, params, session}){
    let data = await ThemeSetting.query().where('name','fundamentals').first();
    const authUser = auth.user.toJSON()
    return view.render('settings.theme.set_theme_new',{
         authUser : authUser
       ,  data : JSON.parse(data.value)
    })
  }
  async getDataThemes({ request, response, view, params, session }) {
    let data = await ThemeSetting.query().where('name', 'fundamentals').first();
    return JSON.parse(data.value);
  }
}

module.exports = ThemeController
