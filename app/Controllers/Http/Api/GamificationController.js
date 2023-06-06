'use strict'

const Database = use('Database')
const Env = use('Env')
const DaaRewardHistory = use('App/Models/DaaRewardHistory')
const { validate } = use('Validator')


class GamificationController {
    //Get Random String For Reward Code
    shuffle = async (string) => {
        var parts = string.split('');
        for (var i = parts.length; i > 0;) {
            var random = parseInt(Math.random() * i);
            var temp = parts[--i];
            parts[i] = parts[random];
            parts[random] = temp;
        }
        return parts.join('');
    }
    //Get Redeem Reward Data
    redeem_reward = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const journey_id = params.journey_id
        const reward_id = params.reward_id
        const string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let message = ""
        let data = []


        //get current point
        const my_point = this.get_program_point(journey_id, authUser.id)

        //get journey reward point
        const journey_reward_point = await Database.connection('db_reader')
                                                .select("djr.point", "djr.qty", "djr.expired_date")
                                                .from("daa_journey_reward as djr")
                                                .join("daa_reward as dr", "djr.reward_id", "dr.id")
                                                .where("djr.journey_id", journey_id)
                                                .where("djr.reward_id", reward_id)
                                                .where("dr.visible", 1)
        //get reward redeem
        const reward_redeem = await Database.connection('db_reader')
                                        .count("* as total")
                                        .from("daa_reward_history")
                                        .where("journey_id", journey_id)
                                        .where("reward_id", reward_id)
                                        .whereIn("redeem_status", [0,1])
        let total_reward_redeem = 0
        for(let index in reward_redeem){
            total_reward_redeem = reward_redeem[index].total
        }
        let point
        let availability
        let date

        for(let index in journey_reward_point){
            point = journey_reward_point[index].point
            availability = journey_reward_point[index].qty - total_reward_redeem
            date = journey_reward_point[index].expired_date
        }
        //check claimed
        const is_claimed = await Database.connection('db_reader')
                                        .count("* as total")
                                        .from("daa_reward_history")
                                        .where("journey_id", journey_id)
                                        .where("user_id", authUser.id)
                                        .where("reward_id", reward_id)
                                        .whereIn("redeem_status", [0,1])
        let claimed = 0
        for(let index in is_claimed){
            claimed = is_claimed[index].total
        }
        let current_date = new Date()
        let new_date = new Date().getTime()
        let date_server = new Date(new_date)
        //insert to daa_reward_history
        if(my_point >= point && availability > 0 && claimed == 0 && current_date < date_server){
            const redeem_code = this.shuffle(string)
            const insert_to_reward_history = new DaaRewardHistory()
            insert_to_reward_history.journey_id = journey_id
            insert_to_reward_history.reward_id = reward_id
            insert_to_reward_history.user_id = authUser.id
            insert_to_reward_history.point = point
            insert_to_reward_history.redeem_code = redeem_code
            insert_to_reward_history.redeem_date = new Date()
            insert_to_reward_history.created_at = new Date()
            insert_to_reward_history.updated_at = new Date()

            if(await insert_to_reward_history.save()){
                const reward_detail = await Database.connection('db_reader')
                                                .select("id", "title", "description", "image")
                                                .from("daa_reward")
                                                .where("id", reward_id)
                const url = Env.get('APP_URL')+'/uploads/assets/images/'
                for(let index in reward_detail){
                    var element = {}
                    element.id = reward_detail[index].id
                    element.title = reward_detail[index].title
                    element.image = url+reward_detail[index].image
                    element.redeem_code_word = "redeem_code"
                    element.redeem_code = redeem_code

                    data.push(element)

                    message = {
                        title: "Enjoy your reward you earned it!",
                        description: "Please communicate your reward with your local learning admin."
                    }
                }
                
            }else{
                message = "Redeem is failed!"
            }
        }else if(current_date >= date_server){
            message = {
                title: "Item has expired",
                description: "Sorry, the item you are looking for has expired. Try choosing something else."
            }
        }else if(claimed > 0){
            message = {
                title: "Reward Claimed!",
                description: "You have claimed this reward. Let's try to get a different one."
            }
        }else if(availability <= 0){
            message = {
                title: "Out of stock",
                description: "Sorry, the item you are looking for is out of stock! Try choosing something else."
            }
        }else if(my_point < point){
            message = {
                title: "Keep on learning",
                description: "Sorry...you don't have enough points to claim this reward. Come back again."
            }
        }
        return response.send({status: 200, message: message, data: data})
    }
    //Get Program Point Data
    get_program_point = async (journey_id, user_id) => {
        const module_id = await Database.connection('db_reader')
                                    .select("dcm.module_id")
                                    .from("daa_journeys as dj")
                                    .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                    .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                    .where("dj.id", journey_id)
        let array_module_id = []
        for(let index in module_id){
            array_module_id.push(module_id[index].module_id)
        }
        const get_module_point = await Database.connection('db_reader')
                                            .sum("dup.point as total")
                                            .from("daa_user_point as dup")
                                            .whereIn("dup.module_id", array_module_id)
                                            .where("dup.user_id", user_id)
        let total_module_point = 0
        for(let index in get_module_point){
            if(get_module_point[index].total != null){
                total_module_point = get_module_point[index].total
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
            if(get_badge_points[index].total != null){
                total_badge_point = get_badge_points[index].total
            }
        }

        const get_history_point = await Database.connection('db_reader')
                                            .sum("drh.point as total")
                                            .from("daa_reward_history as drh")
                                            .where("drh.user_id", user_id)
                                            .where("drh.journey_id", journey_id)
                                            .whereIn("drh.redeem_status", [0, 1])
        let total_history_point = 0
        for(let index in get_history_point){
            if(get_history_point[index].total != null){
                total_history_point = get_history_point[index].total
            }
        }

        let current_point = (total_module_point + total_badge_point) - total_history_point
        if(current_point < 0){
            current_point = 0
        }
        return current_point
    }
    //Ger Journey Reward Data
    journey_reward = async ({auth, params, response}) => {
        const journey_id = params.journey_id
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        let data = []
        //get current point
        let current_point
        const module_id = await Database.connection('db_reader')
                            .select("dcm.module_id")
                            .from("daa_journeys as dj")
                            .join("daa_courses as dc", "dc.journey_id", "dj.id")
                            .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                            .where("dj.id", journey_id)
        let array_module_id = []
        for(let index in module_id){
            array_module_id.push(module_id[index].module_id)
        }
        const get_module_point = await Database.connection('db_reader')
                        .sum("dup.point as total")
                        .from("daa_user_point as dup")
                        .whereIn("dup.module_id", array_module_id)
                        .where("dup.user_id", user_id)
        let total_module_point = 0
        for(let index in get_module_point){
            if(get_module_point[index].total != null){
                total_module_point = get_module_point[index].total
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
            if(get_badge_points[index].total != null){
                total_badge_point = get_badge_points[index].total
            }
        }

        const get_history_point = await Database.connection('db_reader')
                        .sum("drh.point as total")
                        .from("daa_reward_history as drh")
                        .where("drh.user_id", user_id)
                        .where("drh.journey_id", journey_id)
                        .whereIn("drh.redeem_status", [0, 1])
        let total_history_point = 0
        for(let index in get_history_point){
            if(get_history_point[index].total != null){
                total_history_point = get_history_point[index].total
            }
        }

        current_point = (total_module_point + total_badge_point) - total_history_point
        if(current_point < 0){
            current_point = 0
        }
        //get reward list
        const reward_list = await Database.connection('db_reader')
                                        .select("djr.reward_id", "djr.point", "djr.expired_date", "djr.qty", "dr.title", "dr.description", "dr.image")
                                        .from("daa_journey_reward as djr")
                                        .join("daa_reward as dr", "djr.reward_id", "dr.id")
                                        .where("journey_id", journey_id)
                                        .where("dr.visible", 1)
        var element = {}
        if(reward_list != 0){
            for(let index in reward_list){
                const url = Env.get('APP_URL')+'/uploads/assets/images/'
                element.image = url+reward_list[index].image
                element.status = "redeem_reward"
                const is_claimed = await Database.connection('db_reader')
                                                .count("* as total")
                                                .from("daa_reward_history")
                                                .where("journey_id", journey_id)
                                                .where("user_id", authUser.id)
                                                .where("reward_id", reward_list[index].reward_id)
                                                .whereIn("redeem_status", [0,1])
                let claimed = 0
                for(let index in is_claimed){
                    claimed = is_claimed[index].total
                }

                const reward_redeem = await Database.connection('db_reader')
                                                .count("* as total")
                                                .from("daa_reward_history")
                                                .where("journey_id", journey_id)
                                                .where("reward_id", reward_list[index].reward_id)
                                                .whereIn("redeem_status", [0,1])
                let total_reward_redeem = 0
                for(let index in reward_redeem){
                    total_reward_redeem = reward_redeem[index].total
                }

                element.availability = reward_list[index].qty - total_reward_redeem
                let current_date = new Date()
                let date_server = new Date(reward_list[index].expired_date)
                const date_format = date_server.getDate+"-"+(date_server.getMonth+1)+"-"+date_server.getFullYear

                element.expired_date = date_format

                if(current_date < date_server){
                    element.expired = 0
                    element.is_available = 1
                    if(claimed == 0){
                        element.is_available = 1
                        if(reward_list[index].qty <= total_reward_redeem){
                            element.status = "out_of_stock"
                            element.is_available = 0
                        }
                    }else{
                        element.status = "redeem_claimed"
                        element.is_available = 0
                    }
                }else{
                    element.expired = 1
                    element.is_available = 0
                    element.status = "reward_expired_title"
                }
                if(reward_list[index].description == null){
                    element.description = ""
                }
            }
            element.program_points = current_point
            element.reward = reward_list
        }else{
            element.program_points = current_point
            element.reward = []
        }
        data.push(element)
        return response.send({status: 200, message: "Ok", data: element})
    }
    //Get Journey Reward Detail Data
    journey_reward_detail = async ({auth, params, response}) => {
        const journey_id = params.journey_id
        const reward_id = params.reward_id
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        let data_detail = []
        //get current point
        let current_point
        const module_id = await Database.connection('db_reader')
                            .select("dcm.module_id")
                            .from("daa_journeys as dj")
                            .join("daa_courses as dc", "dc.journey_id", "dj.id")
                            .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                            .where("dj.id", journey_id)
        let array_module_id = []
        for(let index in module_id){
            array_module_id.push(module_id[index].module_id)
        }
        const get_module_point = await Database.connection('db_reader')
                        .sum("dup.point as total")
                        .from("daa_user_point as dup")
                        .whereIn("dup.module_id", array_module_id)
                        .where("dup.user_id", user_id)
        let total_module_point = 0
        for(let index in get_module_point){
            if(get_module_point[index].total != null){
                total_module_point = get_module_point[index].total
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
            if(get_badge_points[index].total != null){
                total_badge_point = get_badge_points[index].total
            }
        }

        const get_history_point = await Database.connection('db_reader')
                        .sum("drh.point as total")
                        .from("daa_reward_history as drh")
                        .where("drh.user_id", user_id)
                        .where("drh.journey_id", journey_id)
                        .whereIn("drh.redeem_status", [0, 1])
        let total_history_point = 0
        for(let index in get_history_point){
            if(get_history_point[index].total != null){
                total_history_point = get_history_point[index].total
            }
        }

        current_point = (total_module_point + total_badge_point) - total_history_point
        if(current_point < 0){
            current_point = 0
        }
        //get detail
        const get_detail = await Database.connection('db_reader')
                                    .select("djr.reward_id", "djr.point", "djr.expired_date", "djr.qty", "dr.title", "dr.description", "dr.image")
                                    .from("daa_journey_reward as djr")
                                    .join("daa_reward as dr", "djr.reward_id", "dr.id")
                                    .where("reward_id", reward_id)
                                    .where("journey_id", journey_id)
                                    .where("dr.visible", 1)
        if(get_detail != 0){
            for(let index in get_detail){
                var element = {}
                const is_claimed = await Database.connection('db_reader')
                                                .count("* as total")
                                                .select("redeem_code", "redeem_status")
                                                .from("daa_reward_history")
                                                .where("journey_id", journey_id)
                                                .where("user_id", user_id)
                                                .where("reward_id", reward_id)
                                                .whereIn("redeem_status", [0,1])
                let claimed = 0
                let redeem_code = ""
                let redeem_status = 0
                for(let index in is_claimed){
                    claimed = is_claimed[index].total
                    redeem_code = is_claimed[index].redeem_code
                    redeem_status = is_claimed[index].redeem_status
                }
                const reward_redeem = await Database.connection('db_reader')
                                                .count("* as total")
                                                .from("daa_reward_history")
                                                .where("journey_id", journey_id)
                                                .where("reward_id", reward_id)
                                                .whereIn("redeem_status", [0,1])
                let total_reward_redeem = 0
                for(let index in reward_redeem){
                    total_reward_redeem = reward_id[index].total
                }
                get_detail[index].status = "redeem_reward"
                const current_date = new Date()
                const date_server = new Date(get_detail[index].expired_date)
                const date_format = date_server.getDate+"-"+(date_server.getMonth+1)+"-"+date_server.getFullYear
                get_detail[index].expired_date = date_format

                if(current_date < date_server && claimed == 0){
                    get_detail[index].expired = 0
                    get_detail[index].is_available = 1
                    get_detail[index].status = 1
                    if(claimed == 0){
                        get_detail[index].is_available = 1
                        get_detail[index].redeem_code_word = ""
                        get_detail[index].redeem_code = ""
                        if(get_detail[index].qty <= total_reward_redeem){
                            get_detail[index].status = "out_of_stock"
                            get_detail[index].is_available = 0
                            get_detail[index].redeem_code_word = ""
                            get_detail[index].redeem_code = ""
                        }
                    }else{
                        get_detail[index].status = "redeem_claimed"
                        get_detail[index].is_available = 0
                        get_detail[index].redeem_code_word = "redeem_code"
                        get_detail[index].redeem_code = redeem_code
                    }
                }else if(current_date < date_server && claimed != 0){
                    get_detail[index].status = "redeem_claimed"
                    get_detail[index].is_available = 0
                    get_detail[index].redeem_code_word = "redeem_code"
                    get_detail[index].redeem_code = redeem_code
                }else if(current_date >= date_server && claimed != 0){
                    get_detail[index].expired = 1
                    get_detail[index].is_available = 0
                    get_detail[index].redeem_code_word = "redeem_code"
                    get_detail[index].redeem_code = redeem_code
                    get_detail[index].status = "reward_expired_title"
                }else if(current_date >= date_server && claimed == 0){
                    get_detail[index].expired = 1
                    get_detail[index].is_available = 0
                    get_detail[index].redeem_code_word = ""
                    get_detail[index].redeem_code = redeem_code
                    get_detail[index].status = "reward_expired_title"
                    redeem_status = -1
                }
                get_detail[index].availability = get_detail[index].qty - total_reward_redeem
                get_detail[index].program_points = current_point

                if(get_detail[index].description == null){
                    get_detail[index].description = ""
                }
                const url = Env.get('APP_URL')+'/uploads/assets/images/'

                element.reward_id = get_detail[index].reward_id
                element.title = get_detail[index].title
                element.description = get_detail[index].description
                element.image = url+get_detail[index].image
                element.point = get_detail[index].point
                element.availability = get_detail[index].qty - total_reward_redeem
                element.program_points = current_point
                element.status = get_detail[index].status
                element.is_available = get_detail[index].is_available
                element.redeem_code_word = get_detail[index].redeem_code_word
                element.redeem_code = get_detail[index].redeem_code
                element.redeem_status = redeem_status

                data_detail.push(element)
            }
        }
        return response.send({status: 200, message: "Ok", data: data_detail})
    }
    //Get Reward History Data
    reward_history = async ({auth, params, response}) => {
        const journey_id = params.journey_id
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        let data = []
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
        //get reward history
        const reward_history = await Database.connection('db_reader')
                                        .select("drh.reward_id", "dr.title", "dr.image", "drh.redeem_code", "drh.redeem_date", "drh.redeem_status")
                                        .from("daa_reward_history as drh")
                                        .join("daa_reward as dr", "dr.id", "drh.reward_id")
                                        .where("user_id", user_id)
                                        .where("journey_id", journey_id)
                                        .orderBy("drh.id", "DESC")
        if(reward_history != 0){
            for(let index in reward_history){
                reward_history[index].redeem_code_word = "redeem_code"
                const date = new Date(reward_history[index].redeem_date)
                const current_date = new Date()

                const check = current_date - date
                if(check == 0){
                    reward_history[index].redeem_date = "today"
                }else if(check == 1){
                    reward_history[index].redeem_date = "yesterday"
                }else{
                    reward_history[index].redeem_date = date.getDate()+" "+month[date.getMonth()+1]+" "+date.getFullYear()
                }
                const url = Env.get('APP_URL')+'/uploads/assets/images/'

                reward_history[index].redeem_hour = date.getHours()+":"+date.getMinutes()
                reward_history[index].image = url+reward_history[index].image
                var element = {}
                element.reward_id = reward_history[index].reward_id
                element.title = reward_history[index].title
                element.image = reward_history[index].image
                element.redeem_code = reward_history[index].redeem_code
                element.redeem_date = reward_history[index].redeem_date
                element.redeem_status = reward_history[index].redeem_status
                element.redeem_hour = reward_history[index].redeem_hour

                data.push(element)
            }
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Check Point Data
    check_get_point = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        let message = ""
        let status = 0
        let data = []
        const { journey_id, course_id, scorm_id } = request.all()
        const rules = {
            journey_id: 'required',
            course_id: 'required',
            scorm_id: 'required'
        }
      
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "validator_fails", data: validation.messages()})            
        }else{
            const highest_score = 0
            //get module_id
            const module_query = await Database.connection('db_reader')
                                            .select("course")
                                            .from("scorm")
                                            .where("id", scorm_id)
                                            .limit(1)
            const module_id = 0
            if(module_query != 0){
                for(let index in module_query){
                    module_id = module_query[index].course
                }
            }
            //get point
            const get_flag = await Database.connection('db_reader')
                                        .select("point", "send_notif")
                                        .from("daa_user_point")
                                        .where("user_id", user_id)
                                        .where("module_id", module_id)
                                        .where("send_notif", 0)
                                        .orderBy("id", "DESC")
                                        .limit(1)
            let flag = 0
            let type = 0
            if(get_flag != 0){
                for(let index in get_flag){
                    flag = get_flag[index].send_notif
                    highest_score = get_flag[index].point
                }
                if(flag == 0){
                    type = 3
                    await Database.connection('db_writer')
                                .table("daa_user_point")
                                .where("user_id", user_id)
                                .where("module_id", module_id)
                                .orderBy("id", "DESC")
                                .limit(1)
                                .update({
                                    send_notif: 1
                                })
                }
                //show response
                let title = "+"+highest_score+" "+"point"
                //get journey name
                const journey_query = await Database.connection('db_reader')
                                                .select("name")
                                                .from("daa_journeys")
                                                .where("id", journey_id)
                let journey_name = ""
                for(let index in journey_query){
                    journey_name = journey_query[index].name
                }
                //get module name
                const module_query = await Database.connection('db_reader')
                                                .select("fullname")
                                                .from("course")
                                                .where("id", module_id)
                let module_name = ""
                for(let index in module_query){
                    module_name = module_query[index].fullname
                }
                status = 200
                message = "Ok"
                var element = {}
                element.title = title
                element.message = "new_point"
                element.point = highest_score
                element.journey_id = journey_id
                element.course_id = course_id
                element.module_id = module_id
                element.journey_name = journey_name
                element.module_name = module_name

                data.push(element)
            }else{
                status = 200
                message = "Ok"
            }
            //Logic Get Max Point Attempt
            const get_user_max_attempt_point = await Database.connection('db_reader')
                                                            .select("send_notif")
                                                            .from("daa_max_attempt_point_log")
                                                            .where("user_id", user_id)
                                                            .where("module_id", module_id)
            if(get_user_max_attempt_point != 0){
                let send_notif = 0
                for(let index in get_user_max_attempt_point){
                    send_notif = get_user_max_attempt_point[index].send_notif
                }
                if(send_notif == 0){
                    //show response 
                    status = 400
                    message = "Failed"
                    data = [{
                        title: "max_attempt_title",
                        message: "max_attempt_message"
                    }]

                    await Database.connection('db_writer')
                                .table("daa_max_attempt_point_log")
                                .where("user_id")
                                .where("module_id", module_id)
                                .update({
                                    send_notif: 1
                                })
                }
            }
            return response.send({status: status, message: message, data: data})
        }
    }
}

module.exports = GamificationController
