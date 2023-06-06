'use strict'

const Database = use('Database')
const Env = use('Env')
const DaaReminderLog = use('App/Models/DaaReminderLog')
const Mail = use('Mail')
var FCM = require('fcm-node');

class NotificationSchedullerController {
    index = async ({auth, params, response}) => {
        const date = new Date()
        const insert = await Database.connection('db_writer')
                                .table('daa_cronjob_log')
                                .insert({
                                    cron_name: 'App\Http\Controllers\NotificationSchedullerController@index',
                                    start_date: date
                                })
        // const mandatory = this.getMandatory()
        const data_reminder = await Database.connection('db_reader')
                                        .select("*")
                                        .from("daa_reminder")
                                        .where("visible", 1)
        let datas = []
        var user_not_completed = []
        if(data_reminder != 0 ){
            for(let index in data_reminder){
                // var element = {}
                if(data_reminder[index].reminder_type == 3){
                    const query = await Database.connection('db_reader')
                                            .select("c.id")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                            .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                            .join("course as c", "dcm.module_id", "c.id")
                                            .where("dj.id", data_reminder[index].journey_id)
                                            .where("dc.id", data_reminder[index].course_id)
                                            .where("c.id", data_reminder[index].module_id)
                                            .where("dj.visible", 1)
                                            .where("dc.visible", 1)
                                            .where("c.visible", 1)
                    const count_query = query.length
                    if (count_query > 0) {
                        var element = {}
                        element.journey_id = data_reminder[index].journey_id
                        element.course_id = data_reminder[index].course_id
                        element.module_id = data_reminder[index].module_id

                        datas.push(element)
                    }
                }else if(data_reminder[index].reminder_type == 2){
                    const query = await Database.connection('db_reader')
                                            .select("c.id")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                            .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                            .join("course as c", "dcm.module_id", "c.id")
                                            .where("dj.id", data_reminder[index].journey_id)
                                            .where("dc.id", data_reminder[index].course_id)
                                            .where("dj.visible", 1)
                                            .where("dc.visible", 1)
                    const count_query = query.length
                    if (count_query > 0) {
                        var element = {}
                        element.journey_id = data_reminder[index].journey_id
                        element.course_id = data_reminder[index].course_id
                        
                        datas.push(element)
                    }
                }else if(data_reminder[index].reminder_type == 1){
                    const query = await Database.connection('db_reader')
                                            .select("c.id")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                            .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                            .join("course as c", "dcm.module_id", "c.id")
                                            .where("dj.id", data_reminder[index].journey_id)
                                            .where("dj.visible", 1)
                    const count_query = query.length
                    if (count_query == 0) {
                        var element = {}

                        element.journey_id = data_reminder[index].journey_id
                        datas.push(element)
                    }
                }
                element.id = data_reminder[index].id
                element.journey_id = data_reminder[index].journey_id
                element.course_id = data_reminder[index].course_id
                element.module_id = data_reminder[index].journey_id
                element.name = data_reminder[index].name
                element.reminder_type = data_reminder[index].reminder_type
                element.start_date = data_reminder[index].start_date
                element.expired_date = data_reminder[index].expired_date
                element.general_date = data_reminder[index].general_date
                element.visible = data_reminder[index].visible
                element.type = data_reminder[index].reminder_type
                element.reminder_id = data_reminder[index].id

                if(element.type == 1){
                    //get user enroll
                    let id_enroll = []
                    const user_enroll = await Database.connection('db_reader')
                                                    .select("u.id")
                                                    .from("daa_journey_cohort_enrols as djce")
                                                    .join("cohort as ch", "ch.id", "djce.cohort_id")
                                                    .join("cohort_members as cm", "cm.cohortid", "ch.id")
                                                    .join("user as u", "u.id", "cm.userid")
                                                    .where("journey_id", element.journey_id)
                                                    .where("ch.visible", 1)
                                                    .where("u.deleted", 0)
                    let count_enroll = user_enroll.length
                    if (user_enroll != 0) {
                        for(let index in user_enroll){
                            id_enroll.push(user_enroll[index].id)
                        }
                    }
                    let get_module
                    let total_module
                    let query_get_module
                    //get module id
                    query_get_module = await Database.connection('db_reader')
                                            .select("c.id")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                            .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                            .join("course as c", "dcm.module_id", "c.id")
                                            .where("dj.id", element.journey_id)
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
                                            .where("c.module_type", 1)
                    total_module = query_get_module.length
                    if(query_get_module != 0){
                        for(let index in query_get_module){
                            get_module.push(query_get_module[index].id)
                        }
                    }
                    if(total_module > 0){
                        const get_tot_module = await Database.connection('db_reader')
                                                        .select("module_id")
                                                        .from("daa_module_logs")
                                                        .whereIn("user_id", id_enroll)
                                                        .whereIn("module_id", get_module)
                                                        .where("is_completed", 1)
                        if(total_module != get_tot_module.length){
                            for(let index in user_enroll){
                                user_not_completed.push(user_enroll[index].id)
                            }
                        }
                    }
                }
                else if(element.type == 2){
                    //get user enroll
                    let id_enroll = []
                    const user_enroll = await Database.connection('db_reader')
                                                    .select("u.id")
                                                    .from("daa_journey_cohort_enrols as djce")
                                                    .join("cohort as ch", "ch.id", "djce.cohort_id")
                                                    .join("cohort_members as cm", "cm.cohortid", "ch.id")
                                                    .join("user as u", "u.id", "cm.userid")
                                                    .where("journey_id", element.journey_id)
                                                    .where("ch.visible", 1)
                                                    .where("u.deleted", 0)
                    let count_enroll = user_enroll.length
                    if (user_enroll != 0) {
                        for(let index in user_enroll){
                            id_enroll.push(user_enroll[index].id)
                        }
                    }
                    let get_module
                    let total_module
                    let query_get_module
                    //get module id
                    query_get_module = await Database.connection('db_reader')
                                            .select("c.id")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                            .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                            .join("course as c", "dcm.module_id", "c.id")
                                            .where("dj.id", element.journey_id)
                                            .where("dc.id", element.course_id)
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
                                            .where("c.module_type", 1)
                    total_module = query_get_module.length
                    if(query_get_module != 0){
                        for(let index in query_get_module){
                            get_module.push(query_get_module[index].id)
                        }
                    }
                    if(total_module > 0){
                        const get_tot_module = await Database.connection('db_reader')
                                                        .select("module_id")
                                                        .from("daa_module_logs")
                                                        .whereIn("user_id", id_enroll)
                                                        .whereIn("module_id", get_module)
                                                        .where("is_completed", 1)
                        if(total_module != get_tot_module.length){
                            for(let index in user_enroll){
                                user_not_completed.push(user_enroll[index].id)
                            }
                        }
                    }
                }
                else if(element.type == 3){
                    // user_not_completed = this.check_completion(element.journey_id, element.course_id, element.module_id)
                                        //get user enroll
                    let id_enroll = []
                    const user_enroll = await Database.connection('db_reader')
                                                    .select("u.id")
                                                    .from("daa_journey_cohort_enrols as djce")
                                                    .join("cohort as ch", "ch.id", "djce.cohort_id")
                                                    .join("cohort_members as cm", "cm.cohortid", "ch.id")
                                                    .join("user as u", "u.id", "cm.userid")
                                                    .where("journey_id", element.journey_id)
                                                    .where("ch.visible", 1)
                                                    .where("u.deleted", 0)
                    let count_enroll = user_enroll.length
                    if (user_enroll != 0) {
                        for(let index in user_enroll){
                            id_enroll.push(user_enroll[index].id)
                        }
                    }
                    let get_module
                    let total_module
                    let query_get_module
                    //get module id
                    query_get_module = await Database.connection('db_reader')
                                            .select("c.id")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                            .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                            .join("course as c", "dcm.module_id", "c.id")
                                            .where("dj.id", element.journey_id)
                                            .where("dc.id", element.course_id)
                                            .where("c.id", element.module_id)
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
                                            .where("c.module_type", 1)
                    total_module = query_get_module.length
                    if(query_get_module != 0){
                        for(let index in query_get_module){
                            get_module.push(query_get_module[index].id)
                        }
                    }
                    if(total_module > 0){
                        const get_tot_module = await Database.connection('db_reader')
                                                        .select("module_id")
                                                        .from("daa_module_logs")
                                                        .whereIn("user_id", id_enroll)
                                                        .whereIn("module_id", get_module)
                                                        .where("is_completed", 1)
                        if(total_module != get_tot_module.length){
                            for(let index in user_enroll){
                                user_not_completed.push(user_enroll[index].id)
                            }
                        }
                    }
                }              
                const test = this.get_date_notif(element.id, element.reminder_id, user_not_completed)
            }
        }
        const update = await Database.connection('db_writer')
                                .table('daa_cronjob_log')
                                .where("id", insert)
                                .update({
                                    end_date: date
                                })
    }
    check_completion = async (journey_id, course_id, module_id) => {
                    //get user enroll
                    let id_enroll = []
                    let user_not_completed = [1,2,3,4]
                    const user_enroll = await Database.connection('db_reader')
                                                    .select("u.id")
                                                    .from("daa_journey_cohort_enrols as djce")
                                                    .join("cohort as ch", "ch.id", "djce.cohort_id")
                                                    .join("cohort_members as cm", "cm.cohortid", "ch.id")
                                                    .join("user as u", "u.id", "cm.userid")
                                                    .where("journey_id", journey_id)
                                                    .where("ch.visible", 1)
                                                    .where("u.deleted", 0)
                    let count_enroll = user_enroll.length
                    if (user_enroll != 0) {
                        for(let index in user_enroll){
                            id_enroll.push(user_enroll[index].id)
                        }
                    }
                    let get_module
                    let total_module
                    let query_get_module
                    //get module id
                    if(course_id != 0 && module_id == 0){
                        query_get_module = await Database.connection('db_reader')
                                                .select("c.id")
                                                .from("daa_journeys as dj")
                                                .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                                .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                                .join("course as c", "dcm.module_id", "c.id")
                                                .where("dj.id", journey_id)
                                                .where("dc.id", course_id)
                                                .where("dj.visible", 1)
                                                .where("c.visible", 1)
                                                .where("dc.visible", 1)
                                                .where("c.module_type", 1)
                        total_module = query_get_module.length
                        if(query_get_module != 0){
                            for(let index in query_get_module){
                                get_module.push(query_get_module[index].id)
                            }
                        }
                    }else if(course_id != 0 && module_id != 0){
                        query_get_module = await Database.connection('db_reader')
                                                .select("c.id")
                                                .from("daa_journeys as dj")
                                                .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                                .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                                .join("course as c", "dcm.module_id", "c.id")
                                                .where("dj.id", journey_id)
                                                .where("dc.id", course_id)
                                                .where("c.id", module_id)
                                                .where("dj.visible", 1)
                                                .where("c.visible", 1)
                                                .where("dc.visible", 1)
                                                .where("c.module_type", 1)
                        total_module = query_get_module.length
                        if(query_get_module != 0){
                            for(let index in query_get_module){
                                get_module.push(query_get_module[index].id)
                            }
                        }
                    }else{
                        query_get_module = await Database.connection('db_reader')
                                                .select("c.id")
                                                .from("daa_journeys as dj")
                                                .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                                .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                                .join("course as c", "dcm.module_id", "c.id")
                                                .where("dj.id", journey_id)
                                                .where("dj.visible", 1)
                                                .where("c.visible", 1)
                                                .where("dc.visible", 1)
                                                .where("c.module_type", 1)
                        total_module = query_get_module.length
                        if(query_get_module != 0){
                            for(let index in query_get_module){
                                get_module.push(query_get_module[index].id)
                            }
                        }
                    }
                    if(total_module > 0){
                        const get_tot_module = await Database.connection('db_reader')
                                                        .select("module_id")
                                                        .from("daa_module_logs")
                                                        .whereIn("user_id", id_enroll)
                                                        .whereIn("module_id", get_module)
                                                        .where("is_completed", 1)
                        if(total_module != get_tot_module.length){
                            for(let index in user_enroll){
                                user_not_completed.push(user_enroll[index].id)
                            }
                        }
                    }
                    return user_not_completed
    }
    get_date_notif = async (journey_id, reminder_id, user_id) => {
        let data_insert = []
        const data_join_date_query = await Database.connection('db_reader')
                                                .select("u.id", "djce.created_at as existing_date")
                                                .from("daa_journey_cohort_enrols as djce")
                                                .join("cohort as ch", "ch.id", "djce.cohort_id") 
                                                .join("cohort_members as cm", "cm.cohortid", "ch.id")
                                                .join("user as u", "u.id", "cm.userid")
                                                .where("djce.journey_id", journey_id)
                                                .whereIn("u.id", user_id)
                                                .where("ch.visible", 1)
        const data_setting_query = await Database.connection('db_reader')
                                                .select("drs.*", "dr.start_date", "dr.expired_date", "dr.journey_id", "dr.course_id", "dr.module_id", "dr.reminder_type", "dr.general_date")
                                                .from("daa_reminder_setting as drs")
                                                .join("daa_reminder as dr", "dr.id", "drs.reminder_id")
                                                .where("drs.reminder_id", reminder_id)
                                                .where("drs.visible", 1)
                                                .where("drs.is_completed", 0)
                                                .where("dr.visible", 1)

        if (data_join_date_query != 0) {
            for(let index in data_join_date_query){
                const user_notif = data_join_date_query[index].id
                let join_date_data = 0
                if (data_setting_query != 0) {
                    for(let i in data_setting_query){
                        const join_dates_query = await Database.connection('db_reader')
                                                            .select("data")
                                                            .from("user_info_data")
                                                            .where("userid", user_notif)
                                                            .where("fieldid", 12)
                        if(join_dates_query != 0){
                            for(let i in join_dates_query){
                                if(join_dates_query[i].data != ""){
                                    join_date_data = join_dates_query[i].data
                                }
                            }
                        }

                        const date_now = new Date()
                        const date = date_now.getFullYear()+'-'+(date_now.getMonth()+1)+'-'+date_now.getDate()
                        //tipe join date
                        const join_date = date

                        //tipe enrollment date
                        const date_existing = data_join_date_query[index].existing_date
                        const existing_date = date_existing.getFullYear()+'-'+(date_existing.getMonth()+1)+'-'+date_existing.getDate()

                        //tipe general date
                        const date_general = data_setting_query[i].general_date
                        const general_date = date_general.getFullYear()+'-'+(date_general.getMonth()+1)+'-'+date_general.getDate()

                        //1:enrolment date, 2:join date, 3:expired date, 4:general date
                        let expired_date
                        let start_date_val
                        if(data_setting_query[i].start_date == 1 && join_date_data == 0){
                            const start_date = data_join_date_query[index].existing_date
                            const expired = data_setting_query[i].expired_date
                            expired_date = new Date(start_date.setDate(start_date.getDate() + expired))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired)
                        }else if(data_setting_query[i].start_date == 2){
                            const start_date = new Date()
                            const expired = data_setting_query[i].expired_date
                            expired_date = new Date(start_date.setDate(start_date.getDate() + expired))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired)
                        }else if(data_setting_query[i].start_date == 4){
                            const start_date = data_setting_query[i].general_date
                            const expired = data_setting_query[i].expired_date
                            expired_date = new Date(start_date.setDate(start_date.getDate() + expired))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired)
                        }else if(data_setting_query[i].start_date == 3){
                            if(data_setting_query[i].reminder_type == 1){
                                const data_expired = await Database.connection('db_reader')
                                                                .select("start_date", "expired_date")
                                                                .from("daa_reminder")
                                                                .whereNotNull("expired_date")
                                                                .where("visible", 1)
                                                                .where("journey_id", data_setting_query[i].journey_id)
                                                                .limit(1)
                                let expired_value = 90
                                for(let index in data_expired){
                                    if(data_expired[index].expired_date != ""){
                                        expired_value = data_expired[index].expired_date
                                    }
                                    //1:enrollment date, 2:join date, 4:general date
                                    if(data_expired[index].start_date == 1){
                                        const start_date = data_join_date_query[index].existing_date
                                        expired_date = new Date(start_date.setDate(start_date.getDate() + expired_value))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired_value)
                                    }else if(data_expired[index].start_date == 2){
                                        const start_date = new Date()
                                        expired_date = new Date(start_date.setDate(start_date.getDate() + expired_value))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired_value)
                                    }else if(data_expired[index].start_date == 4){
                                        const start_date = data_setting_query[i].general_date
                                        expired_date = new Date(start_date.setDate(start_date.getDate() + expired_value))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired_value)
                                    }
                                }
                                start_date_val = expired_date
                            }else if(data_setting_query[i].reminder_type == 2){
                                const data_expired = await Database.connection('db_reader')
                                                                .select("start_date", "expired_date")
                                                                .from("daa_reminder")
                                                                .whereNotNull("expired_date")
                                                                .where("visible", 1)
                                                                .where("journey_id", data_setting_query[i].journey_id)
                                                                .where("course_id", data_setting_query[i].course_id)
                                                                .limit(1)
                                let expired_value = 90
                                for(let index in data_expired){
                                    if(data_expired[index].expired_date != ""){
                                        expired_value = data_expired[index].expired_date
                                    }
                                    //1:enrollment date, 2:join date, 4:general date
                                    if(data_expired[index].start_date == 1){
                                        const start_date = data_join_date_query[index].existing_date
                                        expired_date = new Date(start_date.setDate(start_date.getDate() + expired_value))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired_value)
                                    }else if(data_expired[index].start_date == 2){
                                        const start_date = new Date()
                                        expired_date = new Date(start_date.setDate(start_date.getDate() + expired_value))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired_value)
                                    }else if(data_expired[index].start_date == 4){
                                        const start_date = data_setting_query[i].general_date
                                        expired_date = new Date(start_date.setDate(start_date.getDate() + expired_value))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired_value)
                                    }
                                }
                                start_date_val = expired_date
                            }else if(data_setting_query[i].reminder_type == 3){
                                const data_expired = await Database.connection('db_reader')
                                                                .select("start_date", "expired_date")
                                                                .from("daa_reminder")
                                                                .whereNotNull("expired_date")
                                                                .where("visible", 1)
                                                                .where("journey_id", data_setting_query[i].journey_id)
                                                                .where("course_id", data_setting_query[i].course_id)
                                                                .where("module_id", data_setting_query[i].module_id)
                                                                .limit(1)
                                let expired_value = 90
                                for(let index in data_expired){
                                    if(data_expired[index].expired_date != ""){
                                        expired_value = data_expired[index].expired_date
                                    }
                                    //1:enrollment date, 2:join date, 4:general date
                                    if(data_expired[index].start_date == 1){
                                        const start_date = data_join_date_query[index].existing_date
                                        expired_date = new Date(start_date.setDate(start_date.getDate() + expired_value))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired_value)
                                    }else if(data_expired[index].start_date == 2){
                                        const start_date = new Date()
                                        expired_date = new Date(start_date.setDate(start_date.getDate() + expired_value))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired_value)
                                    }else if(data_expired[index].start_date == 4){
                                        const start_date = data_setting_query[i].general_date
                                        expired_date = new Date(start_date.setDate(start_date.getDate() + expired_value))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+expired_value)
                                    }
                                }
                                start_date_val = expired_date
                            }
                        }else{
                            start_date_val = new Date()
                        }
                        const notif_date = data_setting_query[i].notif_date
                        const date_notif = new Date(start_date.setDate(start_date.getDate() + notif_date))//start_date.getFullYear()+'-'+(start_date.getMonth()+1)+'-'+(start_date.getDate()+notif_date)
                        const curr_date = new Date()//date_now.getFullYear()+'-'+(date_now.getMonth()+1)+'-'+date_now.getDate()
                        if(date_notif == curr_date){
                            const query_user = await Database.connection('db_reader')
                                                        .select("u.id")
                                                        .form("user_info_data as uid")
                                                        .join("user as u", "u.username", "uid.data")
                                                        .where("uid.fieldid", 5)
                                                        .where("uid.userid", user_notif)
                            //Check setting spv
                            let spv_id = []
                            if(data_setting_query[i].send_spv == 1){
                                if(query_user != 0){
                                    for(let index in query_user){
                                        spv_id.push(query_user[index].id)
                                    }
                                }
                            }
                            //Check setting nha
                            let nha_id = []
                            if(data_setting_query[i].send_nha == 1){
                                const query_user_nha = await Database.connection('db_reader')
                                                            .select("u.id")
                                                            .form("user_info_data as uid")
                                                            .join("user as u", "u.username", "uid.data")
                                                            .where("uid.fieldid", 13)
                                                            .where("uid.userid", user_notif)
                                if(query_user_nha != 0){
                                    for(let index in query_user_nha){
                                        nha_id.push(query_user_nha[index].id)
                                    }
                                }
                            }
                            //Check H-5 before expired
                            const interval = 5
                            const check_date = new Date(expired_date.setDate(expired_date.getDate()+interval))
                            let before_expired = 0
                            if(date_notif >= check_date && date_notif < expired_date){
                                before_expired = 5
                            }

                            //Check is expired
                            let is_expired = 0
                            if(date_notif >= expired_date){
                                is_expired = 1
                            }
                            var element = {}
                            element.reminder_setting_id = data_setting_query[i].id
                            element.user_id = user_notif
                            element.spv_id = spv_id
                            element.nha_id = nha_id
                            element.send_notif = 0
                            element.send_notif_spv = 0
                            element.send_notif_nha = 0
                            element.show_popup = 1
                            element.day_before_expired = before_expired
                            element.expired_date = expired_date
                            element.is_expired = is_expired
                            element.created_at = new Date()

                            data_insert.push(element)
                            await Database.connection('db_writer')
                                        .table('daa_reminder_setting')
                                        .where('id', data_setting_query[i].id)
                                        .update('is_completed', '1')
                        }
                    }
                }
            }
            await DaaReminderLog.createMany(data_insert)
        }
    }
    push_notif = async (arrTokens, data, notification) => {
        let token = []
        for(let index in data){
            if(data[index].user_id != 0){
                if(data[index].notif_type == "app_update"){
                    let platform
                    if(data[index].from_id == "1"){
                        platform = "Android"
                    }
                    else if(data[index].from_id == "2"){
                        platform = "IOS"
                    }
                    const token_query = await Database.connection('db_reader')
                                        .select("firebase_token")
                                        .from("daa_user_tokens")
                                        .where("platform", platform)
                                        .where("user_id", data[index].user_id)
                    for(let index in token_query){
                        token.push(token_query[index].firebase_token)
                    }
                }else{
                    const token_query = await Database.connection('db_reader')
                                        .select("firebase_token")
                                        .from("daa_user_tokens")
                                        .where("user_id", data[index].user_id)
                    for(let index in token_query){
                        token.push(token_query[index].firebase_token)
                    }
                }
            }

            // send notification
            var serverKey = Env.get('FCM_SERVER_KEY'); // put your server key here
            var fcm = new FCM(serverKey);
            var message_fcm = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                //to: 'registration_token',
                //registration_ids: ['registration_tokens'],
                to: token,
                collapse_key: 'your_collapse_key',
        
                notification: notification,
                data : data
        
        
                // notification: {
                //     title: 'Title of your push notification',
                //     body: 'Body of your push notification'
                // },
        
                // data: {  //you can send only notification or only data(or include both)
                //     my_key: 'my value',
                //     my_another_key: 'my another value'
                // }
            };
            fcm.send(message_fcm, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!: ", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        }
    }
    send_push_notif = async (type, user_id, username, data) => {
        const subject = "Reminder"
        const status = 0
        const created_at = new Date()
        const updated_at = new Date()
        const notif_type = "deadline_reminder_user"
        const journey_name_before_expired = []
        const journey_name_expired = []
        const journey_name = []

        if(type == 1){
            for(let index in data){
                const before_expired = data[index].before_expired
                const is_expired = data[index].is_expired

                if(before_expired == 1){
                    journey_name_before_expired.push(data[index].journey_name)
                }
                if(is_expired == 1){
                    journey_name_expired.push(data[index].journey_name)
                }
                journey_name.push(data[index].journey_name)

                if(journey_name_before_expired.length > 0){
                    const title = "Batas waktu "+data[index].expired_date+" hampir berakhir!"
                    const message = "Pastikan semua module pada "+data[index].journey_name+" Program telah selesai sebelum batas waktu"
                    const message_daa_notif = title+" "+message

                    await Database.connection('db_writer')
                                .table("daa_notifications")
                                .inser({
                                    user_id: user_id,
                                    type: notif_type,
                                    context_id: 0,
                                    subject: subject,
                                    message: message_daa_notif,
                                    status: status,
                                    created_at: created_at,
                                    updated_at: updated_at
                                })
                    //Object for controller push notif
                    let fcm_data = {
                        user_id: user_id,
                        from_id: 0,
                        notif_type: notif_type,
                        type: 0,
                        title: title,
                        message: message,
                        body: message
                    }

                    //Array data for mobile apps
                    let notif_data = []
                    var element = {}
                    element.user_id = user_id
                    element.type = 0
                    element.title = title
                    element.message = message
                    element.body = message
            
                    notif_data.push(element)
                    this.push_notif(user_id, fcm_data, notif_data)
                    await Database.connection('db_writer')
                                .table("daa_push_notif_log")
                                .insert({
                                    user_id: user_id,
                                    title: title,
                                    message: message,
                                    notif_type: notif_type,
                                    created_at: created_at
                                })
                }

                if(journey_name_expired.length > 0){
                    const title = "Batas waktu "+data[index].expired_date+" hampir berakhir!"
                    const message = "Segera selesaikan "+data[index].journey_name+" Program di My Learning Journey. Pemberitahuan ini terkirim juga ke Direct Supervisor"
                    const message_daa_notif = title+" "+message

                    await Database.connection('db_writer')
                                .table("daa_notifications")
                                .inser({
                                    user_id: user_id,
                                    type: notif_type,
                                    context_id: 0,
                                    subject: subject,
                                    message: message_daa_notif,
                                    status: status,
                                    created_at: created_at,
                                    updated_at: updated_at
                                })
                    //Object for controller push notif
                    let fcm_data = {
                        user_id: user_id,
                        from_id: 0,
                        notif_type: notif_type,
                        type: 0,
                        title: title,
                        message: message,
                        body: message
                    }

                    //Array data for mobile apps
                    let notif_data = []
                    var element = {}
                    element.user_id = user_id
                    element.type = 0
                    element.title = title
                    element.message = message
                    element.body = message
            
                    notif_data.push(element)
                    this.push_notif(user_id, fcm_data, notif_data)
                    await Database.connection('db_writer')
                                .table("daa_push_notif_log")
                                .insert({
                                    user_id: user_id,
                                    title: title,
                                    message: message,
                                    notif_type: notif_type,
                                    created_at: created_at
                                })
                }

                if(journey_name_before_expired == 0 && journey_name_expired == 0){
                    const title = "Hai Learners! Terdapat module yang perlu diselesaikan."
                    const message = "Lihat module dalam "+data[index].journey_name+" Program di My Learning Journey."
                    const message_daa_notif = title+" "+message

                    await Database.connection('db_writer')
                                .table("daa_notifications")
                                .inser({
                                    user_id: user_id,
                                    type: notif_type,
                                    context_id: 0,
                                    subject: subject,
                                    message: message_daa_notif,
                                    status: status,
                                    created_at: created_at,
                                    updated_at: updated_at
                                })
                    //Object for controller push notif
                    let fcm_data = {
                        user_id: user_id,
                        from_id: 0,
                        notif_type: notif_type,
                        type: 0,
                        title: title,
                        message: message,
                        body: message
                    }

                    //Array data for mobile apps
                    let notif_data = []
                    var element = {}
                    element.user_id = user_id
                    element.type = 0
                    element.title = title
                    element.message = message
                    element.body = message
                    this.push_notif(user_id, fcm_data, notif_data)
                    await Database.connection('db_writer')
                                .table("daa_push_notif_log")
                                .insert({
                                    user_id: user_id,
                                    title: title,
                                    message: message,
                                    notif_type: notif_type,
                                    created_at: created_at
                                })
                }
            }
        }
    }
    send_mail = async (type ,type_message, data, user_email) => {
        const date_now = new Date()
        const date = date_now.getFullYear()+'-'+(date_now.getMonth()+1)+'-'+date_now.getDate()
        let view
        let subject = "e-Smart Daily Reports"
        let from_address = 'keb-hana@digimasia.com'
        let team = "e-Smart Team"
        let messages
        if(type == 1){
            view = "mail.CompletionNotificationLearner"
            subject = "e-Smart Daily Reports _ "+date
        }else if(type == 2){
            view = "mail.CompletionNotificationSpv"
            subject = "e-Smart Daily Reports _ "+date
        }else if(type == 3){
            view = "mail.CompletionNotificationNha"
            subject = "e-Smart Daily Reports _ "+date
        }
        if(type_message == 1){
            messages = "Terdapat anggota tim Bapak/Ibu yang belum menyelesaikan program pembelajaran.";
        }
        else if(type_message == 2){
            messages = "Terdapat anggota tim Bapak/Ibu yang belum menyelesaikan program pembelajaran.";
        }
        else{
            messages = "";
        }
        var element = {}
        element.messages = messages
        element.journey_id = data
        element.team = team

        await Mail.send(view, element, (message) => {
            message
              .to(user_email)
              .from(from_address)
              .subject(subject)
          })
    }
    send_notif = async ({auth}) => {
        const date = new Date()
        //insert to corn log
        const insert = await Database.connection('db_writer')
                                .table('daa_cronjob_log')
                                .insert({
                                    cron_name: 'App\Http\Controllers\NotificationSchedullerController@sendNotif',
                                    start_date: date
                                })
        //show po up
        const update = await Database.connection('db_writer')
                                .table('daa_reminder_log')
                                .where("send_notif", 0)
                                .where("created_at", date)
                                .update({
                                    show_popup: 0
                                })
        //send notif user
        const data_user = await Database.connection('db_reader')
                                    .select("user_id")
                                    .from("daa_reminder_log")
                                    .where("send_notif", 0)
                                    .where("created_at", date)
                                    .limit(800)
                                    .groupBy("user_id")
        const tot_data_user = data_user.length
        let id_user = []
        if(tot_data_user > 0){
            let tot_notif = 1
            for(i = 1; i<4; i++){
                for(let index in data_user){
                    id_user.push(data_user[index].user_id)

                    const get_reminder_setting = await Database.connection('db_reader')
                                                            .select("dr.journey_id", "dr.course_id", "dr.module_id", "drs.notif_type", "drl.spv_id", "drl.nha_id", "drl.send_notif", "drl.user_id", "drl.day_before_expired", "drl.is_expired", "drl.expired_date")
                                                            .from("daa_reminder_log as drl")
                                                            .join("daa_reminder_setting as drs", "drs.id", "drl.reminder_setting_id")
                                                            .join("daa_reminder as dr", "dr.id", "drs.reminder_id")
                                                            .where("drl.send_notif", 0)
                                                            .where("drl.created_at", date)
                                                            .where("drl.user_id", data_user[index].user_id)
                                                            .where("drs.notif_type", tot_notif)
                    const tot_setting = get_reminder_setting.length
                    if(tot_setting > 0){
                        let notif_type = tot_notif
                        let tot_journey = tot_setting
                        let index_user = 0 
                        let journey_id = 0
                        let course_id = 0
                        let module_id = 0
                        let expired_date = ""
                        for(let index in get_reminder_setting){
                            if(get_reminder_setting[index].journey_id){
                                journey_id = get_reminder_setting[index].journey_id
                            }
                            if(get_reminder_setting[index].course_id){
                                course_id = get_reminder_setting[index].course_id
                            }
                            if(get_reminder_setting[index].module_id){
                                module_id = get_reminder_setting[index].module_id
                            }
                            if(get_reminder_setting[index].expired_date){
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
                                expired_date = get_reminder_setting[index].expired_date.getDate()+" "+month[get_reminder_setting[index].expired_date.getMonth()]+" "+get_reminder_setting[index].expired_date.getFullYear()
                            }
                            //Check Completion
                            let get_module
                            if(course_id != 0 && module_id == 0){
                                get_module = await Database.connection('db_reader')
                                                        .select("c.id")
                                                        .from("daa_journeys as dj")
                                                        .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                                        .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                                        .join("course as c", "dcm.module_id", "c.id")
                                                        .where("dj.id", journey_id)
                                                        .where("dc.id", course_id)
                                                        .where("dj.visible", 1)
                                                        .where("c.visible", 1)
                                                        .where("dc.visible", 1)
                                                        .where("c.module_type", 1)
                            }else if(course_id != 0 && module_id != 0 ){
                                get_module = await Database.connection('db_reader')
                                                        .select("c.id")
                                                        .from("daa_journeys as dj")
                                                        .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                                        .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                                        .join("course as c", "dcm.module_id", "c.id")
                                                        .where("dj.id", journey_id)
                                                        .where("dc.id", course_id)
                                                        .where("c.id", module_id)
                                                        .where("dj.visible", 1)
                                                        .where("c.visible", 1)
                                                        .where("dc.visible", 1)
                                                        .where("c.module_type", 1)
                            }
                            let tot_module = get_module.length
                            let module_id_array = []
                            let progress = 0
                            if(get_module != 0){
                                for(let index in get_module){
                                    module_id_array.push(get_module[index].id)
                                }
                            }
                            const module_complete = await Database.connection('db_reader')
                                                                .select("module_id")
                                                                .from("daa_module_logs")
                                                                .where("user_id", id_user)
                                                                .whereIn("module_id", module_id_array)
                                                                .where("is_completed", 1)
                            const total_module_completed = module_complete.length
                            if(total_module_completed == 0 || tot_module == 0){
                                progress = 0
                            }else{
                                progress = Math.round((total_module_completed/tot_module)*100)
                            }
                            let journey_name = ""
                            let course_name = ""
                            let module_name = ""
                            if(journey_id != 0){
                                const get_journey = await Database.connection('db_reader')
                                                                .select("*")
                                                                .from("daa_journeys")
                                                                .where("id", journey_id)
                                                                .limit(1)
                                if(get_journey != 0){
                                    for(let index in get_journey){
                                        journey_name = get_journey[index].name
                                    }
                                }
                            }
                            if(course_id != 0){
                                const get_course = await Database.connection('db_reader')
                                                            .select("*")
                                                            .from("daa_courses")
                                                            .where("id", course_id)
                                                            .limit(1)
                                if(get_course){
                                    for(let index in get_course){
                                        course_name = get_course[index].name
                                    }
                                }
                            }
                            if(module_id != 0){
                                const get_module_name = await Database.connection('db_reader')
                                                                    .select("fullname")
                                                                    .from("course")
                                                                    .where("id", module_id)
                                if(get_module_name != 0){
                                    for(let index in get_module_name){
                                        module_name = get_module_name[index].fullname
                                    }
                                }
                            }
                            let data_journey = []
                            var element_data = {}
                            element_data.journey_id = journey_id
                            element_data.journey_name = journey_name
                            element_data.course_name = course_name
                            element_data.module_name = module_name
                            element_data.progress = progress
                            element_data.expired_date = expired_date

                            
                            if(get_reminder_setting[index].day_before_expired == 5){
                                element_data.before_expired = 1
                            }else{
                                element_data.day_before_expired = 0
                            }
                            if(get_reminder_setting[index].is_expired == 1){
                                element_data.is_expired = 1
                            }else{
                                element_data.is_expired = 0
                            }
                            data_journey.push(element_data)
                        }
                    }
                    if(tot_setting > 0){
                        //user detail
                        const get_user = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("user")
                                                    .where("id", data_user[index].user_id)
                                                    .where("deleted", 0)
                        const slice_array = data_journey.slice(0, tot_journey)
                        let username
                        let email = []
                        if(get_user != 0){
                            for(let index in get_user){
                                username = get_user[index].username
                            }
                        }
                        //1:push notif, 2:email notif, 3:all
                        if(notif_type == 1){
                            this.send_push_notif(1, data_user[index].user_id, username, data_journey)
                        }
                        else if(notif_type == 2){
                            this.send_mail(1, 0, data_journey, email)
                        }
                        else if(notif_type == 3){
                            this.send_push_notif(1, data_user[index].user_id, username, data_journey)
                            this.send_mail(1, 0, data_journey, email)
                        }
                    }
                }
            }
        }
        if(tot_data_user > 0){
            await Database.connection('db_writer')
                    .table('daa_reminder_log')
                    .whereIn("id", id_user)
                    .update({
                        send_notif: 1
                    })
        }
        await Database.connection('db_writer')
                    .table('daa_cronjob_log')
                    .whereIn("id", id_user)
                    .update({
                        end_date: date
                    })
    }
    //API Show Pop Up
    show_popup = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        let date = new Date()
        let not_completed = []
        let title = ""
        let subtitle = ""
        const get_data = await Database.connection('db_reader')
                                    .select("dr.journey_id", "dr.course_id", "dr.module_id")
                                    .from("daa_reminder_log as drl")
                                    .join("daa_reminder_setting as drs", "drs.id", "drl.reminder_setting_id")
                                    .join("daa_reminder as dr", "dr.id", "drs.reminder_id")
                                    .where("user_id", user_id)
                                    .where("drl.show_popup", 0)
                                    .where("drl.created_at", date)
        for(let index in get_data){
            let journey_id = 0
            let journey_name = ""
            let thumbnail = ""
            if(get_data[index].journey_id){
                const get_journey = await Database.connection('db_reader')
                                                .from("daa_journeys")
                                                .where("id", journey_id)
                for(let index in get_journey){
                    if(get_journey[index].thumbnail){
                        const url = Env.get('APP_URL')+'/uploads/assets/images/'
                        thumbnail = url+get_journey[index].thumbnail
                    }
                }
            }
            var element = {}
            element.journey_id = journey_id
            element.journey_name = journey_name
            element.thumbnail = thumbnail

            not_completed.push(element)
        }
        if(not_completed.length > 0){
            title = "Complete this programs before its expiry date"
            subtitle = "Tap the program below for quick access to your course page"
        }
        var data = {
            title: title,
            subtitle: subtitle,
            detail: not_completed
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
}

module.exports = NotificationSchedullerController
