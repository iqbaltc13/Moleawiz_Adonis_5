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
const DaaCourse = use('App/Models/DaaCourse')
const Scorm                         = use('App/Models/Scorm')
const DaaCourseLog                      = use('App/Models/DaaCourseLog')
const DaaCourseModule                   = use('App/Models/DaaCourseModule')
const ToolRecyclebinCourse              = use('App/Models/ToolRecyclebinCourse')
const Course                            = use('App/Models/Course')
const DaaFileExport                     = use('App/Models/DaaFileExport')
const User                              = use('App/Models/User')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const TextHelper                        = use('App/Controllers/Http/Helper/TextController')
const Drive                             = use('Drive');
const Role = use('App/Models/Role')
const ScormScoesTrack                   = use('App/Models/ScormScoesTrack')

class ScormController {
     indexAttempt = async ({ view,auth,request,response,params })=> {
          const authUser = auth.user.toJSON()
          const id = params.scorm_id;
          let scorm = await Scorm.query().with('module').where('id', id).first();
          let datas = await ScormScoesTrack.query()
              .with('user')
              .with('scorm',builder => {
                builder.with('module')
              })
              .where('scormid', id)
              .where('element', 'cmi.core.score.raw')
              .whereNull('deleted_at')
              .fetch();
        return view.render('dashboard.course.index_attempt',{ authUser : authUser, datas : datas , scorm : scorm })

      }
      datatableAttempt = async ({auth,request,response,params})=>{

        const id = params.scorm_id;
          let scorm = await Scorm.query().where('id', id).first();
          let datas = await ScormScoesTrack.query()
              .with('user')
              .with('scorm',builder => {
                builder.with('module')
              })
              .where('scormid', id)
              .where('element', 'cmi.core.score.raw')
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
    softDeleteAttemptByScormId = async ({ view, auth, request, response, params, session }) => {
        let id = params.scorm_id;
        let scorm = await Scorm.query().where('id', id).first();
        const today                = new Date();
        const date                 = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const time                 = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const dateTime             = date+' '+time;
         await ScormScoesTrack.query()
        .where('scormid', id)
        .update({ deleted_at : dateTime });

      session.flash({ notification: 'Successfully delete attempt of '+scorm.name+ '!' });
      return response.redirect('back')
    }
}

module.exports = ScormController
