'use strict'

const Route                        = use('Route')
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
const MasterDataHelper             = use('App/Controllers/Http/Dashboard/Master/MasterDataDashboardController')
const Database                     = use('Database')

class CompletionController {

    completingModuleForm = async ({view,auth,request,response,params, session}) => {

        const authUser   = auth.user.toJSON()
        let dataJourneys = await DaaJourney
                                .query()
                                .whereNull('deleted_at')
                                .fetch();
        return view.render('dashboard.completion.module_completion_form',{authUser : authUser,dataJourneys:dataJourneys.rows});
    }
    completingModule = async ({view,auth,request,response,params, session}) => {

      let username       = request.input('username');
      let moduleId      = request.input('idmodule');
      let score          = request.input('score');

      let user           = await User.query()
                                 .where('username',username)
                                 .first();

      if(user){
        let moduleLogs   = await DaaModuleLog.query()
                                 .where('user_id',user.id)
                                 .where('module_id',moduleId)
                                 .first();
        if(moduleLogs){
          const updateModuleLogs = await DaaModuleLog.query()
                                        .where('user_id',user.id)
                                        .where('module_id',moduleId)
                                        .update({ score : score })
        }
        else{
          const createModuleLogs =  new DaaModuleLog();
          createModuleLogs.user_id    = user.id;
          createModuleLogs.module_id  = moduleId;
          createModuleLogs.score      = score;
          await createModuleLogs.save();
        }


        session.flash({
          success : {
            title: 'Success!',
            description: 'Success completing module!',
          },
        });
        return response.route('dashboard.completion.completing-module-form');
      }
      else{
        // session.flash({
        //   error : {
        //     title: 'Failed!',
        //     description: 'User Not Exist',
        //   },
        // });
        return response.redirect('back')
      }


    }
}

module.exports = CompletionController
