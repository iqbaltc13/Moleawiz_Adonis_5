'use strict'

const Route                        = use('Route')
const User                         = use('App/Models/User')
const UserInfoDatum = use('App/Models/UserInfoDatum')
const UserInfoCategory = use('App/Models/UserInfoCategory')
const UserInfoField = use('App/Models/UserInfoField')
const { validate }                 = use('Validator')
const UploadHelper                 = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                      = use('Helpers')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')
const Database                     = use('Database')
const ImportService                = use('App/Services/ImportService')

class ProfileFieldController {
    constructor() {

    }

    async index({ auth, request, response, view, params, session }) {
        const authUser = auth.user.toJSON()
        let datas = await UserInfoCategory
        .query()
        .with('fields')
        .whereNull('deleted_at')
        .orderBy('sortorder','ASC')
        .fetch()

        return view.render('dashboard.user.profile_field.index',{ authUser : authUser, datas : datas.rows })

    }

    async createCategory({ auth, request, response, view, params, session }) {
         const authUser = auth.user.toJSON()
         return view.render('dashboard.user.profile_field.category.create',{ authUser : authUser})
    }
    async storeCategory({ auth, request, response, view, params, session }) {
        const rules             = {
            name : 'required|unique:user_info_category,name',

        }

        const validation        = await validate(request.all(), rules)

        if (validation.fails()) {
            session
            .withErrors(validation.messages())
            .flashExcept(['password'])

            console.log(validation.messages());

            return response.redirect('back')
        }

        const data = new UserInfoCategory();

        data.name = request.input('name');
        data.sortorder = 1;
        let parent = await UserInfoCategory
            .query()
            .whereNull('deleted_at')
            .orderBy('sortorder', 'DESC')
            .first();
        if (parent) {
            data.sortorder = parent.sortorder + 1;
        }
        await data.save();

        session.flash({ notification: 'Successfully create Category!' });
        return response.route('dashboard.user.learner-profile-field.index')
    }
    async editCategory({ auth, request, response, view, params, session }) {

        const authUser = auth.user.toJSON()
        let id = params.id;
        let data = await UserInfoCategory
        .query()
        .where('id',id)
        .first()
        return view.render('dashboard.user.profile_field.category.edit',{ authUser : authUser, data : data})
    }
    async updateCategory({ auth, request, response, view, params, session }) {
        const id                = params.id;
        const rules             = {
        //   email: 'required|email|unique:user,email,id,'+id,

          name  : 'required|unique:user_info_category,name,id,'+id,



        }

        const validation        = await validate(request.all(), rules)

        if (validation.fails()) {
          session
            .withErrors(validation.messages())


            console.log(validation.messages());

          return response.redirect('back')
        }



        const data     = await UserInfoCategory.find(id);
        data.name        = request.input('name');

        await data.save();

        session.flash({ notification: 'Successfully update Category!' });
        return response.route('dashboard.user.learner-profile-field.index')
    }
    async createField({ auth, request, response, view, params, session }) {
        const authUser = auth.user.toJSON()
        let categories = await UserInfoCategory
        .query()

        .whereNull('deleted_at')
        .fetch()
        return view.render('dashboard.user.profile_field.create',{ authUser : authUser, dataCategories :  categories.rows})
    }
    async storeField({ auth, request, response, view, params, session }) {
      const rules             = {
        shortname: 'required|unique:user_info_field,shortname',
        name     : 'required',

        }

        const validation        = await validate(request.all(), rules)

        if (validation.fails()) {
            session
            .withErrors(validation.messages())


            console.log(validation.messages());

            return response.redirect('back')
        }

        const data = new UserInfoField();
        data.datatype = request.input('datatype');
        data.shortname = request.input('shortname');
        data.name = request.input('name');
        data.categoryid = request.input('categoryid');
        data.description = request.input('description');
        data.required = request.input('required');
        data.locked = request.input('locked');
        data.forceunique = request.input('forceunique');
        data.signup = request.input('signup');
        data.visible = request.input('visible');
        data.defaultdataformat  = request.input('defaultdataformat');
        data.sortorder = 1;
        let parent = await UserInfoField
            .query()
            .whereNull('deleted_at')
            .orderBy('sortorder', 'DESC')
            .first();
        if (parent) {
            data.sortorder = parent.sortorder + 1;
        }
        await data.save();

        session.flash({ notification: 'Successfully create Field!' });
        return response.route('dashboard.user.learner-profile-field.index')

    }
    async editField({ auth, request, response, view, params, session }) {
        let id = params.id;
        const authUser = auth.user.toJSON()
        let data = await UserInfoField.query().with('category').where('id',id).first();
        let categories = await UserInfoCategory
        .query()

        .whereNull('deleted_at')
        .fetch()
        return view.render('dashboard.user.profile_field.edit',{ authUser : authUser, dataCategories :  categories.rows, data:data})

    }
    async updateField({ auth, request, response, view, params, session }) {
        const id                = params.id;
        const rules             = {
        //   email: 'required|email|unique:user,email,id,'+id,

          shortname  : 'required|unique:user_info_field,shortname,id,'+id,
          name  : 'required'


        }

        const validation        = await validate(request.all(), rules)

        if (validation.fails()) {
          session
            .withErrors(validation.messages())


            console.log(validation.messages());

          return response.redirect('back')
        }




        const data = await UserInfoField.find(id);
        data.datatype = request.input('datatype');
        data.shortname = request.input('shortname');
        data.name = request.input('name');
        data.categoryid = request.input('categoryid');
        data.description = request.input('description');
        data.required = request.input('required');
        data.locked = request.input('locked');
        data.forceunique = request.input('forceunique');
        data.signup = request.input('signup');
        data.visible = request.input('visible');
        data.defaultdataformat  = request.input('defaultdataformat');

        await data.save();

        session.flash({ notification: 'Successfully update Field!' });
        return response.route('dashboard.user.learner-profile-field.index')


    }
    async moveUp({request, response, view, params, session}){

      const id                = params.id;
      const userInfoField    = await UserInfoField.find(id);

      if(userInfoField){
        let temp              = userInfoField.sortorder;

        let getUppers         = await UserInfoField.query().where('sortorder','<',userInfoField.sortorder).orderBy('sortorder','desc').fetch();

        if(getUppers.rows.length > 0){
          userInfoField.sortorder          = getUppers.rows[0].sortorder;
          getUppers.rows[0].sortorder         = temp;
          await getUppers.rows[0].save();
          await userInfoField.save();

          //session.flash({ successMessage: 'Successfully moveUp' });
        }
        else {
          //session.flash({ failMessage: 'MoveUp Failed' });
        }

      }
      else {
          session.flash({ failMessage: 'MoveUp Failed' });
      }

      return response.route('dashboard.user.learner-profile-field.index')

    }

    async moveDown({request, response, view, params, session}){

      const id                = params.id;
      const userInfoField  = await UserInfoField.find(id);

      if(userInfoField){
        let temp              = userInfoField.sortorder;

        let getLowers         = await UserInfoField.query().where('sortorder','>',userInfoField.sortorder).orderBy('sortorder','asc').fetch();

        if(getLowers.rows.length > 0){
          userInfoField.sortorder          = getLowers.rows[0].sortorder;
          getLowers.rows[0].sortorder       = temp;
          await getLowers.rows[0].save();
          await userInfoField.save();

          //session.flash({ successMessage: 'Successfully movedown' });
        }
        else {
          //session.flash({ failMessage: 'Movedown Failed' });
        }

      }
      else {
          session.flash({ failMessage: 'Movedown Failed' });
        }

      return response.route('dashboard.user.learner-profile-field.index')

    }

    async delete({auth, request, response, view, params, session }){
        const id     = params.id;
        const userInfoField  = await UserInfoField.find(id);

        await userInfoField.delete();

        session.flash({ notification: 'Successfully delete!' });
        return response.route('dashboard.user.learner-profile-field.index')
    }



    async softDelete({auth, request, response, view, params, session }){
        const id              = params.id;
        const userInfoField   = await UserInfoField.find(id);

        const today     = new Date();
        const date      = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const time      = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const dateTime  = date+' '+time;
        userInfoField.deleted_at = dateTime;

        await userInfoField.save();

        session.flash({ notification: 'Successfully delete!' });
        return response.route('dashboard.user.learner-profile-field.index')
    }


}

module.exports = ProfileFieldController
