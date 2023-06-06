'use strict'

const Database = use('Database')
const Env = use('Env')

class TeamMonitoringController {
    //Get List Team Monitoring Data
    index = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const team_query = await Database.connection('db_reader')
                                    .select("uid.userid", "u.username", "u.email", "u.firstname", "u.lastname")
                                    .from("user_info_data as uid")
                                    .join("user_info_field as uif", "uid.fieldid", "uif.id")
                                    .join("user as u", "u.id", "uid.userid")
                                    .where("uif.shortname", "superior")
                                    .where("uid.data", authUser.id)
        let data = []
        if (team_query != 0) {
            for(let index in team_query){
                const get_program_query = await Database.connection('db_reader')
                                                    .select("daa_journeys.id", "daa_journeys.name", "daa_journeys.description", "daa_journeys.thumbnail")
                                                    .from("daa_journeys")
                                                    .join("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                                    .join("cohort", "cohort.id", "daa_journey_cohort_enrols.cohort_id")
                                                    .join("cohort_members", "cohort_members.cohortid", "cohort.id")
                                                    .join("user","user.id", "cohort_members.userid")
                                                    .where("user.id", team_query[index].userid)
                                                    .where("user.deleted", 0)
                                                    .where("daa_journeys.visible", 1)
                                                    .orderBy("daa_journeys.sort")
                if(get_program_query != 0){
                    for(let index in get_program_query){
                        var element = {}
                        element.id = get_program_query[index].id
                        element.name = get_program_query[index].name
                        element.description = get_program_query[index].description
                        element.thumbnail = get_program_query[index].thumbnail

                        const get_total_program = await Database.connection('db_reader')
                                                            .select("c.id")
                                                            .from("user as u")
                                                            .join("cohort_members as cm", "u.id", "cm.userid")
                                                            .join("cohort as ch", "cm.cohortid", "ch.id")
                                                            .join("daa_journey_cohort_enrols as djce", "ch.id", "djce.cohort_id")
                                                            .join("daa_journeys as dj", "djce.journey_id", "dj.id")
                                                            .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                                            .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                                            .join("course as c", "dcm.module_id", "c.id")
                                                            .where("u.id", authUser.id)
                                                            .where("dj.visible", 1)
                                                            .where("c.visible", 1)
                                                            .where("dc.visible", 1)
                                                            .where("c.module_type", 1)
                        const total_all_module = get_total_program.length
                        element.total_module = total_all_module
                        let ids = []
                        for(let index in get_total_program){
                            ids.push(get_total_program[index].id)
                        }
                        const get_complete_program = await Database.connection('db_reader')
                                                                .select("*")
                                                                .from("daa_module_logs")
                                                                .where("user_id", team_query[index].userid)
                                                                .whereIn("module_id", ids)
                                                                .where("is_completed", 1)
                        const total_complete_module = get_complete_program.length
                        element.total_complete = total_complete_module
                        element.percent_completed = (total_complete_module / total_all_module) * 100
                        data.push(element)

                    }
                }
            }
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
}

module.exports = TeamMonitoringController
