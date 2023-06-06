'use strict'
const BadgeUser = use('App/Models/DaaBadgeUser')
const CourseModule = use('App/Models/DaaCourseModule')
const Env = use('Env')
const Database = use('Database')

class AchievementController {

    module = async ({auth, response, params}) => {
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
        let completed_id = 0
        const authUser = auth.user.toJSON()
        
        // const test = this.getProgramPoint(params.id, authUser.id)
        // return test

        const query = await Database.connection('db_reader')
                                .select("db.id", "db.daa_journey_id", "db.daa_course_id AS course_id", "db.module_id", "db.name", "db.badgetype", "db.note", "db.logo AS thumbnail", "db.point", "course.fullname AS module_name", "db.created_at as db_created_at")
                                .from("daa_badge_users")
                                .join('daa_badges as db', 'daa_badge_users.daa_badge_id', 'db.id')
                                .join('daa_courses', 'daa_courses.id', 'db.daa_course_id')
                                .join('course', 'course.id', 'db.module_id')
                                .where('db.visible', 1)
                                .where('daa_badge_users.userid', authUser.id)
                                .whereIn('db.badgetype', [3, 5])
                                .where('db.daa_journey_id', params.id)
                                .whereNotNull('db.daa_course_id')
                                .whereNotNull('db.module_id')
        var complete_data = []
        var ids = []
        var complete_module_id = []
        
        if (query != 0) {
            for(let index in query){
                if (query[index].point != 0) {
                    query[index].point = 1
                }else{
                    query[index].point = 0
                }
                if (query[index].thumbnail) {
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    query[index].thumbnail = url+query[index].thumbnail
                }else{
                    query[index].thumbnail = ""
                }
                const is_claimed = await Database.connection('db_reader')
                .select('*')
                .from('daa_badge_point_claim')
                .where('badge_id', query[index].id)
            
                let status
                if (is_claimed != 0) {
                    status = 1
                }else{
                    status = 0
                }
                let created_at = query[index].db_created_at.getDate()+" "+month[query[index].db_created_at.getMonth()+1]+" "+query[index].db_created_at.getFullYear()+" "+query[index].db_created_at.getHours()+":"+query[index].db_created_at.getMinutes()+":"+query[index].db_created_at.getSeconds()

                var element = {}
                element.id = query[index].id
                element.daa_journey_id = query[index].daa_journey_id
                element.course_id = query[index].course_id
                element.module_id = query[index].module_id
                element.name = query[index].name
                element.badgetype = query[index].badgetype
                element.note = query[index].module_name
                element.module_name = query[index].module_name
                element.thumbnail = query[index].thumbnail
                element.point = query[index].point
                element.status_point = status
                element.created_at = created_at
                
                complete_data.push(element)
                ids.push(query[index].id)
                complete_module_id.push(query[index].module_id)
            }
        }

        const query_incomplete = await Database.connection('db_reader')
                                        .select("db.id, db.daa_journey_id, db.name, dj.name as journey_name, db.badgetype, db.note, db.logo AS thumbnail, db.created_at as db_created_at, db.point")
                                        .from("daa_course_modules as dcm")
                                        .join("course as c", "c.id", "dcm.module_id")
                                        .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                        .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                        .join("daa_journey_cohort_enrols as djce", "djce.journey_id", "dj.id")
                                        .join("cohort_members as cm", "cm.cohortid", "djce.cohort_id")
                                        .join("daa_badges as db", "db.module_id", "dcm.module_id")
                                        .where('db.visible', 1)
                                        .whereIn('db.badgetype', [3, 5])
                                        .whereNotIn('db.id', ids)
                                        .where('db.daa_journey_id', params.id)
                                        .where('cm.userid', authUser.id)
                                        .whereNotNull('db.daa_course_id')
                                        .whereNotNull('db.module_id')
                                        // .groupBy("db.id")

        var incomplete_data = []

        if (query_incomplete != 0) {
            for(let index in query_incomplete){
                if (query_incomplete[index].point != 0) {
                    query_incomplete[index].point = 1
                }else{
                    query_incomplete[index].point = 0
                }
                if (query_incomplete[index].thumbnail) {
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    query_incomplete[index].thumbnail = url+query_incomplete[index].thumbnail
                }else{
                    query_incomplete[index].thumbnail = ""
                }
                const is_claimed = await Database.connection('db_reader')
                .select('*')
                .from('daa_badge_point_claim')
                .where('badge_id', query_incomplete[index].id)
            
                let status
                if (is_claimed != 0) {
                    status = 1
                }else{
                    status = 0
                }
                let created_at = query[index].db_created_at.getDate()+" "+month[query[index].db_created_at.getMonth()+1]+" "+query[index].db_created_at.getFullYear()+" "+query[index].db_created_at.getHours()+":"+query[index].db_created_at.getMinutes()+":"+query[index].db_created_at.getSeconds()

                var element = {}
                element.id = query_incomplete[index].id
                element.daa_journey_id = query_incomplete[index].daa_journey_id
                element.course_id = query_incomplete[index].course_id
                element.module_id = query_incomplete[index].module_id
                element.name = query_incomplete[index].name
                element.badgetype = query_incomplete[index].badgetype
                element.note = query_incomplete[index].module_name
                element.module_name = query_incomplete[index].module_name
                element.thumbnail = query_incomplete[index].thumbnail
                element.point = query_incomplete[index].point
                element.status = status
                element.created_at = created_at
                
                incomplete_data.push(element)
            }
        }
        const complete = complete_data.length
        const total = incomplete_data.length+complete

        var array_module = []
        const where = await Database.connection('db_reader')
                                .select("dcm.module_id")
                                .from("daa_journeys as dj")
                                .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                .where("dj.id", params.id)
        // return where
        if(where){
            for(let index in where){
                array_module.push(where[index].module_id)
            }
        }
        const query1 = await Database.connection('db_reader')
                                .sum("dup.point as total")
                                .from("daa_user_point as dup")
                                .whereIn("dup.module_id", array_module)
                                .where("dup.user_id", authUser.id)
        let total_module_point = 0
        for(let index in query1){
            if (query1[index].total != 0 ) {
                total_module_point = query1[index].total
            }
        }

        const get_badge_points = await Database.connection('db_reader')
                                            .sum("dbpc.point as total")
                                            .from("daa_badge_point_claim as dbpc")
                                            .join("daa_badges as db", "dbpc.badge_id", "db.id")
                                            .where("dbpc.user_id", authUser.id)
                                            .where("db.daa_journey_id", params.id)
        let total_badge_point = 0
        for(let index in get_badge_points){
            if(get_badge_points[index].total != 0){
                total_badge_point = get_badge_points[index].total
            }
        }

        const get_history_points = await Database.connection('db_reader')
                                            .sum("drh.point as total")
                                            .from("daa_reward_history as drh")
                                            .where("drh.user_id", authUser.id)
                                            .where("drh.journey_id", params.id)
                                            .whereIn("drh.redeem_status", [0, 1])
        let total_history_point = 0
        for(let index in get_history_points){
            if(get_history_points[index].total != 0){
                total_history_point = get_history_points[index].total
            }
        }

        let current_point = (total_module_point+total_badge_point) - total_history_point
        if (current_point < 0) {
            current_point = 0
        }
        // const p_point = this.getProgramPoint(params.id, authUser.id)
        let valueDatatable = {
            program_point       : current_point,
            complete_badges     : complete_data,
            incomplete_badges   : incomplete_data,
            total_complete      : complete_data.length,
            total_incomplete    : incomplete_data.length,
            total               : total
          };

        return response.send({status: 200, message: "Ok", data: valueDatatable})

    }

    journey = async ({auth, response, params}) =>{
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
        const authUser = auth.user.toJSON()
        

        const query_complete_data = await Database.connection('db_reader')
                                        .select("db.id", "db.daa_journey_id", "db.name", "dj.name as journey_name", "db.badgetype", "db.note", "db.logo AS thumbnail", "db.created_at as db_created_at", "db.point")
                                        .from("daa_badge_users as bu")
                                        .join("daa_badges as db", "db.id", "bu.daa_badge_id")
                                        .join("daa_journeys as dj", "dj.id", "db.daa_journey_id")
                                        .where("db.visible", 1)
                                        .where("bu.userid", authUser.id)
                                        .whereIn("db.badgetype", [1, 4, 5])
                                        .where("db.daa_journey_id", params.id)
                                        .whereNull("db.daa_course_id")
                                        .whereNull("db.module_id")
        var complete_data = []
        var ids = []

        if(query_complete_data != 0){
            // return complete_data
            for(let index in query_complete_data){
                if (query_complete_data[index].point != 0) {
                    query_complete_data[index].point = 1
                }else{
                    query_complete_data[index].point = 0
                }
                if (query_complete_data[index].thumbnail) {
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    query_complete_data[index].thumbnail = url+query_complete_data[index].thumbnail
                }else{
                    query_complete_data[index].thumbnail = ""
                }
                const is_claimed = await Database.connection('db_reader')
                .select('*')
                .from('daa_badge_point_claim')
                .where('badge_id', query_complete_data[index].id)
            
                let status
                if (is_claimed != 0) {
                    status = 1
                }else{
                    status = 0
                }
                let created_at = query[index].db_created_at.getDate()+" "+month[query[index].db_created_at.getMonth()+1]+" "+query[index].db_created_at.getFullYear()+" "+query[index].db_created_at.getHours()+":"+query[index].db_created_at.getMinutes()+":"+query[index].db_created_at.getSeconds()

                var element = {}
                element.id = query_complete_data[index].id
                element.daa_journey_id = query_complete_data[index].daa_journey_id
                element.course_id = query_complete_data[index].course_id
                element.module_id = query_complete_data[index].module_id
                element.name = query_complete_data[index].name
                element.badgetype = query_complete_data[index].badgetype
                element.note = query_complete_data[index].journey_name
                element.module_name = query_complete_data[index].module_name
                element.thumbnail = query_complete_data[index].thumbnail
                element.point = query_complete_data[index].point
                element.status = status
                element.created_at = created_at
                
                complete_data.push(element)
                ids.push(query_complete_data[index].id)
            }
        }

        const query_incomplete = await Database.connection('db_reader')
                                            .select("db.id", "db.daa_journey_id", "db.name", "dj.name as journey_name", "db.badgetype", "db.note", "db.logo AS thumbnail", "db.created_at as db_created_at", "db.point")
                                            .from("daa_badges as db")
                                            .innerJoin("daa_journeys as dj", "dj.id", "db.daa_journey_id")
                                            .innerJoin("daa_journey_cohort_enrols as jce", "jce.journey_id", "db.daa_journey_id")
                                            .innerJoin("cohort_members as cm", "cm.cohortid", "jce.cohort_id")
                                            .where("db.visible", 1)
                                            .whereNotIn("db.id", ids)
                                            .where("cm.userid", authUser.id)
                                            .whereIn("db.badgetype", [1, 4, 5])
                                            .where("db.daa_journey_id", params.id)
                                            .whereNull("db.daa_course_id")
                                            .whereNull("db.module_id")
        var incomplete_data = []
        if (query_incomplete != 0 ) {
            for(let index in query_incomplete){
                if (query_incomplete[index].point != 0) {
                    query_incomplete[index].point = 1
                }else{
                    query_incomplete[index].point = 0
                }
                if (query_incomplete[index].thumbnail) {
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    query_incomplete[index].thumbnail = url+query_incomplete[index].thumbnail
                }else{
                    query_incomplete[index].thumbnail = ""
                }
                const is_claimed = await Database.connection('db_reader')
                .select('*')
                .from('daa_badge_point_claim')
                .where('badge_id', query_incomplete[index].id)
            
                let status
                if (is_claimed != 0) {
                    status = 1
                }else{
                    status = 0
                }
                let created_at = query[index].db_created_at.getDate()+" "+month[query[index].db_created_at.getMonth()+1]+" "+query[index].db_created_at.getFullYear()+" "+query[index].db_created_at.getHours()+":"+query[index].db_created_at.getMinutes()+":"+query[index].db_created_at.getSeconds()

                var element = {}
                element.id = query_incomplete[index].id
                element.daa_journey_id = query_incomplete[index].daa_journey_id
                element.course_id = query_incomplete[index].course_id
                element.module_id = query_incomplete[index].module_id
                element.name = query_incomplete[index].name
                element.badgetype = query_incomplete[index].badgetype
                element.note = query_incomplete[index].journey_name
                element.module_name = query_incomplete[index].module_name
                element.thumbnail = query_incomplete[index].thumbnail
                element.point = query_incomplete[index].point
                element.status = status
                element.created_at = created_at
                
                incomplete_data.push(element)
            }
        }
        const complete = complete_data.length
        const total = incomplete_data.length+complete

        var array_module = []
        const where = await Database.connection('db_reader')
                                .select("dcm.module_id")
                                .from("daa_journeys as dj")
                                .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                .where("dj.id", params.id)
        // return where
        if(where){
            for(let index in where){
                array_module.push(where[index].module_id)
            }
        }
        const query = await Database.connection('db_reader')
                                .sum("dup.point as total")
                                .from("daa_user_point as dup")
                                .whereIn("dup.module_id", array_module)
                                .where("dup.user_id", authUser.id)
        let total_module_point = 0
        for(let index in query){
            if (query[index].total != 0 ) {
                total_module_point = query[index].total
            }
        }

        const get_badge_points = await Database.connection('db_reader')
                                            .sum("dbpc.point as total")
                                            .from("daa_badge_point_claim as dbpc")
                                            .join("daa_badges as db", "dbpc.badge_id", "db.id")
                                            .where("dbpc.user_id", authUser.id)
                                            .where("db.daa_journey_id", params.id)
        let total_badge_point = 0
        for(let index in get_badge_points){
            if(get_badge_points[index].total != 0){
                total_badge_point = get_badge_points[index].total
            }
        }

        const get_history_points = await Database.connection('db_reader')
                                            .sum("drh.point as total")
                                            .from("daa_reward_history as drh")
                                            .where("drh.user_id", authUser.id)
                                            .where("drh.journey_id", params.id)
                                            .whereIn("drh.redeem_status", [0, 1])
        let total_history_point = 0
        for(let index in get_history_points){
            if(get_history_points[index].total != 0){
                total_history_point = get_history_points[index].total
            }
        }

        let current_point = (total_module_point+total_badge_point) - total_history_point
        if (current_point < 0) {
            current_point = 0
        }
        // const p_point = this.getProgramPoint(params.id, authUser.id)
        let valueDatatable = {
            program_point       : current_point,
            complete_badges     : complete_data,
            incomplete_badges   : incomplete_data,
            total_complete      : complete_data.length,
            total_incomplete    : incomplete_data.length,
            total               : total
          };

        return response.send({status: 200, message: "Ok", data: valueDatatable})
    }

    course = async ({auth, response, params}) =>{
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
        const authUser = auth.user.toJSON()
        

        const query_complete = await Database.connection('db_reader')
                                        .select("db.id", "db.daa_journey_id", "dc.id AS course_id", "db.name", "dc.name AS course_name", "db.badgetype", "db.note", "db.logo AS thumbnail", "db.created_at as db_created_at", "db.point")
                                        .from("daa_badge_users as bu")
                                        .join("daa_badges as db", "db.id", "bu.daa_badge_id")
                                        .join("daa_courses as dc", "dc.id", "db.daa_course_id")
                                        .where("db.visible", 1)
                                        .where("bu.userid", authUser.id)
                                        .whereIn("db.badgetype", [2, 4, 5])
                                        .where("db.daa_journey_id", params.id)
                                        .whereNotNull("db.daa_course_id")
                                        .whereNull("db.module_id")
        var complete_data = []
        var ids = []
        if (query_complete != 0) {
            for(let index in query_complete){
                if (query_complete[index].point != 0) {
                    query_complete[index].point = 1
                }else{
                    query_complete[index].point = 0
                }
                if (query_complete[index].thumbnail) {
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    query_complete[index].thumbnail = url+query_complete[index].thumbnail
                }else{
                    query_complete[index].thumbnail = ""
                }
                const is_claimed = await Database.connection('db_reader')
                .select('*')
                .from('daa_badge_point_claim')
                .where('badge_id', query_complete[index].id)
            
                let status
                if (is_claimed != 0) {
                    status = 1
                }else{
                    status = 0
                }
                let created_at = query[index].db_created_at.getDate()+" "+month[query[index].db_created_at.getMonth()+1]+" "+query[index].db_created_at.getFullYear()+" "+query[index].db_created_at.getHours()+":"+query[index].db_created_at.getMinutes()+":"+query[index].db_created_at.getSeconds()

                var element = {}
                element.id = query_complete[index].id
                element.daa_journey_id = query_complete[index].daa_journey_id
                element.course_id = query_complete[index].course_id
                element.module_id = query_complete[index].module_id
                element.name = query_complete[index].name
                element.badgetype = query_complete[index].badgetype
                element.note = query_complete[index].journey_name
                element.module_name = query_complete[index].module_name
                element.thumbnail = query_complete[index].thumbnail
                element.point = query_complete[index].point
                element.status = status
                element.created_at = created_at
                
                complete_data.push(element)
                ids.push(query_complete[index].id)
            }
        }
        
        const query_incomplete = await Database.connection('db_reader')
                                            .select("db.id", "db.daa_journey_id", "dc.id AS course_id", "db.name", "dc.name AS course_name", "db.badgetype", "db.note", "db.logo AS thumbnail", "db.created_at", "db.point")
                                            .from("daa_badges as db")
                                            .innerJoin("daa_courses as dc", "dc.id", "db.daa_course_id")
                                            .innerJoin("daa_journeys as dj", "dj.id", "db.daa_journey_id")
                                            .innerJoin("daa_journey_cohort_enrols as jce", "jce.journey_id", "db.daa_journey_id")
                                            .innerJoin("cohort_members as cm", "cm.cohortid", "jce.cohort_id")
                                            .where("db.visible", 1)
                                            .whereNotIn("db.id", ids)
                                            .where("cm.userid", authUser.id)
                                            .whereIn("db.badgetype", [2, 4, 5])
                                            .where("db.daa_journey_id", params.id)
                                            .whereNotNull("db.daa_course_id")
                                            .whereNull("db.module_id")
        // return query_incomplete
        var incomplete_data = []
        if (query_incomplete != 0 ) {
            for(let index in query_incomplete){
                if (query_incomplete[index].point != 0) {
                    query_incomplete[index].point = 1
                }else{
                    query_incomplete[index].point = 0
                }
                if (query_incomplete[index].thumbnail) {
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    query_incomplete[index].thumbnail = url+query_incomplete[index].thumbnail
                }else{
                    query_incomplete[index].thumbnail = ""
                }
                const is_claimed = await Database.connection('db_reader')
                .select('*')
                .from('daa_badge_point_claim')
                .where('badge_id', query_incomplete[index].id)
            
                let status
                if (is_claimed != 0) {
                    status = 1
                }else{
                    status = 0
                }
                let created_at = query[index].db_created_at.getDate()+" "+month[query[index].db_created_at.getMonth()+1]+" "+query[index].db_created_at.getFullYear()+" "+query[index].db_created_at.getHours()+":"+query[index].db_created_at.getMinutes()+":"+query[index].db_created_at.getSeconds()

                var element = {}
                element.id = query_incomplete[index].id
                element.daa_journey_id = query_incomplete[index].daa_journey_id
                element.course_id = query_incomplete[index].course_id
                element.module_id = query_incomplete[index].module_id
                element.name = query_incomplete[index].name
                element.badgetype = query_incomplete[index].badgetype
                element.note = query_incomplete[index].journey_name
                element.module_name = query_incomplete[index].module_name
                element.thumbnail = query_incomplete[index].thumbnail
                element.point = query_incomplete[index].point
                element.status = status
                element.created_at = created_at
                
                incomplete_data.push(element)
            }
        }
        const complete = complete_data.length
        const total = incomplete_data.length+complete

        var array_module = []
        const where = await Database.connection('db_reader')
                                .select("dcm.module_id")
                                .from("daa_journeys as dj")
                                .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                .where("dj.id", params.id)
        // return where
        if(where){
            for(let index in where){
                array_module.push(where[index].module_id)
            }
        }
        const query = await Database.connection('db_reader')
                                .sum("dup.point as total")
                                .from("daa_user_point as dup")
                                .whereIn("dup.module_id", array_module)
                                .where("dup.user_id", authUser.id)
        let total_module_point = 0
        for(let index in query){
            if (query[index].total != 0 ) {
                total_module_point = query[index].total
            }
        }

        const get_badge_points = await Database.connection('db_reader')
                                            .sum("dbpc.point as total")
                                            .from("daa_badge_point_claim as dbpc")
                                            .join("daa_badges as db", "dbpc.badge_id", "db.id")
                                            .where("dbpc.user_id", authUser.id)
                                            .where("db.daa_journey_id", params.id)
        let total_badge_point = 0
        for(let index in get_badge_points){
            if(get_badge_points[index].total != 0){
                total_badge_point = get_badge_points[index].total
            }
        }

        const get_history_points = await Database.connection('db_reader')
                                            .sum("drh.point as total")
                                            .from("daa_reward_history as drh")
                                            .where("drh.user_id", authUser.id)
                                            .where("drh.journey_id", params.id)
                                            .whereIn("drh.redeem_status", [0, 1])
        let total_history_point = 0
        for(let index in get_history_points){
            if(get_history_points[index].total != 0){
                total_history_point = get_history_points[index].total
            }
        }

        let current_point = (total_module_point+total_badge_point) - total_history_point
        if (current_point < 0) {
            current_point = 0
        }
        // const p_point = this.getProgramPoint(params.id, authUser.id)
        let valueDatatable = {
            program_point       : current_point,
            complete_badges     : complete_data,
            incomplete_badges   : incomplete_data,
            total_complete      : complete_data.length,
            total_incomplete    : incomplete_data.length,
            total               : total
          };

        return response.send({status: 200, message: "Ok", data: valueDatatable})
    }

    checkClaimedPoint = async (badge_id) => {
        

        const is_claimed = await Database.connection('db_reader')
            .select('*')
            .from('daa_badge_point_claim')
            .where('badge_id', badge_id)
        
        let status
        if (is_claimed != 0) {
            status = 1
        }else{
            status = 0
        }

        return status
    }

    getProgramPoint = async (journey_id, user_id) => {
        
        var array_module = []
        const where = await Database.connection('db_reader')
                                .select("dcm.module_id")
                                .from("daa_journeys as dj")
                                .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                .where("dj.id", journey_id)
        // return where
        if(where){
            for(let index in where){
                array_module.push(where[index].module_id)
            }
        }
        const query = await Database.connection('db_reader')
                                .sum("dup.point as total")
                                .from("daa_user_point as dup")
                                .whereIn("dup.module_id", array_module)
                                .where("dup.user_id", user_id)
        let total_module_point = 0
        for(let index in query){
            if (query[index].total != 0 ) {
                total_module_point = query[index].total
            }
        }

        const get_badge_points = await Database.connection('db_reader')
                                            .sum("dbpc.point as total")
                                            .from("daa_badge_point_claim as dbpc")
                                            .join("daa_badges as db", "dbpc.badge_id", "db.id")
                                            .where("dbpc.user_id", user_id)
                                            .where("db.daa_journey_id", journey_id)
        let total_badge_point = 0
        for(let index in get_badge_points){
            if(get_badge_points[index].total != 0){
                total_badge_point = get_badge_points[index].total
            }
        }

        const get_history_points = await Database.connection('db_reader')
                                            .sum("drh.point as total")
                                            .from("daa_reward_history as drh")
                                            .where("drh.user_id", user_id)
                                            .where("drh.journey_id", journey_id)
                                            .whereIn("drh.redeem_status", [0, 1])
        let total_history_point = 0
        for(let index in get_history_points){
            if(get_history_points[index].total != 0){
                total_history_point = get_history_points[index].total
            }
        }

        let current_point = (total_module_point+total_badge_point) - total_history_point
        if (current_point < 0) {
            current_point = 0
        }
        return current_point
    }

}

module.exports = AchievementController
