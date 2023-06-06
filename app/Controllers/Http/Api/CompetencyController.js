'use strict'

const Database = use('Database')
const Env = use('Env')
const User = use('App/Models/User')


// const HttpContextContract = use('@ioc:Adonis/Core/HttpContext')

class CompetencyController {

    job_role_competency = async ({response, auth, params}) => {
        const authUser = auth.user.toJSON()

        const id = await Database.connection('db_reader')
                                .select("*")
                                .from("daa_job_role_user")
                                .where("user_id", authUser.id)
                                .where("visible", 1)
                                .limit(1)
        let job_role_id = 1
        if (id) {
            for(let index in id){
                job_role_id = id[index].id

            }
        }
        const query = await Database.connection('db_reader')
                                .select("*")
                                .from("cohort_members as cm")
                                .join("daa_journey_cohort_enrols as djce", "cm.cohortid", "djce.cohort_id")
                                .join("daa_journeys as dj", "djce.journey_id", "dj.id")
                                .join("daa_courses as dc", "dj.id", "dc.journey_id")
                                .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                                .join("daa_module_competency as dmc", "dmc.module_id", "dcm.module_id")
                                .join("daa_competency as dcp", "dmc.competency_id", "dcp.id")
                                .join("daa_job_role_competency as djrc", "dcp.id", "djrc.competency_id")
                                .where("dj.visible", 1)
                                .where("dj.id", params.id)
                                .where("djrc.job_role_id", job_role_id)
                                .where("cm.userid", authUser.id)
        if (query == !0) {
            return response.send({status: 200, message: "Ok", data: query})
        }else{
            return response.send({status: 400, message: "data not found"})
        }
    }

    competency_progress = async ({response, auth, params}) => {
        const authUser = auth.user.toJSON()

        const id = await Database.connection('db_reader')
                                .select("*")
                                .from("daa_job_role_user")
                                .where("user_id", authUser.id)
                                .where("visible", 1)
                                .limit(1)
        let job_role_id = 1
        if (id) {
            for(let index in id){
                job_role_id = id[index].id

            }
        }
        return job_role_id
    }
}

module.exports = CompetencyController
