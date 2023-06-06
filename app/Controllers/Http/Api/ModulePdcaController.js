'use strict'

const Database = use('Database')
const Env = use('Env')
const ModulePdca = use('App/Models/ModulePdca')
// const HttpContextContract = use('@ioc:Adonis/Core/HttpContext')

class ModulePdcaController {

    getSupervisor = async ({response, params}) => {

        const query = await Database.connection('db_reader')
                            .select("u.id", "u.firstname", "u.lastname", "uid.data")
                            .from("user_info_data as uid")
                            .join("user as u", "u.username", "uid.data")
                            .join("cohort_members as cm", "u.id", "cm.userid")
                            .join("cohort as ch", "cm.cohortid", "ch.id")
                            .join("daa_journey_cohort_enrols as djce", "ch.id", "djce.cohort_id")
                            .join("daa_journeys as dj", "djce.journey_id", "dj.id")
                            .join("daa_courses as dc", "dj.id", "dc.journey_id")
                            .join("daa_course_modules as dcm", "dc.id", "dcm.course_id")
                            .join("course as c", "dcm.module_id", "c.id")
                            .where("uid.fieldid", 5)
                            .whereNotNull("uid.data")
                            .where("u.deleted", 0)
                            .where("c.id", params.id)
                            .groupBy("uid.data")
                            .orderBy("u.firstname")
        let data = []
        if (query != 0) {
            for(let index in query){
                if (query[index].daa_picture != 0) {
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    query[index].daa_picture = url+query[index].daa_picture
                }else{
                    query[index].daa_picture = ""
                }
                var element = {}
                element.id = query[index].id
                element.fullname = query[index].firstname+" "+query[index].lastname
                element.daa_picture = query[index].daa_picture

                data.push(element)
            }
        }
        return response.send({status: 200, message: "Ok", data: data})
    }

    addParticipant = async ({response, request}) => {
        const {user, supervisor} = request.all()
        const req_data = request.collect(['user', 'supervisor'])
        const project = await Database.connection('db_reader')
                                    .select("project_id")
                                    .from("daa_project_pdca")
                                    .orderBy("id", "DESC")
                                    .limit(1)
        let project_id
        if (project != 0) {
            for(let index in project){
                project_id = project[index].project_id+1
            }
        }else{
            project_id = 1
        }
        let project_id_response = {
            project_id: project_id
        }

        let data = []
        let tot = user.length

        if (tot > 0) {
            for(let index in user){
                var element = {}
                element.project_id = project_id
                element.supervisor = supervisor[index]
                element.user_id = user[index]
                data.push(element)
            }
        }else{
            var element = {}
            element.project_id = project_id
            element.supervisor = supervisor
            element.user_id = user
            data.push(element)
        }

        if (await ModulePdca.createMany(data)) {
            return response.send({status: 200, message: "Ok", data: project_id_response})
        }else{
            return response.send({status: 400, message: "Failed"})
        }
    }
    
    getUser = async ({response, params}) => {
        const where = await Database.connection('db_reader')
                            .select("data")
                            .from("user_info_data")
                            .where("fieldid", 5)
                            .whereNotNull("data")
                            .groupBy("data")
        let where_id = []
        for(let index in where){
            where_id.push(where[index].data)
        }
        const query = await Database.connection('db_reader')
                            .select("u.id", "u.firstname", "u.lastname", "daa_picture")
                            .from("user as u")
                            .join("cohort_members as cm", "u.id", "cm.userid")
                            .join("cohort as ch", "cm.cohortid", "ch.id")
                            .join("daa_journey_cohort_enrols as djce", "ch.id", "djce.cohort_id")
                            .join("daa_journeys as dj", "djce.journey_id", "dj.id")
                            .where("dj.id", params.id)
                            .whereNotIn("u.id", where_id)
        let data = []
        if (query.length === 0) {
            for(let index in query){
                if (query[index].message != 0) {
                    const url = Env.get('APP_URL')+'/tmp/uploads/'+query[index].id+'/profile_pic/'
                    query[index].message = url+query[index].message
                }else{
                    query[index].message = ""
                }
                var element = {}
                element.id = query[index].id
                element.fullname = query[index].firstname+" "+query[index].lastname
                element.message = query[index].message

                data.push(element)
            }
        }
        return response.send({status: 200, message: "Ok", data: data})
    }

    getParticipant = async ({response, params}) => {
        const project = await Database.connection('db_reader')
                                    .select("*")
                                    .from("daa_project_pdca")
                                    .where("project_id", params.id)
        let ids = []
        let supervisor = []
        for(let index in project){
            supervisor.push(project[index].supervisor)
            ids.push(project[index].user_id)
        }

        const query_supervisor = await Database.connection('db_reader')
                                            .select("*")
                                            .from("user")
                                            .whereIn("id", supervisor)

        let data_supervisor = []
        for(let index in query_supervisor){
            if (query_supervisor[index].daa_picture != 0) {
                const url = Env.get('APP_URL')+'/tmp/uploads/'+query_supervisor[index].id+'/profile_pic/'
                var element = {}
                element.id = query_supervisor[index].id
                element.fullname = query_supervisor[index].firstname+" "+query_supervisor[index].lastname
                element.daa_picture = url+query_supervisor[index].daa_picture
                data_supervisor.push(element)
            }else{
                var element = {}
                element.id = query_supervisor[index].id
                element.fullname = query_supervisor[index].firstname+" "+query_supervisor[index].lastname
                element.daa_picture = ""
                data_supervisor.push(element)
            }
        }

        const query_user = await Database.connection('db_reader')
                                        .select("*")
                                        .from("user")
                                        .whereIn("id", ids)
                                        .orderBy("firstname")
        let data_user = []
        for(let index in query_user){
            if (query_user[index].daa_picture) {
                const url = Env.get('APP_URL')+'/tmp/uploads/'+query_user[index].id+'/profile_pic/'
                var element = {}
                element.id = query_user[index].id
                element.fullname = query_user[index].firstname+" "+query_user[index].lastname
                element.daa_picture = url+query_user[index].daa_picture
                data_user.push(element)
            }else{
                var element = {}
                element.id = query_user[index].id
                element.fullname = query_user[index].firstname+" "+query_user[index].lastname
                element.daa_picture = ""
                data_user.push(element)
            }
        }
        let data = {
            supervisor: data_supervisor,
            user: data_user
        }
        return response.send({status: 200, message: "Ok", data: data})
    }

}

module.exports = ModulePdcaController
