'use strict'

const Route           = use('Route')
const User            = use('App/Models/User')
const Cohort          = use('App/Models/Cohort')
const CohortMember    = use('App/Models/CohortMember')
const CourseCategory  = use('App/Models/CourseCategory')
//const Multer        = use('Multer')
const { validate }    = use('Validator')
const UploadHelper    = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers         = use('Helpers')
const ImportService   = use('App/Services/ImportService')
const TextHelper      = use('App/Controllers/Http/Helper/TextController')

class CohortController {
  constructor() {
    this.text_helper = new TextHelper();

  }
  async indexAccordion({request, response, auth, view, params, session}){
    const authUser = auth.user.toJSON()
    let cohorts = await Cohort.query()
    .with('members')
    .select("id","contextid","name","idnumber","description","created_at","timecreated","visible")
    .whereNull('deleted_at')
    .fetch();



    let category = await CourseCategory.query()
      .whereNull('deleted_at')
      .orderBy('sortorder', 'asc')
      .fetch();

    for (let index in cohorts.rows) {

      cohorts.rows[index].timecreated_ymd = new Date( cohorts.rows[index].timecreated * 1000);
      cohorts.rows[index].description_cut = await this.text_helper.getWrappedBySpaceCharacter( cohorts.rows[index].description.substring(0, 249), 3);
      cohorts.rows[index].name_cut =  await this.text_helper.getWrappedBySpaceCharacter( cohorts.rows[index].name.substring(0, 249), 3);
      cohorts.rows[index].idnumber_cut =  await this.text_helper.getWrappedBySpaceCharacter( cohorts.rows[index].idnumber.substring(0, 249), 3);
    }

    let cohortSystems = await cohorts.rows.filter(function(cohort) {
      return cohort.contextid == 1;
    });




    //session.flash({ notification: 'Successfully create!' });
    return view.render('dashboard.user.cohort.index_accordion',{ authUser : authUser,  datas : cohorts.rows, dataSystems : cohortSystems , category :  category.rows })
  }
  async index({ view,auth,request,response }) {
    const authUser = auth.user.toJSON()
    let cohorts = await Cohort.query()
    .with('members')
    .select("id","name","idnumber","description","created_at","timecreated","visible")
    .whereNull('deleted_at')
    .fetch()

    cohorts.rows.forEach( function(cohort) {
      cohort.timecreated_ymd = new Date(cohort.timecreated*1000)
    })


    return view.render('dashboard.user.cohort.index',{ authUser : authUser, cohorts : cohorts.rows })

  }
  async datatable({auth,request,response}){
    let cohorts = await Cohort.query()
    .with('members')
    .select("id","name","idnumber","description","created_at","timecreated","visible")
    .whereNull('deleted_at')
    .fetch()

    var result = Object.keys(cohorts).map((key) => [Number(key), cohorts[key]]);
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

    return view.render('dashboard.user.cohort.create',{ authUser : authUser})
  }

  async store({ request, response, view, session }) {
    const rules             = {

      name     : 'required',
      idnumber : 'required',


    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }



    const cohort              = new Cohort();

    cohort.name               = request.input('name');
    cohort.idnumber           = request.input('idnumber');
    cohort.description        = request.input('description') ? request.input('description') : ''
    cohort.visible            = request.input('visible');
    cohort.contextid          = request.input('contextid');
    cohort.timecreated        = new Date().getTime() / 1000;
    await cohort.save();

    session.flash({ notification: 'Successfully create!' });
    return response.route('dashboard.user.cohort.index-accordion')
  }


  async edit({auth,request, response, view, params}){
    const id = params.id;
    const cohort = await Cohort.find(id);
    const authUser = auth.user.toJSON()

    return view.render('dashboard.user.cohort.edit',{ authUser : authUser, cohort : cohort})
  }

  async update({auth,request, response, view, params, session}){
    const id                = params.id;
    const rules             = {

      name     : 'required',
      idnumber : 'required',


    }

    const validation        = await validate(request.all(), rules)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())


        console.log(validation.messages());

      return response.redirect('back')
    }



    const cohort              = await Cohort.find(id);
    cohort.name               = request.input('name');
    cohort.idnumber           = request.input('idnumber');
    cohort.description        = request.input('description') ? request.input('description') : '' ;
    cohort.visible            = request.input('visible');
    cohort.contextid          = request.input('contextid');
    cohort.timecreated        = new Date().getTime() / 1000;
    await cohort.save();

    session.flash({ notification: 'Successfully update!' });
    return response.route('dashboard.user.cohort.index-accordion')
 }

 async delete({request, response, view, params, session}){
  const id     = params.id;
  const cohort   = await Cohort.find(id);

  await cohort.delete();

  session.flash({ notification: 'Successfully delete!' });
  return response.route('dashboard.user.cohort.index-accordion')
 }



 async softDelete({request, response, view, params, session}){
  const id          = params.id;
  const cohort      = await Cohort.find(id);

  const today       = new Date();
  const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime    = date+' '+time;
  cohort.deleted_at = dateTime;

  await cohort.save();

  session.flash({ notification: 'Successfully delete!' });
  return response.route('dashboard.user.cohort.index-accordion')
 }

 async switchVisible({request, response, view, params, session}){
  const id        = params.id;
  const cohort      = await Cohort.find(id);

  if(cohort.visible == 1){
    cohort.visible = 0;
    session.flash({ notification: 'Successfully unvisible '+cohort.name +' !' });
  }
  else{
    cohort.visible = 1;
    session.flash({ notification: 'Successfully visible '+cohort.name +' !' });
  }

  await cohort.save();


  return response.route('dashboard.user.cohort.index-accordion')
 }

 async getAssignUser({auth,request, response, view, params}){
    const      id  = params.id;
    const cohort = await Cohort.query().with('members').with('members.user').where('id', id).first();
   
    let idMembers = cohort.getRelated('members').rows.map(res => res.userid);
   
    
    const authUser = auth.user.toJSON();
    let users      = await User.query()
    .select("id","firstname","lastname")
    
    .where('deleted',0)
    .where('id', '<>', 2)
    .whereNotIn('id',idMembers)
    .orderBy('firstname', 'asc')
    .fetch();



    

    return view.render('dashboard.user.cohort.assign',{ authUser : authUser, cohort : cohort , users : users.rows,members : cohort.getRelated('members').rows})

 }

 async postAssignUser({auth,request, response, view, params, session}){
  const      id     = params.id;
  console.log(id);
  const idMembers   = request.input('id_member');
  console.log(idMembers);
  const  cohort     = await Cohort.query().with('members').where('id',id).first();

  const today       = new Date();
  const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime    = date+' '+time;


  const cohortMember = null;
  const checkCohort  = null;
  for (let index in idMembers) {
    console.log(idMembers[index])

    const cohortMember = await CohortMember.findOrCreate(
      { userid: idMembers[index], cohortid: id },
      { userid: idMembers[index], cohortid: id, timeadded : Date.now() }
    )

  }
  await CohortMember.query().where('cohortid',id)
  .whereNotIn('userid',idMembers)
  .update({ deleted_at: dateTime })

  await CohortMember.query().where('cohortid',id)
  .whereIn('userid',idMembers)
  .update({ deleted_at: null })



  session.flash({ notification: 'Successfully assign user to '+cohort.name +' !' });
  return response.route('dashboard.user.cohort.index-accordion');

 }

 async postAssignUserJson({auth,request, response, view, params, session}){
  const      id     = params.id;

  const idMembers   = request.input('id_member_json').split('-');
  console.log(idMembers);
  const  cohort     = await Cohort.query().with('members').where('id',id).first();

  const today       = new Date();
  const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime    = date+' '+time;


  const cohortMember = null;
  const checkCohort  = null;
  for (let index in idMembers) {
    console.log(idMembers[index])

    const cohortMember = await CohortMember.findOrCreate(
      { userid: idMembers[index], cohortid: id },
      { userid: idMembers[index], cohortid: id, timeadded : Date.now() }
    )

  }
  await CohortMember.query().where('cohortid',id)
  .whereNotIn('userid',idMembers)
  .update({ deleted_at: dateTime })

  await CohortMember.query().where('cohortid',id)
  .whereIn('userid',idMembers)
  .update({ deleted_at: null })

  let  updatedCohort = await Cohort.query().with('members').where('id',id).first();




  return updatedCohort;

 }

 adduserToCohort(params){
  const cohortMember =  CohortMember.findOrCreate(
    { userid: params.userid, cohortid: params.cohortid },
    { userid: params.userid, cohortid: params.cohortid, timeadded : Date.now() }
  )
 }
 async importCohortMemberForm({ view,auth,request,response }) {
  const authUser = auth.user.toJSON()
  let cohorts = await Cohort.query()

  .select("id","name")
  .whereNull('deleted_at')
  .fetch()




  return view.render('dashboard.user.cohort.import_cohort_member_form',{ authUser : authUser, cohorts : cohorts.rows })

}
 async importCohortMember({request,response,session}){

      let upload  = request.file('cohort_member_file')
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

      let send = await ImportService.ImportCohortMember('tmp/' + dir + fname,request.input('cohortid'));
      //console.log(send)
      const  cohort     = await Cohort.query().where('id',request.input('cohortid')).first();
      session.flash({ notification: 'Successfully upload cohort members to '+cohort.name +' !' });
      return response.route('dashboard.user.cohort.index-accordion');
 }
}

module.exports = CohortController
