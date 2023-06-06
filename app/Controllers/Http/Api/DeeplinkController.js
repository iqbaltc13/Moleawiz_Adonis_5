'use strict'

const Database = use('Database')
const Env = use('Env')
const { validate } = use('Validator')
const Encryption = use('Encryption')

class DeeplinkController {
    //check module data
    checkLink = async ({auth, request, response}) => {
        const { module_id } = request.all()
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const rules = {
            module_id: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "validator_fails", data: validation.messages()})            
        }else{
            //decrypt module id
            const decrypted_id = Encryption.decrypt(module_id)
        	//First, check if user has enroled
            const query = await Database.connection('db_reader')
                                    .select("dj.id AS journey_id", "dj.name AS journey_name", "dc.id AS course_id", "dc.name AS course_name", "c.id AS module_id", "c.module_type")
                                    .from("course as c")
                                    .innerJoin("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                    .innerJoin("daa_courses as dc", "dc.id", "dcm.course_id")
                                    .innerJoin("daa_journeys as dj", "dj.id", "dc.journey_id")
                                    .innerJoin("daa_journey_cohort_enrols as jce", "jce.journey_id", "dj.id")
                                    .innerJoin("cohort as ch", "ch.id", "jce.cohort_id")
                                    .innerJoin("cohort_members as chm", "chm.cohortid", "ch.id")
                                    .innerJoin("user as u", "u.id", "chm.userid")
                                    .where("c.id", decrypted_id)
                                    .where("u.id", user_id)
                                    .groupBy("dc.id")
                                    .groupBy("dj.id")
                                    .orderBy("dc.created_at", "DESC")
                                    .limit(1)
            if(query != 0){
        		//User enrolled
                for(let index in query){
                    query[index].flag = "learning_journey"
                }
                return response.send({status: 200, message: "Ok", data: query})
            }else{
        		//User not enrolled, then use content library
                const query = await Database.connection('db_reader')
                                        .select("cl.id AS category_id", "cl.name AS category_name", "clm.module_id")
                                        .from("daa_content_library_module as clm")
                                        .innerJoin("daa_content_library as cl", "cl.id", "clm.content_library_id")
                                        .where("clm.module_id", module_id)
                                        .orderBy("clm.id", "DESC")
                                        .limit(1)
                if(query != 0){
        			//Module found in content library
                    for(let index in query){
                        query[index].flag = "content_library"
                    }
                    return response.send({status: 200, message: "Ok", data: query})
                }else{
                    //Module not found
                    return response.send({status: 400, message: "Module not found!", data: []})
                }
            }
        }
    }
}

module.exports = DeeplinkController
