'use strict'

const Database = use('Database')
const Env = use('Env')
const DaaJourney = use('App/Models/DaaJourney')
const DaaCourse = use('App/Models/DaaCourse')
const { validate } = use('Validator')

class JourneyController {
    //Get Journey Data
    index = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        let data = []
        var element = {}
        const get_journey = await Database.connection('db_reader')
                                        .select("daa_journeys.id", "daa_journeys.name", "daa_journeys.description", "daa_journeys.thumbnail","daa_journeys.is_leaderboard","daa_journeys.is_reward","daa_journeys.end_date")
                                        .from("daa_journeys")
                                        .join("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                        .join("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                        .where("cohort_members.userid", user_id)
                                        .where("daa_journeys.visible", 1)
                                        .groupBy("daa_journeys.id")
                                        .orderBy("daa_journeys.sort")
        for(let index in get_journey){
            if(get_journey[index].thumbnail){
                const url = Env.get('APP_URL')+'/uploads/assets/images/'
                get_journey[index].thumbnail = url+get_journey[index].thumbnail
                const get_jc = await Database.connection('db_reader')
                                            .select("resid")
                                            .from("daa_restrict")
                                            .where("acttype", 1)
                                            .where("actid", get_journey[index].id)
                let is_open = 0
                for(let index in get_jc){
                    const check_journey = await Database.connection('db_reader')
                                                    .select("dcm.module_id")
                                                    .from("daa_course_modules as dcm")
                                                    .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                                    .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                                    .where("dj.visible", 1)
                                                    .where("dc.visible", 1)
                                                    .where("dj.id", get_jc[index].resid)
                                                    .groupBy("dcm.module_id")
                    let module_id = []
                    if(check_journey !== 0){
                        for(let index in check_journey){
                            module_id.push(check_journey[index].module_id)
                        }
                        const total_module = check_journey.length
                        const module_complete = await Database.connection('db_reader')
                                                            .distinct("module_id")
                                                            .from("daa_module_logs")
                                                            .where("user_id", user_id)
                                                            .whereIn("module_id", module_id)
                        const total_module_complete = module_complete.length
                        if(total_module == total_module_complete){
                            is_open = 1
                        }
                    }
                }
                element.thumbnail = get_journey[index].thumbnail
                element.is_open = is_open
            }
            //get module
            const get_module_query = await Database.connection('db_reader')
                                                .select("c.id")
                                                .from("user as u")
                                                .join("cohort_members as cm", "u.id", "cm.userid")
                                                .join("cohort as ch", "cm.cohortid", "ch.id")
                                                .join("daa_journey_cohort_enrols as djce", "ch.id", "djce.cohort_id")
                                                .join("daa_journeys as dj", "djce.journey_id", "dj.id")
                                                .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                                .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                                .join("course as c", "dcm.module_id", "c.id")
                                                .where("u.id", user_id)
                                                .where("dj.id", get_journey[index].id)
                                                .where("dj.visible", 1)
                                                .where("c.visible", 1)
                                                .where("dc.visible", 1)
                                                .where("c.module_type", 1)
                                                .groupBy("c.id")
            let total_module_enroll = get_module_query.length
            let module_id_enroll = []
            for(let index in get_module_query){
                module_id_enroll.push(get_module_query[index].id)
            }
            const get_module_completed_query = await Database.connection('db_reader')
                                                            .distinct("module_id")
                                                            .from("daa_module_logs")
                                                            .where("user_id", user_id)
                                                            .where("is_completed", 1)
                                                            .whereIn("module_id", module_id_enroll)
            let total_module_completed = get_module_completed_query.length
            if(total_module_enroll == 0){
                element.is_completed = 0
            }else if(total_module_enroll == total_module_completed){
                element.is_completed = 1
            }else{
                element.is_completed = 0
            }
            //Get Module Id From Journey
            const get_module_id_query = await Database.connection('db_reader')
                                                    .select("dcm.module_id")
                                                    .from("daa_journeys as dj")
                                                    .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                                    .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                                    .where("dj.id", get_journey[index].id)
            let mod_id = []
            for(let index in get_module_id_query){
                mod_id.push(get_module_id_query[index].module_id)
            }
            //Get PrPoint
            const get_module_points_query = await Database.connection('db_reader')
                                                        .sum("dup.point as total")
                                                        .from("daa_user_point as dup")
                                                        .whereIn("dup.module_id", mod_id)
                                                        .where("dup.user_id", user_id)
            let total_module_point = 0
            for(let index in get_module_points_query){
                if(get_module_points_query[index].total != null){
                    total_module_point = get_module_points_query[index].total
                }
            }
            //Get Badge Point
            const get_badge_points = await Database.connection('db_reader')
                                                .sum("dbpc.point as total")
                                                .from("daa_badge_point_claim as dbpc")
                                                .join("daa_badges as db", "dbpc.badge_id", "db.id")
                                                .where("dbpc.user_id", user_id)
                                                .where("db.daa_journey_id", get_journey[index].id)
            let total_badge_point = 0
            for(let index in get_badge_points){
                if(get_badge_points[index].total != null){
                    total_badge_point = get_badge_points[index].total
                }
            }
            //Get History Point
            const get_history_points = await Database.connection('db_reader')
                                                    .sum("drh.point as total")
                                                    .from("daa_reward_history as drh")
                                                    .where("drh.user_id", user_id)
                                                    .where("drh.journey_id", get_journey[index].id)
                                                    .whereIn("drh.redeem_status", [0, 1])
            let total_history_point = 0
            for(let index in get_history_points){
                if(get_history_points[index].total != null){
                    total_history_point = get_history_points[index].total
                }
            }
            let current_point = (total_module_point + total_badge_point) - total_history_point
            if(current_point > 0){
                current_point = 0
            }
            //Date
            if(get_journey[index].end_date != null){
                const date_now = new Date()
                const diff_time = Math.abs(date_now - get_journey[index].end_date);
                const diff_day = Math.floor(diff_time / (1000 * 60 * 60 * 24))
                const diff_hour =  Math.floor(diff_time / (1000 * 60 * 60))
                if(date_now > get_journey[index].end_date){
                    element.end_date = "Expired"
                    element.remaining_date = 0
                }else{
                    if(diff_day <= 7 && diff_day != 0){
                        element.end_date = diff_day+" Days left!"
                        element.remaining_date = diff_day
                    }else if(diff_day == 0){
                        element.end_date = diff_hour+" Hours left!"
                        element.remaining_date = diff_day
                    }else{
                        const month = [
                            "Jan", 
                            "Feb", 
                            "Mar", 
                            "Apr", 
                            "May", 
                            "Jun", 
                            "Jul", 
                            "Aug", 
                            "Sep", 
                            "Oct", 
                            "Nov", 
                            "Dev"
                        ]
                        element.end_date = get_journey[index].end_date.getDate()+" "+month[get_journey[index].end_date.getMonth()+1]+" "+get_journey[index].end_date.getFullYear()
                        element.remaining_date = get_journey[index].end_date.getDate()
                    }
                }
                if(date_now > get_journey[index].end_date){
                    element.is_available = 0
                }else{
                    element.is_available = 1
                }
            }else{
                element.end_date = ""
                element.is_available = 1
            }
            element.id = get_journey[index].id
            element.name = get_journey[index].name
            element.description = get_journey[index].description
            element.is_leaderboard = get_journey[index].is_leaderboard
            element.is_reward = get_journey[index].is_reward
            element.end_date = get_journey[index].end_date
            element.point = current_point

            data.push(element)
        }
        let response_data = {
            journeys: data,
            total: get_journey.length
        }
        return response.send({status: 200, message: "Ok", data: response_data})
    }
    //Get Participant Data
    participant = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const page = params.page
        const id = params.id
        if(page != null){
            const limit = 20
            const offset = page*limit
            //Get User Data
            const get_user = await Database.connection('db_reader')
                                        .from("daa_journeys")
                                        .select("user.id", "user.firstname", "user.lastname", "user.email", "user.picture", "user.daa_picture")
                                        .join("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                        .join("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                        .join("user", "user.id", "cohort_members.userid")
                                        .where("daa_journey_cohort_enrols.journey_id", id) 
                                        .where("user.deleted", 0)
                                        .where("user.suspended", 0)
                                        .groupBy("user.id")
                                        .orderBy("user.firstname")
                                        .orderBy("user.lastname")
                                        .offset(offset)
                                        .limit(limit)
            if(get_user != 0){
                for(let index in get_user){
                    if(get_user[index].daa_picture != 0){
                        //Get Picture Data
                        const url = Env.get('APP_URL')+'/tmp/uploads/'+get_user[index].id+'/profile_pic/'
                        get_user[index].picture = url+get_user[index].daa_picture
                    }else{
                        get_user[index].picture = ""
                    }
                    //Get Position
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
                    get_user[index].position = position
                }
            }
            let data = {
                users: get_user,
                total: get_user.length
            }
            return response.send({status: 200, message: "Ok", data: data})
        }else{
            //Get User Data
            const get_user = await Database.connection('db_reader')
                                        .from("daa_journeys")
                                        .select("user.id", "user.firstname", "user.lastname", "user.email", "user.picture", "user.daa_picture")
                                        .join("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                        .join("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                        .join("user", "user.id", "cohort_members.userid")
                                        .where("daa_journey_cohort_enrols.journey_id", id) 
                                        .where("user.deleted", 0)
                                        .where("user.suspended", 0)
                                        .groupBy("user.id")
                                        .orderBy("user.firstname")
                                        .orderBy("user.lastname")
            if(get_user != 0){
                for(let index in get_user){
                    if(get_user[index].daa_picture != 0){
                        //Get Picture Data
                        const url = Env.get('APP_URL')+'/tmp/uploads/'+get_user[index].id+'/profile_pic/'
                        get_user[index].picture = url+get_user[index].daa_picture
                    }else{
                        get_user[index].picture = ""
                    }
                    //Get Position
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
                    get_user[index].position = position
                }
            }
            let data = {
                users: get_user,
                total: get_user.length
            }
            return response.send({status: 200, message: "Ok", data: data})
        }
    }
    //Get Course Data
    course = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const id = params.id
        let data_course = []
        let is_placement_test = 0
        let point = 0
        let is_completed = 0
        let is_competent = 0
        let total_module = 0
        let total_completed = 0
        let progress = 0
        let is_competency = 0

        const journey = await Database.connection('db_reader').select("*").from("daa_journeys").where("id", id)
        const course = await Database.connection('db_reader').select("daa_courses.*").from("daa_journeys").leftJoin("daa_courses", "daa_courses.journey_id", "daa_journeys.id").where("daa_journeys.id", id)
        for(let index in course){
            let course_id = course[index].id
            const get_course_competency = await Database.connection('db_reader')
                                                    .select("dptd.status")
                                                    .from("daa_placement_test_result as dptr")
                                                    .join("daa_placement_test_detail as dptd", "dptr.id", "dptd.placement_test_id")
                                                    .where("dptr.user_id", user_id)
                                                    .where("dptr.journey_id", id)
                                                    .where("dptr.is_submit", 1)
                                                    .where("dptr.type", "course")
                                                    .where("dptd.type_id", course_id)
            if(get_course_competency != 0){
                for(let index in get_course_competency){
                    is_competency = get_course_competency[index].status
                }
                if(is_competency == 1){
                    const get_total_module = await Database.connection('db_reader')
                                                        .count("* as total")
                                                        .from("daa_course_modules as dcm")
                                                        .join("course as c", "c.id", "dcm.module_id")
                                                        .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                                        .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                                        .where("dj.visible", 1)
                                                        .where("c.visible", 1)
                                                        .where("dj.id", id)
                                                        .where("dc.id", course_id)
                                                        .where("c.module_type", 1)
                    for(let index in get_total_module){
                        total_module = get_total_module[index].total
                    }
                    const get_module_id = await Database.connection('db_reader')
                                                    .select("dcm.module_id")
                                                    .from("daa_course_modules as dcm")
                                                    .join("course as c", "c.id", "dcm.module_id")
                                                    .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                                    .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                                    .where("dj.visible", 1)
                                                    .where("c.visible", 1)
                                                    .where("dj.id", id)
                                                    .where("dc.id", course_id)
                                                    .where("c.module_type", 1)
                    let module_id = []
                    for(let index in get_module_id){
                        module_id.push(get_module_id[index].module_id)
                    }
                    const get_total_competent = await Database.connection('db_reader')
                                                            .countDistinct("module_id as total_competen")
                                                            .from("daa_module_logs")
                                                            .where("user_id", user_id)
                                                            .whereIn("module_id", module_id)
                                                            .where("is_competent", 1)
                    for(let index in get_total_competent){
                        total_competen = get_total_competent[index].total_competen
                    }
                    const get_dcm_module_id = await Database.connection('db_reader')
                                                        .select("dcm.module_id")
                                                        .from("daa_course_modules as dcm")
                                                        .join("course as c", "c.id", "dcm.module_id")
                                                        .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                                        .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                                        .where("dj.visible", 1)
                                                        .where("c.visible", 1)
                                                        .where("dj.id", id)
                                                        .where("dc.id", course_id)
                                                        .where("c.module_type", 1)
                    let dcm_module_id = []
                    for(let index in get_dcm_module_id){
                        dcm_module_id.push(get_dcm_module_id[index].module_id)
                    }
                    const get_total_completed = await Database.connection('db_reader')
                                                            .countDistinct("module_id as total_completed")
                                                            .from("daa_module_logs")
                                                            .where("user_id", id)
                                                            .whereIn("module_id", dcm_module_id)
                                                            .where("is_completed", 1)
                    for(let index in get_total_completed){
                        total_completed = get_total_completed[index].total_completed
                    }
                    if(total_competen != total_completed){
                        is_completed = 0
                    }else{
                        is_completed = 1
                    }
                }else{
                    const get_module = await Database.connection('db_reader')
                                                .count("* as total_module")
                                                .from("daa_course_modules as dcm")
                                                .join("course as c", "c.id", "dcm.module_id")
                                                .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                                .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                                .where("dj.visible", 1)
                                                .where("c.visible", 1)
                                                .where("dj.id", id)
                                                .where("dc.id", course_id)
                                                .where("c.module_type", 1)
                    for(let index in get_module){
                        total_module = get_module[index].total_module
                    }
                    const get_dcm_module_id = await Database.connection('db_reader')
                                                        .select("dcm.module_id")
                                                        .from("daa_course_modules as dcm")
                                                        .join("course as c", "c.id", "dcm.module_id")
                                                        .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                                        .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                                        .where("dj.visible", 1)
                                                        .where("c.visible", 1)
                                                        .where("dj.id", id)
                                                        .where("dc.id", course_id)
                                                        .where("c.module_type", 1)
                    let dcm_module_id = []
                    for(let index in get_dcm_module_id){
                        dcm_module_id.push(get_dcm_module_id[index].module_id)
                    }
                    const get_total_completed = await Database.connection('db_reader')
                                                            .countDistinct("module_id as total_completed")
                                                            .from("daa_module_logs")
                                                            .where("user_id", id)
                                                            .whereIn("module_id", dcm_module_id)
                                                            .where("user_id", user_id)
                                                            .where("is_completed", 1)
                    for(let index in get_total_completed){
                        total_completed = get_total_completed[index].total_completed
                    }
                    if(total_completed == 0 || total_module == 0){
                        progress = 0
                    }else{
                        progress = Math.round((total_completed/total_module)*100)
                    }
                    if(total_module == 0){
                        is_completed = 0
                    }else if(total_module != total_completed){
                        is_completed = 0
                    }else{
                        is_completed = 1
                    }
                }
            }else{
                const get_module = await Database.connection('db_reader')
                                            .count("* as total_module")
                                            .from("daa_course_modules as dcm")
                                            .join("course as c", "c.id", "dcm.module_id")
                                            .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                            .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dj.id", id)
                                            .where("dc.id", course_id)
                                            .where("c.module_type", 1)
                for(let index in get_module){
                    total_module = get_module[index].total_module
                }
                const get_dcm_module_id = await Database.connection('db_reader')
                                                    .select("dcm.module_id")
                                                    .from("daa_course_modules as dcm")
                                                    .join("course as c", "c.id", "dcm.module_id")
                                                    .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                                    .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                                    .where("dj.visible", 1)
                                                    .where("c.visible", 1)
                                                    .where("dj.id", id)
                                                    .where("dc.id", course_id)
                                                    .where("c.module_type", 1)
                let dcm_module_id = []
                for(let index in get_dcm_module_id){
                    dcm_module_id.push(get_dcm_module_id[index].module_id)
                }
                const get_total_completed = await Database.connection('db_reader')
                                                        .countDistinct("module_id as total_completed")
                                                        .from("daa_module_logs")
                                                        .where("user_id", id)
                                                        .whereIn("module_id", dcm_module_id)
                                                        .where("user_id", user_id)
                                                        .where("is_completed", 1)
                for(let index in get_total_completed){
                    total_completed = get_total_completed[index].total_completed
                }
                if(total_completed == 0 || total_module == 0){
                    progress = 0
                }else{
                    progress = Math.round((total_completed/total_module)*100)
                }
                if(total_module == 0){
                    is_completed = 0
                }else if(total_module != total_completed){
                    is_completed = 0
                }else{
                    is_completed = 1
                }
            }
            var element_course = {}
            element_course.id = course_id
            element_course.name = course[index].name
            element_course.description = course[index].description
            element_course.thumbnail = course[index].thumbnail
            element_course.is_completed = is_completed
            element_course.is_competent = is_competent
            element_course.total_module = total_module
            element_course.total_completed = total_completed
            element_course.progress = progress
            data_course.push(element_course)
        }
        const get_placement_test = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                            .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                            .join("course as c", "c.id", "dcm.module_id")
                                            .where("dj.id", id)
                                            .where("is_placement_test", 1)
        if(get_placement_test != 0){
            is_placement_test = 1
        }else{
            is_placement_test = 0
        }
        //Get Module Id From Journey
        const get_module_id_query = await Database.connection('db_reader')
                                                .select("dcm.module_id")
                                                .from("daa_journeys as dj")
                                                .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                                .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                                .where("dj.id", id)
        let mod_id = []
        for(let index in get_module_id_query){
            mod_id.push(get_module_id_query[index].module_id)
        }
        //Get PrPoint
        const get_module_points_query = await Database.connection('db_reader')
                                                    .sum("dup.point as total")
                                                    .from("daa_user_point as dup")
                                                    .whereIn("dup.module_id", mod_id)
                                                    .where("dup.user_id", user_id)
        let total_module_point = 0
        for(let index in get_module_points_query){
            if(get_module_points_query[index].total != null){
                total_module_point = get_module_points_query[index].total
            }
        }
        //Get Badge Point
        const get_badge_points = await Database.connection('db_reader')
                                            .sum("dbpc.point as total")
                                            .from("daa_badge_point_claim as dbpc")
                                            .join("daa_badges as db", "dbpc.badge_id", "db.id")
                                            .where("dbpc.user_id", user_id)
                                            .where("db.daa_journey_id", id)
        let total_badge_point = 0
        for(let index in get_badge_points){
            if(get_badge_points[index].total != null){
                total_badge_point = get_badge_points[index].total
            }
        }
        //Get History Point
        const get_history_points = await Database.connection('db_reader')
                                                .sum("drh.point as total")
                                                .from("daa_reward_history as drh")
                                                .where("drh.user_id", user_id)
                                                .where("drh.journey_id", id)
                                                .whereIn("drh.redeem_status", [0, 1])
        let total_history_point = 0
        for(let index in get_history_points){
            if(get_history_points[index].total != null){
                total_history_point = get_history_points[index].total
            }
        }
        let current_point = (total_module_point + total_badge_point) - total_history_point
        if(current_point > 0){
            current_point = 0
        }
        for(let index in journey){
            if(journey[index].end_date == null){
                journey[index].end_date = ""
            }
            if(journey[index].thumbnail != null){
                const url = Env.get('APP_URL')+'/uploads/assets/images/'
                journey[index].thumbnail = url+journey[index].thumbnail
            }
            var element = {}
            element.id = journey[index].id
            element.name = journey[index].name
            element.description = journey[index].description
            element.thumbnail = journey[index].thumbnail
            element.is_leaderboard = journey[index].is_leaderboard
            element.is_reward = journey[index].is_reward
            element.end_date = journey[index].end_date
            element.is_simulator = journey[index].is_simulator
            element.course = data_course
            element.is_placement_test = is_placement_test
            element.point = current_point
        }
        return response.send({status: 200, message: "Ok", data: element})
    }
    //Get Module
    module = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const journey_id = params.id
        const course_id = params.course_id
        const journey = await Database.connection('db_reader').select("*").from("daa_journeys").where("id", journey_id)
        const course = await Database.connection('db_reader').select("daa_courses.*").from("daa_journeys").leftJoin("daa_courses", "daa_courses.journey_id", "daa_journeys.id").where("daa_courses.id", course_id)
        var data = {}

        const modules_support = await Database.connection('db_reader')
                                            .count("* as total")
                                            .from("course as c")
                                            .join("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                            .where("dcm.course_id", course_id)
                                            .where("c.visible", 1)
                                            .where("c.module_type", 2)
        let total_module_support = 0
        for(let index in modules_support){
            total_module_support = modules_support[index].total
        }
        var element = {}
        element.total_module_support = total_module_support
        if(course != 0){
            let modules = []
            let message = ""
            const module_query = await Database.connection('db_reader')
                                            .distinct("course.id")
                                            .select("course.id AS cid", "course.fullname", "course.summary", "course_format_options.value AS type", "course.scorm_file", "course.attempt AS attempt_limit", "course.module_type", "course.module_category as cat", "course.has_rating", "course.trailer", "course.description", "course.startdate", "course.enddate", "course.idnumber", "cm.id as cmid")
                                            .from("daa_course_modules")
                                            .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                            .innerJoin("course_format_options", "course_format_options.courseid","course.id")
                                            .innerJoin("course_modules as cm", "cm.course", "course.id")
                                            .where("daa_course_modules.course_id", course_id)
                                            .where("course.visible", 1)
                                            .where("course.module_type", 1)
                                            .groupBy("cid")
                                            .orderBy("course.summary", "ASC")
            for(let index in module_query){
                const get_restrict_query = await Database.connection('db_reader')
                                                .count("dr.id as total")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                let total_restrict = 0
                for(let index in get_restrict_query){
                    total_restrict = get_restrict_query[index].total
                }
                const query_restrict = await Database.connection('db_reader')
                                                .select("dr.resid")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                let restrict_id = []
                for(let index in query_restrict){
                    restrict_id.push(query_restrict[index].resid)
                }
                const get_scorm_query = await Database.connection('db_reader')
                                                    .countDistinct("st.scormid as total")
                                                    .from("scorm as s")
                                                    .join("scorm_scoes_track as st", "st.scormid", "s.id")
                                                    .whereIn("s.course", restrict_id)
                                                    .where("st.userid", user_id)
                                                    .where("st.element", "cmi.core.lesson_status")
                                                    .where("st.value", "passed")
                                                    .orWhere("st.value", "completed")
                let total_scorm = 0
                for(let index in get_scorm_query){
                    total_scorm = get_scorm_query[index].total
                }
                let is_open = 0
                if(total_restrict == total_scorm){
                    is_open = 1
                }
                const month = [
                    "Jan", 
                    "Feb", 
                    "Mar", 
                    "Apr", 
                    "May", 
                    "Jun", 
                    "Jul", 
                    "Aug", 
                    "Sep", 
                    "Oct", 
                    "Nov", 
                    "Dev"
                ]
                const current_date = new Date()
                let start_date = ""
                let end_date = ""
                if(module_query[index].startdate != null){
                    start_date = module_query[index].startdate.getFullYear()+"-"+month[module_query[index].startdate.getMonth()+1]+"-"+module_query[index].startdate.getDate()

                }
                if(module_query[index].enddate != null){
                    end_date = module_query[index].enddate.getFullYear()+"-"+month[module_query[index].enddate.getMonth()+1]+"-"+module_query[index].enddate.getDate()
                }
                if(module_query[index].description == null){
                    module_query[index].description = ""
                }
                let category_name = ""
                if(module_query[index].cat != null){
                    const get_category = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("daa_module_category")
                                                    .where("id", module_query[index].cat)
                    for(let index in get_category){
                        category_name = get_category[index].name
                    }
                }
                const get_daa_restrict = await Database.connection('db_reader')
                                                    .select("daa_restrict.id", "daa_restrict.acttype", "daa_restrict.actid", "daa_restrict.resid", "course.fullname AS module_name")
                                                    .from("daa_restrict")
                                                    .innerJoin("daa_course_modules", "daa_course_modules.id", "daa_restrict.actid")
                                                    .innerJoin("course", "course.id", "daa_restrict.resid")
                                                    .where("daa_course_modules.module_id", module_query[index].id)
                                                    .where("acttype", 3)
                let restrict_name = []
                if(get_daa_restrict != 0){
                    for(let index in get_daa_restrict){
                        restrict_name.push(get_daa_restrict[index].module_name)
                    }
                }
                //Get Thumbnails File
                const file = await Database.connection('db_reader')
                                        .select("files.contextid", "files.filename")
                                        .from("files")
                                        .join("context", "context.id", "files.contextid")
                                        .where("files.component", "course")
                                        .where("files.filearea", "overviewfiles")
                                        .where("context.contextlevel", 50)
                                        .where("context.instanceid", module_query[index].id)
                                        .limit(1)
                let thumbnail = ""
                if(file != 0){
                    for(let index in file){
                        const url = Env.get('APP_URL')+'/uploads/file/'
                        thumbnail = url+file[index].filename
                    }
                }
                //Get moodle SCORM data
                const get_sco_data = await Database.connection('db_reader')
                                                .select('scorm.id AS scorm_id', 'scorm_scoes.id AS sco_id', 'scorm.reference')
                                                .from("scorm")
                                                .join('scorm_scoes', 'scorm_scoes.scorm', '=', 'scorm.id')
                                                .where("scorm.course", module_query[index].id)
                                                .whereNot("scorm_scoes.parent", "/")
                                                .limit(1)
                let scorm_id = 0
                let sco_id = 0
                let reference = ""
                if(get_sco_data != 0){
                    for(let index in get_sco_data){
                        scorm_id = get_sco_data[index].scorm_id
                        sco_id = get_sco_data[index].sco_id
                        reference = get_sco_data[index].reference
                    }
                }
                //Get Completed or Incomplete
                const lesson_data = await Database.connection('db_reader')
                                                .select("daa_module_logs.id")
                                                .from("daa_module_logs")
                                                .where("daa_module_logs.user_id", user_id)
                                                .where("daa_module_logs.module_id", module_query[index].id)
                                                .where("daa_module_logs.is_completed", 1)
                                                .limit(1)
                const is_complete = 0
                if(lesson_data != 0){
                    is_complete = 1
                }
                const total_attempt = 0
                //Get Completed or Incomplete
                if(scorm_id != 0){
                    const attempt_data = await Database.connection('db_reader')
                                                    .select("scorm_scoes_track.id AS track_id", "scorm_scoes_track.attempt", "scorm_scoes_track.value")
                                                    .from("scorm_scoes_track")
                                                    .where("scorm_scoes_track.userid", user_id)
                                                    .where("scorm_scoes_track.scormid", scorm_id)
                                                    .where("scorm_scoes_track.scoid", sco_id)
                                                    .orderBy("scorm_scoes_track.attempt", "DESC")
                                                    .limit(1)
                    if(attempt_data != 0){
                        for(let index in attempt_data){
                            if(attempt_data[index].value == "incomplete"){
                                total_attempt = attempt_data[index].attempt-1
                            }else{
                                total_attempt = attempt_data[index].attempt
                            }
                        }
                    }
                }
                const scorm_name = reference.replace(".zip", "")
                //get module competent
                const lesson_data_query = await Database.connection('db_reader')
                                                    .select("daa_module_logs.id")
                                                    .from("daa_module_logs")
                                                    .where("daa_module_logs.user_id", user_id)
                                                    .where("daa_module_logs.module_id", module_query[index].id)
                                                    .where("daa_module_logs.is_competent", 1)
                                                    .limit(1)
                let is_competent = 0
                if(lesson_data_query != 0 ){
                    is_competent = 1
                }
                //check module is placement test
                const is_placement_test_query = await Database.connection('db_reader')
                                                    .select("course.id")
                                                    .from("course")
                                                    .where("course.id", module_query[index].id)
                                                    .where("course.is_placement_test", 1)
                                                    .limit(1)
                let is_placement_test = 0
                let is_placement_test_submitted = 0
                if(is_placement_test_query != 0){
                    is_placement_test = 1
                    
                    const is_submit_query = await Database.connection('db_reader')
                                                        .select("daa_placement_test_result.id")
                                                        .from("daa_placement_test_result")
                                                        .where("daa_placement_test_result.user_id", user_id)
                                                        .where("daa_placement_test_result.module_id", module_query[index].id)
                                                        .where("daa_placement_test_result.is_submit", 1)
                                                        .limit(1)
                    if(is_submit_query != 0){
                        is_placement_test_submitted = 1
                    }
                }else{
                    is_placement_test_submitted = 1
                }
                //Check module is unity or not
                const check_is_unity = await Database.connection('db_reader')
                                                .select("course.id")
                                                .from("course")
                                                .where("course.id", module_query[index].id)
                                                .where("course.unity", 1)
                                                .limit(1)
                let unity = 0
                if(check_is_unity != 0){
                    unity = 1
                }
                //Has Trailer
                let has_trailer = 0
                let trailer = ""
                if(module_query[index].trailer){
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    has_trailer = 1
                    trailer = url+module_query[index].trailer
                }
                //Get Journey, Course
                const get_jcm = await Database.connection('db_reader')
                                            .select("dj.id as journey_id", "dj.name as journey_name", "dc.id as course_id", "dc.name as course_name")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                            .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                            .join("course as c", "c.id", "dcm.module_id")
                                            .where("c.id", module_query[index].id)
                let journey_id = 0
                let journey_name = ""
                let course_id = 0
                let course_name = ""
                if(get_jcm !=0 ){
                    for(let index in get_jcm){
                        journey_id = get_jcm[index].journey_id
                        journey_name = get_jcm[index].journey_name
                        course_id = get_jcm[index].course_id
                        course_name = get_jcm[index].course_name
                    }
                }
                //Submit Rating
                const rating = await Database.connection('db_reader')
                                        .select("id")
                                        .from("daa_rating_module")
                                        .where("module_id", module_query[index].id)
                let has_submit_rating = 0
                if(rating.length > 0){
                    has_submit_rating = 1
                }
                var element_module = {}
                element_module.id = module_query[index].cid
                element_module.cid = module_query[index].cid
                element_module.fullname = module_query[index].fullname
                element_module.summary = module_query[index].summary
                element_module.type = module_query[index].type
                element_module.scorm_file = module_query[index].scorm_file
                element_module.attempt_limit = module_query[index].attempt_limit
                element_module.module_type = module_query[index].module_type
                element_module.cat = module_query[index].cat
                element_module.has_rating = module_query[index].has_rating
                element_module.trailer = module_query[index].trailer
                element_module.description = module_query[index].description
                element_module.currentdate = current_date
                element_module.startdate = start_date
                element_module.enddate = end_date
                element_module.idnumber = module_query[index].idnumber
                element_module.isopen = is_open
                element_module.cmid = module_query[index].cmid
                element_module.total_attempt = 0
                element_module.category = category_name
                element_module.restrict = restrict_name
                element_module.thumbnail = thumbnail
                element_module.scorm_id = scorm_id
                element_module.sco_id = sco_id
                element_module.reference = reference
                element_module.is_complete = is_complete
                element_module.scorm_name = scorm_name
                element_module.is_competent = is_competent
                element_module.is_placement_test = is_placement_test
                element_module.is_placement_test_submitted = is_placement_test_submitted
                element_module.unity = unity
                element_module.has_trailer = has_trailer
                element_module.trailer = trailer
                element_module.journey_id = journey_id
                element_module.journey_name = journey_name
                element_module.course_id = course_id
                element_module.course_name = course_name
                element_module.has_submit_rating = has_submit_rating 
                
                modules.push(element_module)
            }
            for(let index in course){
                const url = Env.get('APP_URL')+'/uploads/file/'
                element.id = course[index].id
                element.name = course[index].name
                element.description = course[index].description
                element.thumbnail = url+course[index].thumbnail                
            }
            let journey_array = []
            for(let index in journey){
                const url = Env.get('APP_URL')+'/uploads/file/'
                var element_journey = {}
                element_journey.id = journey[index].id
                element_journey.name = journey[index].name
                element_journey.description = journey[index].description
                element_journey.thumbnail = url+journey[index].thumbnail
                element_journey.is_leaderboard = journey[index].is_leaderboard
                element_journey.is_reward = journey[index].is_reward
                element_journey.end_date = journey[index].end_date
                element_journey.is_simulator = journey[index].is_simulator

                journey_array.push(element_journey)
            }
            element.modules = modules
            element.journey = journey_array
            if(module_query != 0){
                message = "Ok"
            }else{
                message = "Modules empty"
            }
            data.status = 200,
            data.message = message,
            data.data = element
        }else{
                data.status = 404,
                data.message = "Course not found",
                data.data = []
        }
        return response.send(data)

    }
    //Get Module View
    module_view = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const journey_id = params.id
        const course_id = params.course_id
        const module_id = params.module_id
        const journey_query = await Database.connection('db_reader')
                                        .select("*")
                                        .from("daa_journeys")
                                        .where("id", journey_id)
        const course_query = await Database.connection('db_reader')
                                        .select("*")
                                        .from("daa_courses")
                                        .where("journey_id", journey_id)
                                        .where("id", course_id)
        const module_query = await Database.connection('db_reader')
                                        .select("course.id", "course.fullname", "course.summary", "course_format_options.value AS type")
                                        .from("course")
                                        .join("course_format_options", "course_format_options.courseid", "=", "course.id")
                                        .where("course.id", module_id)
                                        .where("course.visible", 1)
        const file_query = await Database.connection('db_reader')
                                        .select("files.contextid", "files.filename")
                                        .from("files")
                                        .join("context", "context.id", "files.contextid")
                                        .where("files.component", "course")
                                        .where("files.filearea", "overviewfiles")
                                        .where("context.contextlevel", 50)
                                        .where("context.instanceid", module_id)
        if(file_query != 0){
            const url = Env.get('APP_URL')+'/uploads/assets/file/'
            for(let index in module_query){
                for(let index in file_query){
                    module_query[index].thumbnail = url+file_query[index].filename
                }
            }
        }else{
            for(let index in module_query){
                module_query[index].thumbnail = ""
            }
        }
        for(let index in module_query){
            if(module_query[index].type == "quiz"){
                const quizzes = await Database.connection('db_reader')
                                            .select("question.id", "question.questiontext AS question", "question.qtype")
                                            .from("quiz_slots")
                                            .join("quiz", "quiz.id", "quiz_slots.quizid")
                                            .join("question", "question.id", "quiz_slots.questionid")
                                            .where("quiz.course", module_id)
                                            .where("question.hidden", 0)
                                            .orderBy("quiz_slots.slot")
                module_query[index].quiz = quizzes
                for(let index in quizzes){
                    let answers
                    if(quizzes[index].qtype == "match"){
                        answers = await Database.connection('db_reader')
                                            .select("id", "questiontext AS text", "answertext AS answer")
                                            .table("qtype_match_subquestions")
                                            .where("questiontext", "!=", "")
                                            .where("questionid", quizzes[index].id)
                                            // .inRandomOrder()
                    }else{
                        answers = await Database.connection('db_reader')
                                            .table("question_answers")
                                            .select("id", "answer")
                                            .where("question", quizzes[index].id)
                                            // .inRandomOrder()
                    }
                    quizzes[index].answers = answers
                }
            }
            module_query[index].course = course_query
            module_query[index].journey = journey_query
        }
        return response.send({status: 200, message: "Ok", data: module_query})
    }
    //Get Module Support
    module_support = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const journey_id = params.id
        const course_id = params.course_id
        const journey = await Database.connection('db_reader').select("*").from("daa_journeys").where("id", journey_id)
        const course = await Database.connection('db_reader').select("daa_courses.*").from("daa_journeys").leftJoin("daa_courses", "daa_courses.journey_id", "daa_journeys.id").where("daa_courses.id", course_id)
        if(course != 0){
            let modules = []
            let message = ""
            const module_query = await Database.connection('db_reader')
                                            .distinct("course.id")
                                            .select("course.id AS cid", "course.fullname", "course.summary", "course_format_options.value AS type", "course.scorm_file", "course.attempt AS attempt_limit", "course.module_type", "course.module_category as cat", "course.has_rating", "course.trailer", "course.description", "course.startdate", "course.enddate", "course.idnumber", "cm.id as cmid")
                                            .from("daa_course_modules")
                                            .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                            .innerJoin("course_format_options", "course_format_options.courseid","course.id")
                                            .innerJoin("course_modules as cm", "cm.course", "course.id")
                                            .where("daa_course_modules.course_id", course_id)
                                            .where("course.visible", 1)
                                            .where("course.module_type", 2)
                                            .groupBy("cid")
                                            .orderBy("course.summary", "ASC")
            for(let index in module_query){
                const get_restrict_query = await Database.connection('db_reader')
                                                .count("dr.id as total")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                let total_restrict = 0
                for(let index in get_restrict_query){
                    total_restrict = get_restrict_query[index].total
                }
                const query_restrict = await Database.connection('db_reader')
                                                .select("dr.resid")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                let restrict_id = []
                for(let index in query_restrict){
                    restrict_id.push(query_restrict[index].resid)
                }
                const get_scorm_query = await Database.connection('db_reader')
                                                    .countDistinct("st.scormid as total")
                                                    .from("scorm as s")
                                                    .join("scorm_scoes_track as st", "st.scormid", "s.id")
                                                    .whereIn("s.course", restrict_id)
                                                    .where("st.userid", user_id)
                                                    .where("st.element", "cmi.core.lesson_status")
                                                    .where("st.value", "passed")
                                                    .orWhere("st.value", "completed")
                let total_scorm = 0
                for(let index in get_scorm_query){
                    total_scorm = get_scorm_query[index].total
                }
                let is_open = 0
                if(total_restrict == total_scorm){
                    is_open = 1
                }
                const month = [
                    "Jan", 
                    "Feb", 
                    "Mar", 
                    "Apr", 
                    "May", 
                    "Jun", 
                    "Jul", 
                    "Aug", 
                    "Sep", 
                    "Oct", 
                    "Nov", 
                    "Dev"
                ]
                const current_date = new Date()
                let start_date = ""
                let end_date = ""
                if(module_query[index].startdate != null){
                    start_date = module_query[index].startdate.getFullYear()+"-"+month[module_query[index].startdate.getMonth()+1]+"-"+module_query[index].startdate.getDate()

                }
                if(module_query[index].enddate != null){
                    end_date = module_query[index].enddate.getFullYear()+"-"+month[module_query[index].enddate.getMonth()+1]+"-"+module_query[index].enddate.getDate()
                }
                if(module_query[index].description == null){
                    module_query[index].description = ""
                }
                let category_name = ""
                if(module_query[index].cat != null){
                    const get_category = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("daa_module_category")
                                                    .where("id", module_query[index].cat)
                    for(let index in get_category){
                        category_name = get_category[index].name
                    }
                }
                const get_daa_restrict = await Database.connection('db_reader')
                                                    .select("daa_restrict.id", "daa_restrict.acttype", "daa_restrict.actid", "daa_restrict.resid", "course.fullname AS module_name")
                                                    .from("daa_restrict")
                                                    .innerJoin("daa_course_modules", "daa_course_modules.id", "daa_restrict.actid")
                                                    .innerJoin("course", "course.id", "daa_restrict.resid")
                                                    .where("daa_course_modules.module_id", module_query[index].id)
                                                    .where("acttype", 3)
                let restrict_name = []
                if(get_daa_restrict != 0){
                    for(let index in get_daa_restrict){
                        restrict_name.push(get_daa_restrict[index].module_name)
                    }
                }
                //Get Thumbnails File
                const file = await Database.connection('db_reader')
                                        .select("files.contextid", "files.filename")
                                        .from("files")
                                        .join("context", "context.id", "files.contextid")
                                        .where("files.component", "course")
                                        .where("files.filearea", "overviewfiles")
                                        .where("context.contextlevel", 50)
                                        .where("context.instanceid", module_query[index].id)
                                        .limit(1)
                let thumbnail = ""
                if(file != 0){
                    for(let index in file){
                        const url = Env.get('APP_URL')+'/uploads/file/'
                        thumbnail = url+file[index].filename
                    }
                }
                //Get moodle SCORM data
                const get_sco_data = await Database.connection('db_reader')
                                                .select('scorm.id AS scorm_id', 'scorm_scoes.id AS sco_id', 'scorm.reference')
                                                .from("scorm")
                                                .join('scorm_scoes', 'scorm_scoes.scorm', '=', 'scorm.id')
                                                .where("scorm.course", module_query[index].id)
                                                .whereNot("scorm_scoes.parent", "/")
                                                .limit(1)
                let scorm_id = 0
                let sco_id = 0
                let reference = ""
                if(get_sco_data != 0){
                    for(let index in get_sco_data){
                        scorm_id = get_sco_data[index].scorm_id
                        sco_id = get_sco_data[index].sco_id
                        reference = get_sco_data[index].reference
                    }
                }
                //Get Completed or Incomplete
                const lesson_data = await Database.connection('db_reader')
                                                .select("daa_module_logs.id")
                                                .from("daa_module_logs")
                                                .where("daa_module_logs.user_id", user_id)
                                                .where("daa_module_logs.module_id", module_query[index].id)
                                                .where("daa_module_logs.is_completed", 1)
                                                .limit(1)
                const is_complete = 0
                if(lesson_data != 0){
                    is_complete = 1
                }
                const total_attempt = 0
                //Get Completed or Incomplete
                if(scorm_id != 0){
                    const attempt_data = await Database.connection('db_reader')
                                                    .select("scorm_scoes_track.id AS track_id", "scorm_scoes_track.attempt", "scorm_scoes_track.value")
                                                    .from("scorm_scoes_track")
                                                    .where("scorm_scoes_track.userid", user_id)
                                                    .where("scorm_scoes_track.scormid", scorm_id)
                                                    .where("scorm_scoes_track.scoid", sco_id)
                                                    .orderBy("scorm_scoes_track.attempt", "DESC")
                                                    .limit(1)
                    if(attempt_data != 0){
                        for(let index in attempt_data){
                            if(attempt_data[index].value == "incomplete"){
                                total_attempt = attempt_data[index].attempt-1
                            }else{
                                total_attempt = attempt_data[index].attempt
                            }
                        }
                    }
                }
                const scorm_name = reference.replace(".zip", "")
                //get module competent
                const lesson_data_query = await Database.connection('db_reader')
                                                    .select("daa_module_logs.id")
                                                    .from("daa_module_logs")
                                                    .where("daa_module_logs.user_id", user_id)
                                                    .where("daa_module_logs.module_id", module_query[index].id)
                                                    .where("daa_module_logs.is_competent", 1)
                                                    .limit(1)
                let is_competent = 0
                if(lesson_data_query != 0 ){
                    is_competent = 1
                }
                //check module is placement test
                const is_placement_test_query = await Database.connection('db_reader')
                                                    .select("course.id")
                                                    .from("course")
                                                    .where("course.id", module_query[index].id)
                                                    .where("course.is_placement_test", 1)
                                                    .limit(1)
                let is_placement_test = 0
                let is_placement_test_submitted = 0
                if(is_placement_test_query != 0){
                    is_placement_test = 1
                    
                    const is_submit_query = await Database.connection('db_reader')
                                                        .select("daa_placement_test_result.id")
                                                        .from("daa_placement_test_result")
                                                        .where("daa_placement_test_result.user_id", user_id)
                                                        .where("daa_placement_test_result.module_id", module_query[index].id)
                                                        .where("daa_placement_test_result.is_submit", 1)
                                                        .limit(1)
                    if(is_submit_query != 0){
                        is_placement_test_submitted = 1
                    }
                }else{
                    is_placement_test_submitted = 1
                }
                //Check module is unity or not
                const check_is_unity = await Database.connection('db_reader')
                                                .select("course.id")
                                                .from("course")
                                                .where("course.id", module_query[index].id)
                                                .where("course.unity", 1)
                                                .limit(1)
                let unity = 0
                if(check_is_unity != 0){
                    unity = 1
                }
                //Has Trailer
                let has_trailer = 0
                let trailer = ""
                if(module_query[index].trailer){
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    has_trailer = 1
                    trailer = url+module_query[index].trailer
                }
                //Get Journey, Course
                const get_jcm = await Database.connection('db_reader')
                                            .select("dj.id as journey_id", "dj.name as journey_name", "dc.id as course_id", "dc.name as course_name")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                            .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                            .join("course as c", "c.id", "dcm.module_id")
                                            .where("c.id", module_query[index].id)
                let journey_id = 0
                let journey_name = ""
                let course_id = 0
                let course_name = ""
                if(get_jcm !=0 ){
                    for(let index in get_jcm){
                        journey_id = get_jcm[index].journey_id
                        journey_name = get_jcm[index].journey_name
                        course_id = get_jcm[index].course_id
                        course_name = get_jcm[index].course_name
                    }
                }
                //Submit Rating
                const rating = await Database.connection('db_reader')
                                        .select("id")
                                        .from("daa_rating_module")
                                        .where("module_id", module_query[index].id)
                let has_submit_rating = 0
                if(rating.length > 0){
                    has_submit_rating = 1
                }
                var element_module = {}
                element_module.id = module_query[index].cid
                element_module.cid = module_query[index].cid
                element_module.fullname = module_query[index].fullname
                element_module.summary = module_query[index].summary
                element_module.type = module_query[index].type
                element_module.scorm_file = module_query[index].scorm_file
                element_module.attempt_limit = module_query[index].attempt_limit
                element_module.module_type = module_query[index].module_type
                element_module.cat = module_query[index].cat
                element_module.has_rating = module_query[index].has_rating
                element_module.trailer = module_query[index].trailer
                element_module.description = module_query[index].description
                element_module.currentdate = current_date
                element_module.startdate = start_date
                element_module.enddate = end_date
                element_module.idnumber = module_query[index].idnumber
                element_module.isopen = is_open
                element_module.cmid = module_query[index].cmid
                element_module.total_attempt = 0
                element_module.category = category_name
                element_module.restrict = restrict_name
                element_module.thumbnail = thumbnail
                element_module.scorm_id = scorm_id
                element_module.sco_id = sco_id
                element_module.reference = reference
                element_module.is_complete = is_complete
                element_module.scorm_name = scorm_name
                element_module.is_competent = is_competent
                element_module.is_placement_test = is_placement_test
                element_module.is_placement_test_submitted = is_placement_test_submitted
                element_module.unity = unity
                element_module.has_trailer = has_trailer
                element_module.trailer = trailer
                element_module.journey_id = journey_id
                element_module.journey_name = journey_name
                element_module.course_id = course_id
                element_module.course_name = course_name
                element_module.has_submit_rating = has_submit_rating 
                
                modules.push(element_module)
            }
            for(let index in course){
                const url = Env.get('APP_URL')+'/uploads/file/'
                element.id = course[index].id
                element.name = course[index].name
                element.description = course[index].description
                element.thumbnail = url+course[index].thumbnail                
            }
            let journey_array = []
            for(let index in journey){
                const url = Env.get('APP_URL')+'/uploads/file/'
                var element_journey = {}
                element_journey.id = journey[index].id
                element_journey.name = journey[index].name
                element_journey.description = journey[index].description
                element_journey.thumbnail = url+journey[index].thumbnail
                element_journey.is_leaderboard = journey[index].is_leaderboard
                element_journey.is_reward = journey[index].is_reward
                element_journey.end_date = journey[index].end_date
                element_journey.is_simulator = journey[index].is_simulator

                journey_array.push(element_journey)
            }
            element.modules = modules
            element.journey = journey_array
            if(module_query != 0){
                message = "Ok"
            }else{
                message = "Modules empty"
            }
            data.status = 200,
            data.message = message,
            data.data = element
        }else{
                data.status = 404,
                data.message = "Course not found",
                data.data = []
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Get Leaderboard
    leaderboard = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const id = params.id
        const board_query = await Database.connection('db_reader')
                                        .select("scorm_scoes_track.userid", "user.username", "user.firstname", "user.lastname", "daa_courses.journey_id", "user.daa_picture", "scorm_scoes_track.value AS totalgrade")
                                        .from("daa_course_modules")
                                        .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                        .innerJoin("daa_courses", "daa_courses.id", "daa_course_modules.course_id")
                                        .innerJoin("scorm", "scorm.course", "course.id")
                                        .innerJoin("scorm_scoes_track", "scorm_scoes_track.scormid", "scorm.id")
                                        .innerJoin("user", "user.id", "scorm_scoes_track.userid")
                                        .where("daa_courses.journey_id", id)
                                        .where("scorm_scoes_track.element", "cmi.core.score.raw")
                                        .groupBy("scorm_scoes_track.userid")
                                        .orderBy("scorm_scoes_track.value", "ASC")
                                        .orderBy("scorm_scoes_track.id", "ASC")
                                        .limit(10)
        if(board_query != 0){
            for(let index in board_query){
                if(board_query[index].daa_picture != 0){
                    const url = Env.get('APP_URL')+'/tmp/uploads/'+board_query[index].id+'/profile_pic/'
                    board_query[index].daa_picture = url+board_query[index].daa_picture
                }else{
                    board_query[index].daa_picture = ""
                }
            }
        }
        var data = {
            boards: board_query,
            total: board_query.length
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Get Detail Leaderboard Journey
    detail_lj = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const id = params.journey_id

        return response.send({status: 200, message: "Ok", data: id})
    }
    //Search All Journey, Course, Module
    search_all = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const { keyword, limit, offset } = request.all()
        const rules = {
            keyword: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            let data_limit = 10
            let data_offset = 0
            let journey_data = []
            let course_data = []
            let module_data = []
            if(limit != null){
                data_limit = limit
            }
            if(offset != null){
                data_offset = offset
            }
            const journey_query = await Database.connection('db_reader')
                                            .select("daa_journeys.id", "daa_journeys.name", "daa_journeys.description", "daa_journeys.thumbnail")
                                            .from("daa_journeys")
                                            .join("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                            .join("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                            .where("cohort_members.userid", user_id)
                                            .where("daa_journeys.name", "like", keyword)
                                            .where("daa_journeys.visible", 1)
                                            .groupBy("daa_journeys.id")
                                            .limit(limit)
                                            .offset(offset)
                                            .orderBy("daa_journeys.sort")
            if(journey_query != 0){
                for(let index in journey_query){
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    journey_query[index].thumbnail = url+journey_query[index].thumbnail
                }
                journey_data = journey_query
            }
            const course_query = await Database.connection('db_reader')
                                            .select("daa_courses.id", "daa_courses.name", "daa_courses.journey_id", "daa_courses.description", "daa_courses.thumbnail")
                                            .from("daa_journeys")
                                            .join("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                            .join("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                            .join("daa_courses", "daa_courses.journey_id", "daa_journeys.id")
                                            .where("cohort_members.userid", user_id)
                                            .where("daa_courses.name", "like", keyword)
                                            .where("daa_journeys.visible", 1)
                                            .where("daa_courses.visible", 1)
                                            .offset(offset)
                                            .limit(limit)
            if(course_query != 0){
                for(let index in course_query){
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    course_query[index].thumbnail = url+course_query[index].thumbnail
                } 
                course_data = course_query
            }
            const module_query = await Database.connection('db_reader')
                                            .select("course.id", "course.fullname", "daa_courses.journey_id", "daa_course_modules.course_id", "course.summary", "daa_courses.thumbnail")
                                            .from("daa_journeys")
                                            .join("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                            .join("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                            .join("daa_courses", "daa_courses.journey_id", "daa_journeys.id")
                                            .join("daa_course_modules", "daa_course_modules.course_id", "daa_courses.id")
                                            .join("course", "course.id", "daa_course_modules.module_id")
                                            .where("cohort_members.userid", user_id)
                                            .where("course.fullname", "like", keyword)
                                            .where("daa_journeys.visible", 1)
                                            .where("daa_courses.visible", 1)
                                            .where("course.visible", 1)
                                            .offset(offset)
                                            .limit(limit)
            if(module_query != 0){
                for(let index in module_query){
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    module_query[index].thumbnail = url+module_query[index].thumbnail
                } 
                module_data = module_query
            }
            var data = {
                result_journey: journey_data,
                result_course: course_data,
                result_module: module_data,
                total: journey_data.length+course_data.length+module_data.length
            }
            
            return response.send({status: 200, message: "OK", data: data})
        }
    }
    //Search Participant
    search_participant = async ({auth, request, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const page = params.page
        const { keyword, journey_id } = request.all()
        const rules = {
            keyword: 'required',
            journey_id: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            let users = []
            if(page != null){
                let limit = 20
                let offset = page*limit
                users = await Database.connection('db_reader')
                                    .select("user.id", "user.firstname", "user.lastname", "user.email", "user.picture", "user.daa_picture")
                                    .from("daa_journeys")
                                    .join("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                    .join("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                    .join("user", "user.id", "cohort_members.userid")
                                    .where("daa_journey_cohort_enrols.journey_id", journey_id) 
                                    .where("user.deleted", 0)
                                    .where("user.suspended", 0)
                                    .where("user.firstname", "LIKE", keyword)
                                    .orWhere("user.lastname", "LIKE", keyword)
                                    .groupBy("user.id")
                                    .orderBy("user.firstname")
                                    .orderBy("user.lastname")
                                    .offset(offset)
                                    .limit(limit)
            }else{
                users = await Database.connection('db_reader')
                                    .select("user.id", "user.firstname", "user.lastname", "user.email", "user.picture", "user.daa_picture")
                                    .from("daa_journeys")
                                    .join("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                    .join("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                    .join("user", "user.id", "cohort_members.userid")
                                    .where("daa_journey_cohort_enrols.journey_id", journey_id) 
                                    .where("user.deleted", 0)
                                    .where("user.suspended", 0)
                                    .where("user.firstname", "LIKE", keyword)
                                    .orWhere("user.lastname", "LIKE", keyword)
                                    .groupBy("user.id")
                                    .orderBy("user.firstname")
                                    .orderBy("user.lastname")
            }
            if(users != 0){
                for(let index in users){
                    if(users[index].daa_picture != 0){
                        //Get Picture Data
                        const url = Env.get('APP_URL')+'/tmp/uploads/'+users[index].id+'/profile_pic/'
                        users[index].picture = url+users[index].daa_picture
                    }else{
                        users[index].picture = ""
                    }
                    //Get Position
                    const get_position = await Database.connection('db_reader')
                                                .select("uid.userid", "uid.data")
                                                .from("user_info_field as uif")
                                                .join("user_info_data as uid", "uif.id", "uid.fieldid")
                                                .where("uif.id", 7)
                                                .where("uid.userid", user_id)
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
                    get_position[index].position = position
                }
            }
            var data = {
                users: users,
                total: users.length
            }
            return response.send({status: 200, message: "OK", data: data})
        }
    }
}

module.exports = JourneyController
