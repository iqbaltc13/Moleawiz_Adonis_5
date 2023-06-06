'use strict'
const Route                        = use('Route')
const User                         = use('App/Models/User')
const Role                         = use('App/Models/Role')
const Config                       = use('App/Models/Config')
const RoleAllowAssign              = use('App/Models/RoleAllowAssign')
const RoleAllowOverride            = use('App/Models/RoleAllowOverride')
const RoleAllowSwitch              = use('App/Models/RoleAllowSwitch')
const RoleAssignment               = use('App/Models/RoleAssignment')
const RoleCapability               = use('App/Models/RoleCapability')
const RoleContextLevel             = use('App/Models/RoleContextLevel')
const RoleName                     = use('App/Models/RolenName')
const RoleSortOrder                = use('App/Models/RolenSortorder')
const Session                      = use('App/Models/Session')
const UserInfoDatum                = use('App/Models/UserInfoDatum')
//const Multer                       = use('Multer')
const { validate }                 = use('Validator')
const UploadHelper                 = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                      = use('Helpers')
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')
const Database                     = use('Database')
const ImportService                = use('App/Services/ImportService')

class RoleController {
  constructor() {
    this.contextlevel = 10;

  }
  async index({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    const datas    = await Role.query()
                     //.with('assignments')
                     .withCount('assignments')
                     .whereNull('deleted_at')
                     .fetch();
    //console.log(datas.rows[0].assignments_count);


    return view.render('dashboard.role.index',{ authUser : authUser,  datas : datas.rows})


  }
  async indexAssign({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    let contextlevel = request.input('contextlevel') ? request.input('contextlevel') : this.contextlevel;
    let getRoleByContext = await RoleContextLevel.query().where('contextlevel',contextlevel).fetch();

    const datas    = await Role.query()

                     .with('assignments')
                     .with('assignments.user')
                     .whereIn('id',getRoleByContext.rows.map(res => res.roleid))
                     .whereNull('deleted_at')
                     .fetch();


    return view.render('dashboard.role.index_assign',{ authUser : authUser,  datas : datas.rows, contextlevel : contextlevel})


  }
  async getAssignUser({auth,request, response, view, params, session}){
    const id           = params.id;
    const assignments  = await RoleAssignment.query()
                         .where('roleid',id)
                         .whereNull('deleted_at')
                         .fetch();
    let arrUser        = [];
    for (let index in assignments.rows) {
      arrUser.push(assignments.rows[index].userid);
    }
    const datas        = await User.query()
                         .whereIn('id',arrUser)
                         .whereNull('deleted_at')
                         .fetch();

    return datas.rows

  }
  async assignUserToSiteAdminForm({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    let data       =  await Config.query().where('name','siteadmins').first();
    let users      = await User.query()
      .select("id","firstname","lastname","username")
      .where('country', '=', 'ID')
      .where('deleted',0)

      .orderBy('firstname', 'asc')
      .fetch();

    return view.render('dashboard.role.assign_user_to_siteadmin',{authUser : authUser,data:data,users : users.rows});
  }
  async assignUserToSiteAdmin({auth,request, response, view, params, session}){

    let data       =  await Config.query().where('name','siteadmins').first();
    data.value     =  request.input('value');
    console.log(data.value)
    data.save();
    return data;

  }

  async assignUserToSiteAdminRedirect({auth,request, response, view, params, session}){

    let data       =  await Config.query().where('name','siteadmins').first();
    data.value     =  request.input('id_member').join();

    data.save();
    return response.redirect('back')

  }
  async datatable({auth,request, response, view, params, session}){
    let datas = await Role.query()
    //.with('members')
    //.select("id","name","idnumber","description","created_at","timecreated","visible")
    .whereNull('deleted_at')
    .fetch()

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
  async edit({auth,request, response, view, params, session}){
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await Role.query().with('assigns').with('overrides').with('switches').where('id',id).first();
    const datasRole = await Role.query()
                     .whereNull('deleted_at')
                     .fetch();
    if(data){
      data.arrAssigns = data.getRelated('assigns').rows.map(res => res.allowassign);
      data.arrOverrides = data.getRelated('overrides').rows.map(res => res.allowoverride);
      data.arrSwitches = data.getRelated('switches').rows.map(res => res.allowswitch);
    }

    return view.render('dashboard.role.edit',{authUser : authUser,data:data , datasRole : datasRole.rows});
  }
  async formReset({auth,request, response, view, params, session}){
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await Role.query().with('assigns').with('overrides').with('switches').where('id',id).first();
    const datasRole = await Role.query()
                     .whereNull('deleted_at')
                     .fetch();
    if(data){
      data.arrAssigns = data.getRelated('assigns').rows.map(res => res.allowassign);
      data.arrOverrides = data.getRelated('overrides').rows.map(res => res.allowoverride);
      data.arrSwitches = data.getRelated('switches').rows.map(res => res.allowswitch);
    }

    return view.render('dashboard.role.reset',{authUser : authUser,data:data , datasRole : datasRole.rows});
  }
  async detail({auth,request, response, view, params, session}){
    let id         = params.id;
    const authUser = auth.user.toJSON()
    const data     = await Role.query()
                     .with('assigns')
                     .with('assigns.parentRole')
                     .with('overrides')
                     .with('overrides.parentRole')
                     .with('switches')
                     .with('switches.parentRole')
                     .where('id',id)
      .first();
    const datasRole = await Role.query()
                     .whereNull('deleted_at')
                     .fetch();
     data.arrAssigns = data.getRelated('assigns').rows.map(res => res.allowassign);
     data.arrOverrides = data.getRelated('overrides').rows.map(res => res.allowoverride);
     data.arrSwitches = data.getRelated('switches').rows.map(res => res.allowswitch);

     let arrRoleAssign =  await Role.query().whereIn('id',data.arrAssigns).whereNull('deleted_at').fetch();
     let arrRoleOverride =  await Role.query().whereIn('id',data.arrOverrides).whereNull('deleted_at').fetch();
     let arrRoleSwitch = await Role.query().whereIn('id',data.arrSwitches).whereNull('deleted_at').fetch();
     data.strAssignsName = arrRoleAssign.rows.map(res => res.name ? res.name : res.shortname).join(", ");
     data.strOverridesName = arrRoleOverride.rows.map(res => res.name ? res.name : res.shortname).join(", ");
     data.strSwitchesName = arrRoleSwitch.rows.map(res => res.name ? res.name : res.shortname).join(", ");


    return view.render('dashboard.role.view',{authUser : authUser,data:data, datasRole : datasRole });


  }
  async update({ auth, request, response, view, params, session }) {
    let id         = params.id;
    let idOverrides = request.input('allowoverride');
    let idSwitches = request.input('allowswitch');
    let idAssigns =  request.input('allowsassign');

    const data     = await Role.find(id);
    data.name      = request.input('name');
    data.description = request.input('description');
    data.shortname = request.input('shortname');
    data.archetype = request.input('archetype');
    data.save();

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;

    for (let index in idOverrides) {
      //console.log(idOverrides[index])

      const roleAllowOverride = await RoleAllowOverride.findOrCreate(
        { allowoverride: idOverrides[index], roleid: id },
        { allowoverride: idOverrides[index], roleid: id }
      )

    }
    await RoleAllowOverride.query().where('roleid',id)
    .whereNotIn('allowoverride',idOverrides)
    .update({ deleted_at: dateTime })

    await RoleAllowOverride.query().where('roleid',id)
    .whereIn('allowoverride',idOverrides)
    .update({ deleted_at: null })


     for (let index in idSwitches) {
      //console.log(idSwitches[index])

      const roleAllowSwitch = await RoleAllowSwitch.findOrCreate(
        { allowswitch: idSwitches[index], roleid: id },
        { allowswitch: idSwitches[index], roleid: id }
      )

    }
    await RoleAllowSwitch.query().where('roleid',id)
    .whereNotIn('allowswitch',idSwitches)
    .update({ deleted_at: dateTime })

    await RoleAllowSwitch.query().where('roleid',id)
    .whereIn('allowswitch',idSwitches )
    .update({ deleted_at: null })


    for (let index in idAssigns) {
      //console.log(idOverrides[index])

      const roleAllowAssign = await RoleAllowAssign.findOrCreate(
        { allowassign: idAssigns[index], roleid: id },
        { allowassign: idAssigns[index], roleid: id }
      )

    }
    await RoleAllowAssign.query().where('roleid',id)
    .whereNotIn('allowassign',idAssigns)
    .update({ deleted_at: dateTime })

    await RoleAllowAssign.query().where('roleid',id)
    .whereIn('allowassign',idAssigns)
    .update({ deleted_at: null })

    session.flash({ notification: 'Success update role '+data.name+'!' });
    return response.route('dashboard.role-management.index')
  }
  async create({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    const datasRole = await Role.query()
                     .whereNull('deleted_at')
                     .fetch();
    return view.render('dashboard.role.create',{authUser : authUser,  datasRole : datasRole.rows});
  }
  async store({ auth, request, response, view, params, session }) {
    let idOverrides = request.input('allowoverride');
    let idSwitches = request.input('allowswitch');
    let idAssigns =  request.input('allowsassign');
    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    let sortorder = 0;
    let getMaxSortorder = await Role.query()
                      .orderBy('sortorder','DESC').first();
    if(getMaxSortorder){
      sortorder = getMaxSortorder.sortorder + 1;
    }
    const data = new Role();
    data.sortorder = sortorder;
    data.name      = request.input('name');
    data.description = request.input('description');
    data.shortname = request.input('shortname');
    data.archetype = request.input('archetype');
    await data.save();

    for (let index in idAssigns) {
      //console.log(idOverrides[index])

      const roleAllowAssign = await RoleAllowAssign.findOrCreate(
        { allowassign: idAssigns[index], roleid: data.id },
        { allowassign: idAssigns[index], roleid: data.id }
      )

    }
    for (let index in idSwitches) {
      //console.log(idSwitches[index])

      const roleAllowSwitch = await RoleAllowSwitch.findOrCreate(
        { allowswitch: idSwitches[index], roleid: data.id },
        { allowswitch: idSwitches[index], roleid: data.id }

      )

    }

    for (let index in idOverrides) {
      //console.log(idOverrides[index])

      const roleAllowOverride = await RoleAllowOverride.findOrCreate(
        { allowoverride: idOverrides[index], roleid: data.id },
        { allowoverride: idOverrides[index], roleid: data.id }
      )

    }
    session.flash({ notification: 'Success create role ' +data.name+ '!' });
    return response.route('dashboard.role-management.index')
  }
  async moveUp({request, response, view, params, session}){

    const id                = params.id;
    const data              = await Role.find(id);

    if(data){
      let temp              = data.sortorder;

      let getUppers         = await Role.query()
      .where('sortorder','<',data.sortorder)

      .orderBy('sortorder','desc')
      .fetch();

      if(getUppers.rows.length > 0){
        data.sortorder                    = getUppers.rows[0].sortorder;
        getUppers.rows[0].sortorder       = temp;
        await getUppers.rows[0].save();
        await data.save();

        session.flash({ successMessage: 'Successfully move up '+data.shortname+'!' });
      }
      session.flash({ failMessage: 'MoveUp Failed' });
    }

    return response.redirect('back')

  }

  async moveDown({request, response, view, params, session}){

    const id                = params.id;
    const data              = await Role.find(id);

    if(data){
      let temp              = data.sortorder;

      let getLowers         = await Role.query()
      .where('sortorder','>',data.sortorder)

      .orderBy('sortorder','asc')
      .fetch();

      if(getLowers.rows.length > 0){
        data.sortorder          = getLowers.rows[0].sortorder;
        getLowers.rows[0].sortorder       = temp;
        await getLowers.rows[0].save();
        await data.save();

        session.flash({ successMessage: 'Successfully move down '+data.shortname+'!' });
      }
      session.flash({ failMessage: 'Movedown Failed' });
    }

    return response.redirect('back')

  }
  async assignUserForm({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    return view.render('',{authUser : authUser,data:data});
  }
  async assignUser({auth,request, response, view, params, session}){
    session.flash({ notification: '!' });
    return response.route('index')
  }
  async delete({auth,request, response, view, params, session}){
    session.flash({ notification: '!' });
    return response.route('index')
  }
   async softDelete({auth,request, response, view, params, session}){
    const id          = params.id;
    console.log(id);
    const data        = await Role.find(id);

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;

    data.deleted_at = dateTime;

    await data.save();
    console.log(data);
    session.flash({ notification: 'Successfully delete '+data.name+'!' });
    return response.route('dashboard.role-management.index')

  }
  async allowAssignForm({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    return view.render('',{authUser : authUser,datas : datas.rows});
  }
  async allowAssign({auth,request, response, view, params, session}){
    session.flash({ notification: '!' });
    return response.route('index')
  }
  async allowOverrideForm({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    return view.render('',{authUser : authUser,datas : datas.rows});
  }
  async allowOverride({auth,request, response, view, params, session}){
    session.flash({ notification: '!' });
    return response.route('index')
  }
  async allowSwitchForm({auth,request, response, view, params, session}){
    const authUser = auth.user.toJSON()
    return view.render('',{authUser : authUser,datas : datas.rows});
  }
  async allowSwitch({auth,request, response, view, params, session}){
    session.flash({ notification: '!' });
    return response.route('index')
  }


 async getAssignUser({auth,request, response, view, params}){
  const      id    = params.id;

  const authUser = auth.user.toJSON();
  const data     = await Role.query().where('id',id).first();
  let assignedUsers = await RoleAssignment.query().with('user').whereHas('user').where('roleid', id).whereNull('deleted_at').fetch();
  let idAssignedUsers = assignedUsers.rows.map(res => res.userid);
  let users      = await User.query()
  .select("id","firstname","lastname")
  .where('deleted',0)
  .where('id', '<>', 2)
  .whereNotIn('id',idAssignedUsers)
  .orderBy('firstname', 'asc')
  .fetch();

  return view.render('dashboard.role.assign_user',{ authUser : authUser, data : data,  users : users.rows,assignedUsers : assignedUsers.rows})

}

  async postAssignUser({auth,request, response, view, params, session}){
    const      id     = params.id;
    console.log(id);
    const idMembers   = request.input('id_member');
    console.log(idMembers);
    const  data     = await Role.query().where('id',id).first();

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    for (let index in idMembers) {
      console.log(idMembers[index])

      const roleAssignment = await RoleAssignment.findOrCreate(
        { userid: idMembers[index], roleid: id },
        { userid: idMembers[index], roleid: id, timemodified : Date.now() }
      )

    }
    await RoleAssignment.query().where('roleid',id).
    whereNotIn('userid',idMembers).
    update({deleted_at : dateTime});
    await RoleAssignment.query().where('roleid',id)
    .whereIn('userid',idMembers)
    .update({ deleted_at: null })
    session.flash({ notification: 'Successfully assign user to '+data.shortname +' !' });
    return response.route('dashboard.role-management.index');
  }

  async postAssignUserJson({auth,request, response, view, params, session}){
    const      id     = params.id;

    const idMembers   = request.input('id_member_json').split('-');
    console.log(idMembers);
    const  data     = await Role.query().where('id',id).first();

    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;
    for (let index in idMembers) {
      console.log(idMembers[index])

      const roleAssignment = await RoleAssignment.findOrCreate(
        { userid: idMembers[index], roleid: id },
        { userid: idMembers[index], roleid: id, timemodified : Date.now() }
      )

    }
    await RoleAssignment.query().where('roleid',id).
    whereNotIn('userid',idMembers).
    update({deleted_at : dateTime});
    await RoleAssignment.query().where('roleid',id)
    .whereIn('userid',idMembers)
    .update({ deleted_at: null })

    let updatedRole = await Role.query()
      .with('assignments')
      .with('assignments.user')
      .where('id', id).first();

    return updatedRole;

 }


}

module.exports = RoleController
