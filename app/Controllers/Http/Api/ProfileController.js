'use strict'

const Database = use('Database')
const Env = use('Env')
const User = use('App/Models/User')


// const HttpContextContract = use('@ioc:Adonis/Core/HttpContext')

class ProfileController {
    //Get Profile User Data
    index = async ({response, auth}) => {
        const authUser = auth.user.toJSON()
        let field = []
        const get_field = await Database.connection('db_reader').from("config_plugins").select("name", "value").where("plugin", "auth_manual")
        if (get_field != 0) {
            let exclude_fields = [
                'expiration',
                'expiration_warning',
                'expirationtime',
                'field_lock_alternatename',
                'field_lock_description',
                'field_lock_firstnamephonetic',
                'field_lock_idnumber',
                'field_lock_lang',
                'field_lock_lastnamephonetic',
                'field_lock_middlename',
                'field_lock_url',
                'version'
            ]
            for(let index in get_field){
                if (get_field.includes(exclude_fields) && get_field[index].value != "locked") {
                    column = get_field[index].name.replace('field_lock_', '')
                    if (get_field[index].value == 'unlocked' || (get_field[index].value == "unlockedifempty" )) {
                        field.push(column)
                    }
                }
            }
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
            var element = {}
            element.id = authUser.id
            element.fristname = get_profile[0].fristname
            element.lastname = get_profile[0].lastname
            element.picture = get_profile[0].daa_picture
            element.position = position
            element.is_supervisor = is_supervisor
            element.field = field

            data.push(element)
            return response.send({status: 200, message: "Ok", data: data})
        }
    }
    //Get Profile User By User Id
    view = async ({response, auth, params}) => {
        const authUser = auth.user.toJSON()
        const user_data = await Database.connection('db_reader').select("*").from("user").where("id", params.id)
        let data = []

        if (user_data != 0) {
            let picture
            let firstname
            let lastname
            let email
            let location
            let is_friend
            let directorate
            let subdirectorate

            if (user_data[0].daa_picture) {
                const url = Env.get('APP_URL')+'/tmp/uploads/'+user_data[0].id+'/profile_pic/'
                picture = url+user_data[0].daa_picture
            }else{
                picture = ""
            }

            if (user_data[0].firstname) {
                firstname = user_data[0].firstname
            }else{
                firstname = ""
            }
            if (user_data[0].lastname) {
                lastname = user_data[0].lastname
            }else{
                lastname = ""
            }
            if (user_data[0].email) {
                email = user_data[0].email
            }else{
                email = ""
            }
            if (user_data[0].city) {
                location = user_data[0].city
            }else{
                location = ""
            }

            is_friend = user_data[0].is_friend

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

            const get_directorate_query = await Database.connection('db_reader')
                                                    .select("uid.userid", "uid.data")
                                                    .from("user_info_field as uif")
                                                    .join("user_info_data as uid", "uif.id", "uid.fieldid")
                                                    .where("uif.id", 11)
                                                    .where("uid.userid", params.id)
            if(get_directorate_query != 0){
                directorate = get_directorate_query[0].data
            }

            const get_subdirectorate_query = await Database.connection('db_reader')
                                                        .select("uid.userid", "uid.data")
                                                        .from("user_info_field as uif")
                                                        .join("user_info_data as uid", "uif.id", "uid.fieldid")
                                                        .where("uif.id", 2)
                                                        .where("uid.userid", params.id)
            if(get_subdirectorate_query != 0){
                subdirectorate = get_subdirectorate_query[0].data
            }
            
            var element = {}
            element.id = params.id
            element.firstname = firstname
            element.lastname = lastname
            element.picture = picture
            element.position = position
            element.email = email
            element.directorate = directorate
            element.subdirectorate = subdirectorate
            element.location = location
            element.is_friend = is_friend
            data.push(element)
        }
        return response.send({status: 200, message: "Ok", data: element})

    }
    //Get User Profile Achievement Data
    achievement = async ({response, auth}) => {
        let limit = 6
        const authUser = auth.user.toJSON()

        const get_achivement_query = await Database.connection('db_reader')
                                                .select("db.name", "db.logo")
                                                .from("daa_badge_users as dbu")
                                                .join("daa_badges as db", "db.id", "dbu.daa_badge_id")
                                                .where("userid", authUser.id)
                                                .limit(limit)
        if (get_achivement_query != 0) {
            for(let index in get_achivement_query){
                if (get_achivement_query[index].logo) {
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    get_achivement_query[index].logo = url+get_achivement_query[index].logo
                }else{
                    get_achivement_query[index].logo = ""
                }
            }
            return response.send({status: 200, message: "Ok", data: get_achivement_query})

            
        }

    }
    //Get User Profile Progress Data
    progress = async ({response, auth, params}) => {
        const authUser = auth.user.toJSON()
        //module
        const module = await Database.connection('db_reader')
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
                                .groupBy("c.id")
        let total_module = module.length
        let ids =[]
        if (module != 0) {
            for(let index in module){
                ids.push(module[index].id)
            }
        }
        const module_completed = await Database.connection('db_reader')
                                            .select("module_id")
                                            .from("daa_module_logs")
                                            .where("user_id", authUser.id)
                                            .where("is_completed", 1)
                                            .whereIn("module_id", ids)
        let total_module_completed = module_completed.length
        let progress = 0
        if (total_module_completed == 0 || total_module == 0) {
            progress = 0
        }else{
            progress = Math.round((total_module_completed/total_module)*100)
        }

        //course
        const course = await Database.connection('db_reader')
                                .select("dc.id")
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
                                .groupBy("dc.id")
        let total_course = course.length
        let flag = 0
        let id_course = []
        if (course !=0) {
            for(let index in course){
                const get_tot_module = await Database.connection('db_reader')
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
                                            .where("dc.id", course[index].id)
                                            .where("u.id", authUser.id)
                                            .groupBy("c.id")
                let tot_module = get_tot_module.length
                for(let index in get_tot_module){
                    id_course.push(get_tot_module[index],id)
                }
                const module_completion = await Database.connection('db_reader')
                                                    .select("module_id")
                                                    .from("daa_module_logs")
                                                    .where("user_id", authUser.id)
                                                    .whereIn("module_id", id_course)
                let tot_module_completed = module_completion.length
                if (tot_module == tot_module_completed) {
                    flag++
                }
            }
        }else{
            let course_id = 0
        }
        let progress_course = 0
        if(flag == 0 || total_course == 0){
            progress_course = 0
        }else{
            progress_course = Math.round((flag/total_course)*100)
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

        let data = []
        var element = {}
        element.total_module = total_module
        element.total_module_completed = total_module_completed
        element.progress_module = progress
        element.total_course = total_course
        element.total_course_completed = flag
        element.progress_course = progress_course
        element.content_library = element_library
        data.push(element)
        return response.send({status: 200, message: "Ok", data: element})

    }
}

module.exports = ProfileController
