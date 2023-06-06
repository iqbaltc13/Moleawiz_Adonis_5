'use strict'

const Database = use('Database')
const Env = use('Env')
const Rating = use('App/Models/DaaRatingModule')


// const HttpContextContract = use('@ioc:Adonis/Core/HttpContext')

class RatingModuleController {
    //Check Rating Module
    check_get_rating = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const query = await Database.connection('db_reader')
                            .select("has_rating")
                            .from("course")
                            .where("id", params.id)
        let data = []
        if (query[0].has_rating == 1 ) {
            //Get Rating Data
            const get_rating = await Database.connection('db_reader')
                                        .select("send_notif")
                                        .from("daa_rating_module")
                                        .where("user_id", authUser.id)
                                        .where("module_id", params.id)
            if (get_rating != 0) {
                var element = {}
                element.has_rating = query[0].has_rating
                element.is_submit = get_rating[0].send_notif
                element.is_completed = 0
                    
                data.push(element)
            }else{
                var element = {}
                element.has_rating = query[0].has_rating
                element.is_submit = 0
                element.is_completed = 0
                    
                data.push(element)
            }
        }else{
            var element = {}
            element.has_rating = query[0].has_rating
            element.is_submit = 0
            element.is_completed = 0
                
            data.push(element)  
        }
        return response.send({status: 200, message: "Ok", data: element})
    }
    //Insert Rating Review
    submit_rating = async ({auth, response, request}) => {
        const authUser = auth.user.toJSON()
        let date_now = new Date()
        const {module_id, rating_point, feedback} = request.all()
        const rating = await Rating
                                .query()
                                .where('user_id', authUser.id)
                                .where("module_id", module_id)
                                .update({ 
                                    rating_point: rating_point, 
                                    feedback: feedback,
                                    send_notif: 1,
                                    updated_at: date_now
                                })
        if (rating) {
            return response.send({status: 200, message: "Thank's for your feedback!", data: []})
        }else{
            return response.send({status: 400, message: "Failed"})
        }
    }
}

module.exports = RatingModuleController
