'use strict'

const Database = use('Database')
const Env = use('Env')
const Country = use('App/Models/Country')

class PointExtraController {
    //Get Point Extra
    index = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        let module_id = []
        let journey_id = []
        let data = []
        let tot_point = 0
        let total_point = 0
        //Module Query For Get Module ID
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
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
        for(let index in get_module_query){
            //Push Module ID into Array
            module_id.push(get_module_query[index].id)
        }
        //Get Journey Data
        const get_journey_query = await Database.connection('db_reader')
                                            .select("dj.id")
                                            .from("daa_user_point as dup")
                                            .join("course as c", "c.id", "dup.module_id")
                                            .join("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                            .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                            .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                            .join("daa_journey_cohort_enrols as djce", "djce.journey_id", "dj.id")
                                            .join("cohort as ch", "ch.id", "djce.cohort_id")
                                            .join("cohort_members as cm", "cm.cohortid", "ch.id")
                                            .join("user as u", "u.id", "cm.userid")
                                            .where("dj.visible", 1)
                                            .where("dc.visible", 1)
                                            .where("c.visible", 1)
                                            .where("u.id", user_id)
        for(let index in get_journey_query){
            journey_id.push(get_journey_query[index].id)
            const get_module_id = await Database.connection('db_reader')
                                            .select("dcm.module_id")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                            .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                            .join("course as c", "c.id", "dcm.module_id")
                                            .where("dj.id", journey_id)
                                            .where("dj.visible", 1)
                                            .where("dc.visible", 1)
                                            .where("c.visible", 1)
            let module_id_data = []
            for(let index in get_module_id){
                module_id_data.push(get_module_id[index].module_id)
            }
            //Get Module Point
            const get_module_points = await Database.connection('db_reader')
                                                .sum("dup.point as total")
                                                .from("daa_user_point as dup")
                                                .whereIn("dup.module_id", module_id_data)
                                                .where("dup.user_id", user_id)
            let total_module_point = 0
            for(let index in get_module_points){
                if(get_module_points[index].total != null){
                    total_module_point = get_module_points[index].total
                }
            }
            //Get Bage Point
            const get_badge_points = await Database.connection('db_reader')
                                                .sum("dbpc.point as total")
                                                .from("daa_badge_point_claim as dbpc")
                                                .join("daa_badges as db", "dbpc.badge_id", "db.id")
                                                .where("dbpc.user_id", user_id)
                                                .where("db.daa_journey_id", journey_id)
                                                .where("db.visible", 1)
            let total_badge_point = 0
            for(let index in get_badge_points){
                total_badge_point = get_badge_points[index].total
            }
            //Get History Point
            const get_history_point = await Database.connection('db_reader')
                                                .sum("drh.point as total")
                                                .from("daa_reward_history as drh")
                                                .where("drh.user_id", user_id)
                                                .where("drh.journey_id", journey_id)
                                                .whereIn("drh.redeem_status", [0,1])
            let total_history_point = 0
            for(let index in get_history_point){
                total_history_point = get_history_point[index].total
            }
            //Check Current Point
            let current_point = (total_module_point + total_badge_point) - total_history_point
            if(current_point < 0){
                current_point = 0
            }
            if(current_point > 0){
                const gt_journey = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_journeys")
                                            .where("id", journey_id)
                for(let index in gt_journey){
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'

                    if(gt_journey[index].thumbnail != 0){
                        gt_journey[index].thumbnail = url+gt_journey[index].thumbnail
                    }else{
                        gt_journey[index].thumbnail = ""
                    }
                    var element = {}
                    element.id = gt_journey[index].id
                    element.name = gt_journey[index].name
                    element.thumbnail = gt_journey[index].thumbnail
                    element.point = current_point

                    data.push(element)
                }
            }
            total_point = tot_point+current_point
        }
        const get_journey_non_endroll = await Database.connection('db_reader')
                                                    .select("dj.id")
                                                    .from("daa_user_point as dup")
                                                    .join("course as c", "c.id", "dup.module_id")
                                                    .join("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                                    .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                                    .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                                    .where("dj.visible", 1)
                                                    .where("dc.visible", 1)
                                                    .where("c.visible", 1)
                                                    .where("dup.user_id", user_id)
                                                    .whereNotIn("dj.id", journey_id)
        let id_journey_non_endroll = []
        for(let index in get_journey_non_endroll){
            id_journey_non_endroll.push(get_journey_non_endroll[index].id)
        }
        const get_module_id_content = await Database.connection('db_reader')
                                                .select("c.id")
                                                .from("course as c")
                                                .join("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                                .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                                .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                                .where("dj.visible", 1)
                                                .where("c.visible", 1)
                                                .where("dc.visible", 1)
        let id_get_module_id_content = []
        for(let index in get_module_id_content){
            id_get_module_id_content.push(get_module_id_content[index].id)
        }
        //Get Content Module Point
        const get_module_points_content = await Database.connection('db_reader')
                                                    .sum("dup.point as total")
                                                    .from("daa_user_point as dup")
                                                    .where("dup.user_id", user_id)
                                                    .whereNotIn("dup.module_id", module_id)
                                                    .whereIn("dup.module_id", id_get_module_id_content)
        let total_module_point_content = 0
        for(let index in get_module_points_content){
            total_module_point_content = get_module_points_content[index].total
        }
        //Get Content Badge Point
        const get_badge_points_contnet = await Database.connection('db_reader')
                                            .sum("dbpc.point as total")
                                            .from("daa_badge_point_claim as dbpc")
                                            .join("daa_badges as db", "dbpc.badge_id", "db.id")
                                            .where("dbpc.user_id", user_id)
                                            .whereIn("db.daa_journey_id", journey_id)
                                            .where("db.visible", 1)
        let total_badge_point_content = 0
        for(let index in get_badge_points_contnet){
            total_badge_point_content = get_badge_points_contnet[index].total
        }
        //Get Content History Point
        const get_history_points_content = await Database.connection('db_reader')
                                                    .sum("drh.point as total")
                                                    .from("daa_reward_history as drh")
                                                    .where("drh.user_id", user_id)
                                                    .whereIn("drh.journey_id", journey_id)
                                                    .whereIn("drh.redeem_status", [0,1])
        let total_history_point_content = 0
        for(let index in get_history_points_content){
            total_history_point_content = get_history_points_content[index].total
        }
        //Check Content Point
        let current_point_content = (total_module_point_content + total_badge_point_content) - total_history_point_content
        if(current_point_content < 0){
            current_point_content = 0
        }
        if(current_point_content > 0){
            const url = Env.get('APP_URL')+'/uploads/assets/images/'
            var element = {}
            element.id = 0
            element.name = "Content Library"
            element.thumbnail = url+"/logoutama.png"
            element.point = current_point_content
            data.push(element)
        }
        const total_last_point = total_point + current_point_content
        let data_result = []
        var element = {}
        element.point_extra = total_last_point
        element.program_point = data
        data_result.push(element)
        
        return response.send({status: 200, message: "Ok", data: element})
    }
}

module.exports = PointExtraController
