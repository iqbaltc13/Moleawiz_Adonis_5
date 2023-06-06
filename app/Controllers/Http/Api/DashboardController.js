'use strict'

const Database = use('Database')
const Env = use('Env')

class DashboardController {
    completion = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const all_module = await Database.connection('db_reader')
                                    .select("c.id")
                                    .from("user as u")
                                    .join("cohort_members as cm", "u.id", "cm.userid")
                                    .join("cohort as ch", "cm.cohortid", "ch.id")
                                    .join("daa_journey_cohort_enrols as djce", "ch.id", "djce.cohort_id")
                                    .join("daa_journeys as dj", "djce.journey_id", "dj.id")
                                    .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                    .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                    .join("course as c", "dcm.module_id", "c.id")
                                    .where("dj.visible", 1)
                                    .where("dc.visible", 1)
                                    .where("c.visible", 1)
                                    .where("c.module_type", 1)
                                    .where("u.id", authUser.id)
        const total_module = all_module.length
        let ids = []
        if (all_module != 0) {
            for(let index in all_module){
                ids.push(all_module[index].id)
            }
        }
        const module_complete = await Database.connection('db_reader')
                                            .select("module_id")
                                            .from("daa_module_logs")
                                            .where("user_id", authUser.id)
                                            .where("is_completed", 1)
                                            .whereIn("module_id", ids)
        const total = module_complete.length
        let progress = 0
        if(total == 0 || total_module == 0){
            progress = 0
        }else{
            progress = Math.round((total/total_module)*100)
        }
        const check_supervisor = await Database.connection('db_reader')
                                            .select("uid.*")
                                            .from("user_info_data as uid")
                                            .join("user_info_field as uif", "uid.fieldid", "uif.id")
                                            .where("uif.shortname", "superior")
                                            .where("uid.data", authUser.username)
        const total_row = check_supervisor.length
        let is_supervisor = 0
        if (total_row > 0) {
            is_supervisor = 1
        }
        const get_profile = await Database.connection('db_reader')
                                    .select("*")
                                    .from("user")
                                    .where("id", authUser.id)
        let data = []
        let pic_url
        if (get_profile != 0) {
            for(let index in get_profile){
                pic_url = Env.get('APP_URL')+'/tmp/uploads/'+get_profile[index].id+'/profile_pic/'
                if (get_profile[index].daa_picture) {
                    get_profile[index].daa_picture = pic_url+get_profile[index].daa_picture
                }else{
                    get_profile[index].daa_picture = ""
                }
                if (get_profile[index].fristname) {
                    get_profile[index].fristname = get_profile[index].fristname
                }else{
                    get_profile[index].fristname = ""
                }
                if (get_profile[index].lastname) {
                    get_profile[index].lastname = get_profile[index].lastname
                }else{
                    get_profile[index].lastname = ""
                }
            }
            const get_position = await Database.connection('db_reader')
                                            .select("uid.userid", "uid.data")
                                            .from("user_info_field as uif")
                                            .join("user_info_data as uid", "uif.id", "uid.fieldid")
                                            .where("uif.id", 7)
                                            .where("uid.userid", authUser.id)
            let position = ""
            let count
            let string
            let end
            for(let index in get_position){
                if(get_position[index].data){
                    count = 0
                    string = substr(get_position[index].data, strpos(get_position[index].data)+".")+1
                    for(let i=0; i<strlen(string); i++){
                        if(string[i] = "-"){
                            end = i
                            count = 1
                            break
                        }
                    }
                    if (count == 1 ) {
                        position = substr(string, 0, end-1)
                    }else{
                        position = get_position[index].data
                    }
                }
            }
            const content_complete = await Database.connection('db_reader')
                                            .select("c.id", "m.scormid")
                                            .from("scorm_scoes_track as m")
                                            .rightJoin("scorm as s", "s.id", "m.scormid")
                                            .rightJoin("course as c", "c.id", "s.course")
                                            .rightJoin("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                            .rightJoin("daa_courses as dc", "dc.id", "dcm.course_id")
                                            .rightJoin("daa_journeys as dj", "dj.id", "dc.journey_id")
                                            .whereNotIn("c.id", ids)
                                            .where("m.userid", authUser.id)
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
                                            .whereIn("m.value", ['passed','completed'])
                                            .where("m.element", "cmi.core.lesson_status")
                                            // .groupBy("c.id")
                                            // .groupBy("m.scromid")
            const total_content_complete = content_complete.length
            const module_enroll = await Database.connection('db_reader').select("id").from("scorm").whereIn("course", ids)
            let module_enroll_id = []
            if (module_enroll != 0) {
                for(let index in module_enroll){
                    module_enroll_id.push(module_enroll[index].id)
                }
            }
            const module_content = await Database.connection('db_reader')
                                            .select("sst.scormid")
                                            .from("scorm_scoes_track as sst")
                                            .join("scorm as s", "s.id", "sst.scormid")
                                            .join("course as c", "c.id", "s.course")
                                            .join("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                            .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                            .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                            .where("sst.userid", authUser.id)
                                            .whereNotIn("sst.scormid", module_enroll_id)
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
                                            .groupBy("sst.scormid")
            const total_module_content = module_content.length
            const value_completed = 100 * total_content_complete
            const value_not_completed = 50 * (total_module_content - total_content_complete)
            let total_progress_content = 0
            if(total_module_content != 0){
                total_progress_content = Math.round((value_completed+value_not_completed)/total_module_content)
            }

            let content_library_data = []
            var element_library = {}
            element_library.total_module = total_module_content
            element_library.total_module_completed = total_content_complete
            element_library.progress = total_progress_content
            content_library_data.push(element_library)

            var element = {}
            element.firstname = get_profile[0].firstname
            element.lastname = get_profile[0].lastname
            element.picture = get_profile[0].daa_picture
            element.position = position
            element.total_module = total_module
            element.total_module_completed = total
            element.progress = progress
            element.content_library = content_library_data
            element.is_supervisor = is_supervisor
            data.push(element)
            return response.send({status: 200, message: "Ok", data: element})
        }
    }
}

module.exports = DashboardController
