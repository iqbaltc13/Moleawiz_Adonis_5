'use strict'

const Route                             = use('Route')
const DaaJourneyCohortEnrol             = use('App/Models/DaaJourneyCohortEnrol')
const Cohort                            = use('App/Models/Cohort')
const DaaNotification                   = use('App/Models/DaaNotification')
const CohortMember                      = use('App/Models/CohortMember')
const DaaReward                         = use('App/Models/DaaReward')
const DaaRewardHistory                  = use('App/Models/DaaRewardHistory')
const CourseBridgeLearningEffort        = use('App/Models/CourseBridgeLearningEffort')
const CourseCategory                    = use('App/Models/CourseCategory')
const CourseCompletionAggrMethd         = use('App/Models/CourseCompletionAggrMethd')
const CourseCompletionCriteria          = use('App/Models/CourseCompletionCriterion')
const CourseFormatOption                = use('App/Models/CourseFormatOption')
const CourseModule                      = use('App/Models/CourseModule')
const CourseModuleCompletion            = use('App/Models/CourseModuleCompletion')
const CourseSection                     = use('App/Models/CourseSection')
const DaaJourney                        = use('App/Models/DaaJourney')
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
const Database                          = use('Database')
const JourneyController                 = use('App/Controllers/Http/Dashboard/Journey/JourneyController')

class EnrolController {

  constructor() {

    this.journey_controller = new JourneyController();

  }
  index = async ({auth,request, response, view, params, session})=>{

    let journeyId  = params.id;
    const authUser = auth.user.toJSON()

     const datas = await DaaJourneyCohortEnrol.query()
      .with('journey')
      .with('cohort', (builder) => {
         builder.withCount('members')
      })
      .whereNull('deleted_at')
      .where('journey_id',journeyId)
      .fetch();
    let idCohorts = datas.rows.map(res => res.cohort_id);
    let datasCohortUnerolled = await Cohort.query().whereNotIn('id', idCohorts).orderBy('name')
                         .fetch();


    const journey   =  await this.journey_controller.detail(journeyId);

    return view.render('dashboard.journey.enrol.index_new',{ authUser : authUser,  datas : datas,journey : journey, datasCohortUnerolled : datasCohortUnerolled})
  }

  datatable = async ({auth,request, response, view, params, session})=>{
    let id          = params.id;

    const datas = await DaaJourneyCohortEnrol.query()
      .with('journey')
      .with('cohort', (builder) => {
         builder.withCount('members')
      })
      .whereNull('deleted_at')
      .where('journey_id',id)
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

  store = async ({auth,request, response, view, params, session})=>{
    console.log(request.input('cohort_id'),request.input('journey_id'))
    const data = await new DaaJourneyCohortEnrol();

    data.cohort_id      = request.input('cohort_id');
    data.journey_id     = request.input('journey_id');

    await data.save();
    session.flash({ notification: 'Success create Program Enrols !' });
    return response.route('dashboard.journey.enrol.index', {id : request.input('journey_id') });
  }

  softDelete = async ({auth,request, response, view, params, session})=>{

    const cohortId    = params.cohort_id;
    const journeyId    = params.journey_id
    const data        = await DaaJourneyCohortEnrol.query()
                        .with('cohort')
                        .with('cohort.members')
                        .with('journey')
                        .where('cohort_id',cohortId)
                        .where('journey_id',journeyId)
                        .first();



    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time        = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime    = date+' '+time;


    let sqlUpdateDaaNotif = "UPDATE daa_notifications SET deleted_at = '"+dateTime+"'"+
                            "WHERE user_id IN (SELECT userid FROM cohort_members WHERE cohortid ="+cohortId+")"+
                            "AND type = 'enrol' AND context_id = "+journeyId;

    const updateDaaNotif  = await Database.connection('db_reader').raw(sqlUpdateDaaNotif);

    data.deleted_at   = dateTime;

    await data.save();

    session.flash({ notification: 'Successfully delete enrol '+data.getRelated('cohort').name+ ' on '+data.getRelated('journey').name+' Enrollments'+'!' });
    return response.route('dashboard.journey.enrol.index',{id : journeyId })

  }
}


module.exports = EnrolController
