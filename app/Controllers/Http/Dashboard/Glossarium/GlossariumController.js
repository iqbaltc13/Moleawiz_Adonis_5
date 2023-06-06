'use strict'
const Route                        = use('Route')
const Session                      = use('App/Models/Session')
const Helpers                      = use('Helpers')
const TextHelper = use('App/Controllers/Http/Helper/TextController')
const Glossarium = use('App/Models/Glossarium')
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const Database                     = use('Database')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')

class GlossariumController {

  constructor() {



  }

  index = async ({auth,request, response, view, params, session})=>{
    const authUser = auth.user.toJSON()
    const datas    = await Glossarium.query()
                     .whereNull('deleted_at')
      .fetch();
    console.log(datas);
    return view.render('dashboard.glossarium.index',{ authUser : authUser,  datas : datas})
  }
}

module.exports = GlossariumController
