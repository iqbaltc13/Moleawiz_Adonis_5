'use strict'

const Database = use('Database')
const Env = use('Env')
const { validate } = use('Validator')
const DaaModuleLog = use('App/Models/DaaModuleLog')
const DaaCourseLog = use('App/Models/DaaCourseLog')
const DaaJourneyLog = use('App/Models/DaaJourneyLog')
const DaaBadgeUser = use('App/Models/DaaBadgeUser')
const DaaNotification = use('App/Models/DaaNotification')
const ScormScoesTrack = use('App/Models/ScormScoesTrack')


class TrackerController {
    //Check Module Complete
    check_module_complete = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const {scorm_id, username} = request.all()
        const query = await Database.connection('db_reader')
                                .select("scorm_scoes_track.scormid")
                                .from("scorm_scoes_track")
                                .innerJoin("user", "user.id", "scorm_scoes_track.userid")
                                .where("element", "cmi.core.lesson_status")
                                .whereIn("value", ['passed','completed'])
                                .whereIn("scormid", scorm_id)
                                .where("user.username", username)
                                .groupBy("scormid")
        
        let data = []
        const total = 0
        if (query != 0) {
            total = query.length
        }
        var element = {}
        element.complete = query
        element.total = total
        data.push(element)
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Check Completion Journey Data
    check_completion = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        let data = []
        let status = 0
        let message = ""
        const { journey_id, course_id, module_id, scorm_id } = request.all()
        const rules = {
            journey_id: 'required',
            course_id: 'required',
            module_id: 'required',
            scorm_id: 'required'
          }
      
          const validation = await validate(request.all(), rules)
          if (validation.fails()) {
              return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
          }else{
            //check completion in scorm track
            const check_is_complete = this.check_if_complete(authUser.id, scorm_id)
            if (check_is_complete == true) {
                const highest_query = await Database.connection('db_reader')
                                                .select("*")
                                                .from("scorm_scoes_track")
                                                .where("userid", authUser.id)
                                                .where("scormid", scorm_id)
                                                .where("element", "cmi.core.score.raw")
                                                .orderBy("value", "DESC")
                                                .limit(1)
                if(highest_query != 0){
                    let highest_score = 0
                    for(let index in highest_query){
                        highest_score = highest_query[index].value
                    }
		            //Insert to table module log
                    const logs = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_module_logs")
                                            .where("module_id", module_id)
                                            .where("user_id", authUser.id)
                    if(logs == 0){
                        //insert
                        const log_data = new DaaModuleLog
                        log_data.user_id = authUser.id
                        log_data.module_id = module_id
                        log_data.score = highest_score
                        log_data.is_completed = 1
                        log_data.last_open = new Date()
                        if(await log_data.save()){
                            this.course_completion(authUser.id, course_id, journey_id)
                            this.check_badge_user(authUser.id, module_id, course_id, journey_id, highest_score, scorm_id)
                            this.check_rating_module(authUser.id, module_id)
                        }else{
                            status = 400
                            message = "FAIL"
                        }
                    }else{
		        	    //check if last score is highest
                        let current_score = 0
                        for(let index in logs){
                            if(highest_score >= logs[index].score){
                                current_score = highest_score
                            }
                        }
                        //update
                        const update_logs = await Database.connection('db_writer')
                                            .table("daa_module_logs")
                                            .where("module_id", module_id)
                                            .where("user_id", authUser.id)
                                            .update({
                                                user_id: user_id,
                                                score: current_score,
                                                is_completed: 1,
                                                last_open: new Date()
                                            })
                        if(update_logs){
                            this.course_completion(authUser.id, course_id, journey_id)
                            this.check_badge_user(authUser.id, module_id, course_id, journey_id, highest_score, scorm_id)
                            this.check_rating_module(authUser.id, module_id)
                        }else{
                            status = 400
                            message = "FAIL"
                        }
                    }
                }else{
		    	    //insert without score (due to this scorm not send score)
                    const logs = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_module_logs")
                                            .where("module_id", module_id)
                                            .where("user_id", authUser.id)
                    if(logs == 0){
                        //insert
                        const log_data = new DaaModuleLog
                        log_data.user_id = authUser.id
                        log_data.module_id = module_id
                        log_data.score = highest_score
                        log_data.is_completed = 1
                        log_data.last_open = new Date()
                        if(await log_data.save()){
                            this.course_completion(authUser.id, course_id, journey_id)
                            this.check_badge_user(authUser.id, module_id, course_id, journey_id, highest_score, scorm_id)
                            this.check_rating_module(authUser.id, module_id)
                        }else{
                            status = 400
                            message = "FAIL"
                        }
                    }else{
                        //update
                        const update_logs = await Database.connection('db_writer')
                                            .table("daa_module_logs")
                                            .where("module_id", module_id)
                                            .where("user_id", authUser.id)
                                            .update({
                                                user_id: user_id,
                                                score: 0,
                                                is_completed: 1,
                                                last_open: new Date()
                                            })
                        if(update_logs){
                            this.course_completion(authUser.id, course_id, journey_id)
                            this.check_badge_user(authUser.id, module_id, course_id, journey_id, highest_score, scorm_id)
                            this.check_rating_module(authUser.id, module_id)
                        }else{
                            status = 400
                            message = "FAIL"
                        }
                    }
                }
            }else{
                status = 200
                message = "Failed, not complete yet!"
            }
            return response.send({status: status, message: message, data: data})
          }
    }
    //Delete Last Attemp Module Scorm
    delete_last_attempt = async ({auth, request, response}) => {
        const { userid, scormid } = request.all()
        const rules = {
            userid: 'required',
            scormid: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            let status = 0
            let message = ""
    		// userid was exists
            const check_user = await Database.connection('db_reader')
                                        .select("*")
                                        .from("user")
                                        .where("id", userid)
            if(check_user == 0){
                status = 400
                message = "user_not_found"
                return response.send({status: status, message: message, data: []})            
            }
            let limit_attempt = 3
            const module_track_check_complete = await Database.connection('db_reader')
                                                            .select("*")
                                                            .from("scorm_scoes_track")
                                                            .where("userid", userid)
                                                            .where("scormid", scormid)
                                                            .where("element", "cmi.core.lesson_status")
                                                            .whereNotIn("value", ["incomplete"])
                                                            .orderBy("id", "DESC")
            if(module_track_check_complete.length >= limit_attempt){
                status = 400
                message = "Anda sudah melakukan percobaan lebih dari "+limit_attempt+" kali"
                return response.send({status: status, message: message, data: []})
            }
            const current_data = await Database.connection('db_reader')
                                            .select("*")
                                            .from("scorm_scoes_track")
                                            .where("userid", userid)
                                            .where("scormid", scormid)
                                            .where("element", "cmi.core.lesson_status")
                                            .where("value", "incomplete")
            if(current_data != 0){
                for(let index in current_data){
                    const last_data = await ScormScoesTrack
                                                .query()
                                                .where("userid", userid)
                                                .where("scormid", scormid)
                                                .where("attempt", current_data[index].attempt)
                                                .delete()
                    if(last_data){
                        const lesson_data = new ScormScoesTrack()
                        lesson_data.userid = userid
                        lesson_data.scormid = scormid
                        lesson_data.scoid = current_data[index].scoid
                        lesson_data.attempt = current_data[index].attempt
                        lesson_data.element = "cmi.core.lesson_status"
                        lesson_data.value = "incomplete"
                        lesson_data.timemodified = current_data[index].timemodified
                        await lesson_data.save()

                        const lesson_data_ = new ScormScoesTrack()
                        lesson_data_.userid = userid
                        lesson_data_.scormid = scormid
                        lesson_data_.scoid = current_data[index].scoid
                        lesson_data_.attempt = current_data[index].attempt
                        lesson_data_.element = "cmi.core.lesson_location"
                        lesson_data_.value = ""
                        lesson_data_.timemodified = current_data[index].timemodified
                        await lesson_data_.save()
                        status = 200
                        message = "Ok"
                        return response.send({status: status, message: message, data: []})
                    }else{
                        status = 200
                        message = "Ok"
                        return response.send({status: status, message: message, data: []})
                    }
                }
            }else{
                status = 200
                message = "Ok"
                return response.send({status: status, message: message, data: []})
            }
        }
    }
    //Get Scorm Data
    get_data = async ({auth, request, response}) => {
        const { userid, scormid, scoid, element } = request.all()
        const rules = {
            userid: 'required',
            scormid: 'required',
            scoid: 'required',
            element: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            let data = []
    		// userid was exists
            const check_user = await Database.connection('db_reader')
                                        .select("*")
                                        .from("user")
                                        .where("id", userid)
            if(check_user == 0){
                return response.send({status: 401, message: "user_not_found", data: []})
            }
            if(element == "cmi.core.student_id"){
                const last_data = await Database.connection('db_reader')
                                            .select("username as value")
                                            .from("user")
                                            .where("id", userid)
                                            .limit(1)
                return response.send({status: 200, message: "success", data: last_data})
            }
            if(element == "cmi.core.student_name"){
                const last_data = await Database.connection('db_reader')
                                            .select("lastname", "firstname")
                                            .from("user")
                                            .where("id", userid)
                                            .limit(1)
                let data = []
                
                for(let index in last_data){
                    var element_data = {}
                    element_data.value = last_data[index].lastname+", "+last_data[index].firstname
                    data.push(element_data)
                }
                if(last_data != 0){
                    return response.send({status: 200, message: "success", data: data})
                }else{
                    return response.send({status: 200, message: "success", data: []})
                }
            }
            let current_attempt = 1
            const current_data = await Database.connection('db_reader')
                                            .select("*")
                                            .from("scorm_scoes_track")
                                            .where("userid", userid)
                                            .where("scormid", scormid)
                                            .where("scoid", scoid)
                                            .where("element", "cmi.core.lesson_status")
                                            .orderBy("id", "DESC")
            if(current_data != 0){
                for(let index in current_data){
                    current_attempt = current_data[index].attempt
                    if(current_data[index].value == "completed" || current_data[index].value == "passed" || current_data[index].value == "failed"){
                        const lesson_data = new ScormScoesTrack()
                        lesson_data.userid = userid
                        lesson_data.scormid = scormid
                        lesson_data.scoid = scoid
                        lesson_data.attempt = current_attempt+1
                        lesson_data.element = "cmi.core.lesson_status"
                        lesson_data.value = "incomplete"
                        lesson_data.timemodified = current_data[index].timemodified
                        await lesson_data.save()

                        const lesson_data_ = new ScormScoesTrack()
                        lesson_data_.userid = userid
                        lesson_data_.scormid = scormid
                        lesson_data_.scoid = scoid
                        lesson_data_.attempt = current_attempt+1
                        lesson_data_.element = "cmi.core.lesson_location"
                        lesson_data_.value = ""
                        lesson_data_.timemodified = current_data[index].timemodified
                        await lesson_data_.save()
                    }
                }
            }
            const last_data = await Database.connection('db_reader')
                                        .select("value")
                                        .from("scorm_scoes_track")
                                        .where("userid", userid)
                                        .where("scormid", scormid)
                                        .where("scoid", scoid)
                                        .where("element", element)
                                        .where("attempt", current_attempt)
                                        .orderBy("id", "DESC")
            if(last_data != 0){
                for(let index in last_data){
                    var element_data = {}
                    element_data.value = last_data[index].value
                    data.push(element)
                }
            }
            return response.send({status: 200, message: "success", data: data})
        }
    }
    //Check Completion Journey Browser
    check_completion_browser = async ({auth, request, response}) => {
        const { user_id, scorm_id } = request.all()
        let module_id = 0
        let course_id = 0
        let journey_id = 0
        let status = 0
        let message = ""
        const rules = {
            user_id: 'required',
            scorm_id: 'required'
          }
          const validation = await validate(request.all(), rules)
          if (validation.fails()) {
              return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
          }else{
            const get_file_data = await Database.connection('db_reader')
                                            .select("daa_journeys.id AS journey_id", "daa_journeys.name AS journey_name", "daa_courses.id AS course_id", "daa_courses.name AS course_name", "course.id AS module_id", "course.fullname AS module_name", "scorm.id AS scorm_id")
                                            .from("daa_journeys")
                                            .innerJoin("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                            .innerJoin("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                            .innerJoin("daa_courses", "daa_courses.journey_id", "daa_journeys.id")
                                            .innerJoin("daa_course_modules", "daa_course_modules.course_id", "daa_courses.id")
                                            .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                            .innerJoin("course_format_options", "course_format_options.courseid", "course.id")
                                            .innerJoin("scorm", "scorm.course", "course.id")
                                            .innerJoin("scorm_scoes_track", "scorm_scoes_track.scormid", "scorm.id")
                                            .where("scorm.id", scorm_id)
                                            .where("cohort_members.userid", user_id)
                                            .where("course.visible", 1)
            if(get_file_data != 0){
                for(let index in get_file_data){
                    module_id = get_file_data[index].module_id
                    course_id = get_file_data[index].course_id
                    journey_id = get_file_data[index].journey_id
                }
                const check_is_complete = this.check_if_complete(user_id, scorm_id)
                if(check_is_complete){
                    const highest_query = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("scorm_scoes_track")
                                                    .where("userid", authUser.id)
                                                    .where("scormid", scorm_id)
                                                    .where("element", "cmi.core.score.raw")
                                                    .orderBy("value", "DESC")
                                                    .limit(1)
                    if(highest_query != 0 ){
                        let highest_score = 0
                        for(let index in highest_query){
                            highest_score = highest_query[index].value
                        }
                        //Insert to table module log
                        const logs = await Database.connection('db_reader')
                                                .select("*")
                                                .from("daa_module_logs")
                                                .where("module_id", module_id)
                                                .where("user_id", authUser.id)
                        if(logs == 0){
                            //insert
                            const log_data = new DaaModuleLog
                            log_data.user_id = authUser.id
                            log_data.module_id = module_id
                            log_data.score = highest_score
                            log_data.is_completed = 1
                            log_data.last_open = new Date()
                            if(await log_data.save()){
                                this.course_completion(authUser.id, course_id, journey_id)
                                this.check_badge_user(authUser.id, module_id, course_id, journey_id, highest_score, scorm_id)
                                this.check_rating_module(authUser.id, module_id)
                                status = 200
                                message = "OK"
                            }else{
                                status = 400
                                message = "fail"
                            }
                        }else{
                            //check if last score is highest
                            let current_score = 0
                            for(let index in logs){
                                if(highest_score >= logs[index].score){
                                    current_score = highest_score
                                }
                            }
                            //update
                            const update_logs = await Database.connection('db_writer')
                                                .table("daa_module_logs")
                                                .where("module_id", module_id)
                                                .where("user_id", authUser.id)
                                                .update({
                                                    user_id: user_id,
                                                    score: current_score,
                                                    is_completed: 1,
                                                    last_open: new Date()
                                                })
                            if(update_logs){
                                this.course_completion(authUser.id, course_id, journey_id)
                                this.check_badge_user(authUser.id, module_id, course_id, journey_id, highest_score, scorm_id)
                                this.check_rating_module(authUser.id, module_id)
                                status = 200
                                message = "OK"
                            }else{
                                status = 400
                                message = "fail"
                            }
                        }  
                    }else{
                        //insert without score (due to this scorm not send score)
                        const logs = await Database.connection('db_reader')
                                                .select("*")
                                                .from("daa_module_logs")
                                                .where("module_id", module_id)
                                                .where("user_id", authUser.id)
                        if(logs == 0){
                            //insert
                            const log_data = new DaaModuleLog
                            log_data.user_id = authUser.id
                            log_data.module_id = module_id
                            log_data.score = highest_score
                            log_data.is_completed = 1
                            log_data.last_open = new Date()
                            if(await log_data.save()){
                                this.course_completion(authUser.id, course_id, journey_id)
                                this.check_badge_user(authUser.id, module_id, course_id, journey_id, highest_score, scorm_id)
                                this.check_rating_module(authUser.id, module_id)
                                status = 200
                                message = "OK"
                            }else{
                                status = 400
                                message = "fail"
                            }
                        }else{
                            //update
                            const update_logs = await Database.connection('db_writer')
                                                .table("daa_module_logs")
                                                .where("module_id", module_id)
                                                .where("user_id", authUser.id)
                                                .update({
                                                    user_id: user_id,
                                                    score: 0,
                                                    is_completed: 1,
                                                    last_open: new Date()
                                                })
                            if(update_logs){
                                this.course_completion(authUser.id, course_id, journey_id)
                                this.check_badge_user(authUser.id, module_id, course_id, journey_id, highest_score, scorm_id)
                                this.check_rating_module(authUser.id, module_id)
                                status = 200
                                message = "OK"
                            }else{
                                status = 400
                                message = "fail"
                            }
                        }
                    }
                }else{
                    status = 400
                    message = "fail"
                }
            }else{
                status = 400
                message = "fail"
            }
        }
        return response.send({status: status, message: message})
    }
    //Get Scorm Track data
    scorm = async ({auth, request, response}) => {
        const { userid, scormid, scoid, element, value, timemodified } = request.all()
        let status = 0
        let message = ""
        const rules = {
            userid: 'required',
            scormid: 'required',
            scoid: 'required',
            element: 'required',
            value: 'required',
            timemodified: 'required',
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            let data = []
    		// userid was exists
            const check_user = await Database.connection('db_reader')
                                        .select("*")
                                        .from("user")
                                        .where("id", userid)
            if(check_user == 0){
                return response.send({status: 401, message: "user_not_found", data: []})
            }
            const current_data = await Database.connection('db_reader')
                                            .select("*")
                                            .from("scorm_scoes_track")
                                            .where("userid", userid)
                                            .where("scormid", scormid)
                                            .where("scoid", scoid)
                                            .where("element", "cmi.core.lesson_status")
                                            .orderBy("id", "DESC")
            if(current_data != 0){
                if(element == 'cmi.core.lesson_status' && value == 'incomplete'){
                    for(let index in current_data){
                        if(current_data[index].value == "completed" || current_data[index].value == "passed" || current_data[index].value == "failed"){
    		    		    //insert new with increase attempt
                            const lesson_data = new ScormScoesTrack()
                            lesson_data.userid = userid
                            lesson_data.scormid = scormid
                            lesson_data.scoid = scoid
                            lesson_data.attempt = current_data[index].attempt+1
                            lesson_data.element = element
                            lesson_data.value = value
                            lesson_data.timemodified = timemodified
                            
                            if(await lesson_data.save()){
                                status = 200
                                message = "Ok"
                                return response.send({status: status, message: message, data: []})
                            }else{
                                status = 200
                                message = "fail"
                                return response.send({status: status, message: message, data: []})
                            }
                        }
                    }
                }else{
                    for(let index in current_data){
                        const complete_data = await Database.connection('db_reader')
                                                        .from("scorm_scoes_track")
                                                        .where("userid", userid)
                                                        .where("scormid", scormid)
                                                        .where("scoid", scoid)
                                                        .where("element", element)
                                                        .where("attempt", current_data[index].attempt)
                        
                        if(complete_data != 0){
                            complete_data.value = value
                            complete_data.timemodified = timemodified
                            complete_data.attempt = complete_data.attempt
                            if(await complete_data.save()){
                                status = 200
                                message = "Ok"
                                return response.send({status: status, message: message, data: []})
                            }else{
                                status = 200
                                message = "fail"
                                return response.send({status: status, message: message, data: []})
                            }
                        }else{
                            const lesson_data = new ScormScoesTrack()
                            lesson_data.userid = userid
                            lesson_data.scormid = scormid
                            lesson_data.scoid = scoid
                            lesson_data.attempt = current_data[index].attempt
                            lesson_data.element = element
                            lesson_data.value = value
                            lesson_data.timemodified = timemodified
                            
                            if(await lesson_data.save()){
                                status = 200
                                message = "Ok"
                                return response.send({status: status, message: message, data: []})
                            }else{
                                status = 200
                                message = "fail"
                                return response.send({status: status, message: message, data: []})
                            }
                        }
                    }
                }
            }else{
                const my_data = await Database.connection('db_reader')
                                                    .from("scorm_scoes_track")
                                                    .where("userid", userid)
                                                    .where("scormid", scormid)
                                                    .where("scoid", scoid)
                                                    .where("element", element)
                if(my_data != 0){
                    my_data.value = value
                    my_data.timemodified = timemodified

                    if(await my_data.save()){
                        status = 200
                        message = "Ok"
                        return response.send({status: status, message: message, data: []})
                    }else{
                        status = 200
                        message = "fail"
                        return response.send({status: status, message: message, data: []})
                    }
                }else{
                    const lesson_data = new ScormScoesTrack()
                    lesson_data.userid = userid
                    lesson_data.scormid = scormid
                    lesson_data.scoid = scoid
                    lesson_data.attempt = 1
                    lesson_data.element = element
                    lesson_data.value = value
                    lesson_data.timemodified = timemodified
                    
                    if(await lesson_data.save()){
                        status = 200
                        message = "Ok"
                        return response.send({status: status, message: message, data: []})
                    }else{
                        status = 200
                        message = "fail"
                        return response.send({status: status, message: message, data: []})
                    }
                }
            }
        }
    }
    //Send Scorm Offilne
    scorm_offline = async ({auth, request, response}) => {
        const { scorm_offline } = request.all()
        let status = 0
        let message = ""
        const rules = {
            scorm_offline: 'required'
        }
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            await Database.connection('db_writer')
                        .table("daa_sync_failed_log")
                        .insert({
                            value: scorm_offline,
                            sync_date: new Date()
                        })
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            let lesson_status_data = []
            let my_attempt = 0
            var jsonObject = JSON.parse(scorm_offline)
            for(let index in jsonObject){
                var element = {}
                element.userid = jsonObject[index].userid
                element.scormid = jsonObject[index].scorm_id
                element.scoid = jsonObject[index].sco_id
                element.element = jsonObject[index].element
                element.value = jsonObject[index].value
                element.timemodified = jsonObject[index].timemodified
                
                if(jsonObject[index].element == "cmi.core.lesson_status"){
                    //Passed
                    lesson_status_data.push(element)
                }else{
		    		// check if incomplete
                    const current_data = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("scorm_scoes_track")
                                                    .where("userid", jsonObject[index].userid)
                                                    .where("scormid", jsonObject[index].scorm_id)
                                                    .where("scoid", jsonObject[index].sco_id)
                                                    .where("element", jsonObject[index].element)
                                                    .orderBy("id", "DESC")
                                                    .limit(1)
                    if(current_data != 0){
                        for(let index in current_data){
    			        	//If lesson_status incomplete
                            if(current_data[index].value == "incomplete"){
                                const my_data = await Database.connection('db_reader')
                                                            .select("*")
                                                            .from("scorm_scoes_track")
                                                            .where("userid", jsonObject[index].userid)
                                                            .where("scormid", jsonObject[index].scorm_id)
                                                            .where("scoid", jsonObject[index].sco_id)
                                                            .where("element", jsonObject[index].element)
                                                            .where("attempt", current_data[index].attempt)
                                                            .orderBy("id", "DESC")
                                                            .limit(1)
                                if(my_data != 0){
					        	    //Update data
                                    await Database.connection('db_writer')
                                                .table("scorm_scoes_track")
                                                .where("userid", jsonObject[index].userid)
                                                .where("scormid", jsonObject[index].scorm_id)
                                                .where("scoid", jsonObject[index].sco_id)
                                                .where("element", jsonObject[index].element)
                                                .where("attempt", current_data[index].attempt)
                                                .update({
                                                    value: jsonObject[index].value,
                                                    timemodified: jsonObject[index].timemodified
                                                })
                                }else{
    					        	//insert new
                                    const new_data = new ScormScoesTrack()
                                    new_data.userid = jsonObject[index].userid
                                    new_data.scormid = jsonObject[index].scorm_id
                                    new_data.scoid = jsonObject[index].sco_id
                                    new_data.attempt = current_data[index].attempt
                                    new_data.element = jsonObject[index].element
                                    new_data.value = jsonObject[index].value
                                    new_data.timemodified = jsonObject[index].timemodified

                                    await new_data.save()
                                }
                            }else{
    					    	//else (completed, failed, passed)
                                const my_data = await Database.connection('db_reader')
                                                            .select("*")
                                                            .from("scorm_scoes_track")
                                                            .where("userid", jsonObject[index].userid)
                                                            .where("scormid", jsonObject[index].scorm_id)
                                                            .where("scoid", jsonObject[index].sco_id)
                                                            .where("element", jsonObject[index].element)
                                                            .where("attempt", current_data[index].attempt+1)
                                                            .orderBy("id", "DESC")
                                                            .limit(1)
                                if(my_data != 0){
					        	    //Update data
                                    await Database.connection('db_writer')
                                                .table("scorm_scoes_track")
                                                .where("userid", jsonObject[index].userid)
                                                .where("scormid", jsonObject[index].scorm_id)
                                                .where("scoid", jsonObject[index].sco_id)
                                                .where("element", jsonObject[index].element)
                                                .where("attempt", current_data[index].attempt+1)
                                                .update({
                                                    value: jsonObject[index].value,
                                                    timemodified: jsonObject[index].timemodified,
                                                    attempt: current_data[index].attempt+1
                                                })
                                }else{
    					        	//insert new
                                    const new_data = new ScormScoesTrack()
                                    new_data.userid = jsonObject[index].userid
                                    new_data.scormid = jsonObject[index].scorm_id
                                    new_data.scoid = jsonObject[index].sco_id
                                    new_data.attempt = current_data[index].attempt+1
                                    new_data.element = jsonObject[index].element
                                    new_data.value = jsonObject[index].value
                                    new_data.timemodified = jsonObject[index].timemodified

                                    await new_data.save()
                                }
                            }
                        }
                    }else{
			        	//data empty, insert new
                        const my_data = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("scorm_scoes_track")
                                                    .where("userid", jsonObject[index].userid)
                                                    .where("scormid", jsonObject[index].scorm_id)
                                                    .where("scoid", jsonObject[index].sco_id)
                                                    .where("element", jsonObject[index].element)
                                                    .orderBy("id", "DESC")
                                                    .limit(1)
                        if(my_data != 0){
					        //Update data
                            await Database.connection('db_writer')
                                        .table("scorm_scoes_track")
                                        .where("userid", jsonObject[index].userid)
                                        .where("scormid", jsonObject[index].scorm_id)
                                        .where("scoid", jsonObject[index].sco_id)
                                        .where("element", jsonObject[index].element)
                                        .update({
                                            value: jsonObject[index].value,
                                            timemodified: jsonObject[index].timemodified
                                        })
                        }else{
    					    //insert new
                            const new_data = new ScormScoesTrack()
                            new_data.userid = jsonObject[index].userid
                            new_data.scormid = jsonObject[index].scorm_id
                            new_data.scoid = jsonObject[index].sco_id
                            new_data.attempt = my_attempt+1
                            new_data.element = jsonObject[index].element
                            new_data.value = jsonObject[index].value
                            new_data.timemodified = jsonObject[index].timemodified

                            await new_data.save()
                        }
                    }
                }
            }
			//Loop for lesson_status
            for(let index in lesson_status_data){
                const l_userid = lesson_status_data[index].userid
                const l_scormid = lesson_status_data[index].scormid
                const l_scoid = lesson_status_data[index].scoid
                const l_element = lesson_status_data[index].element
                const l_value = lesson_status_data[index].value
                const l_timemodified = lesson_status_data[index].timemodified

                const current_data = await Database.connection('db_reader')
                                                .select("*")
                                                .from("scorm_scoes_track")
                                                .where("userid", l_userid)
                                                .where("scormid", l_scormid)
                                                .where("scoid", l_scoid)
                                                .where("element", "cmi.core.lesson_status")
                                                .orderBy("id", "DESC")
                                                .limit(1)
                if(current_data != 0){
                    for(let index in current_data){
                        if(current_data[index].value == "incomplete"){
                            await Database.connection('db_writer')
                                        .table("scorm_scoes_track")
                                        .where("userid", l_userid)
                                        .where("scormid", l_scormid)
                                        .where("scoid", l_scoid)
                                        .where("element", "cmi.core.lesson_status")
                                        .orderBy("id", "DESC")
                                        .limit(1)
                                        .update({
                                            value: l_value,
                                            timemodified: l_timemodified
                                        })
                            if(l_value == "passed" || l_value == "completed" || l_value == "failed"){
                                const lesson_data = new ScormScoesTrack()
                                lesson_data.userid = l_userid
                                lesson_data.scormid = l_scormid
                                lesson_data.scoid = l_scoid
                                lesson_data.attempt = current_data[index].attempt+1
                                lesson_data.element = "cmi.core.lesson_status"
                                lesson_data.value = "incomplete"
                                lesson_data.timemodified = l_timemodified
                                await lesson_data.save()

                                const loc_data = new ScormScoesTrack()
                                loc_data.userid = l_userid
                                loc_data.scormid = l_scormid
                                loc_data.scoid = l_scoid
                                loc_data.attempt = current_data[index].attempt+1
                                loc_data.element = "cmi.core.lesson_location"
                                loc_data.value = ""
                                loc_data.timemodified = l_timemodified
                                await loc_data.save()
                            }
                        }else{
    				    	//else (completed, failed, passed)
    			        	//insert new
                            const new_data = new ScormScoesTrack()
                            new_data.userid = l_userid
                            new_data.scormid = l_scormid
                            new_data.scoid = l_scoid
                            new_data.attempt = current_data[index].attempt+1
                            new_data.element = l_element
                            new_data.value = l_value
                            new_data.timemodified = l_timemodified
                            await new_data.save()

                            if(l_value == "passed" || l_value == "completed" || l_value == "failed"){
                                const lesson_data = new ScormScoesTrack()
                                lesson_data.userid = l_userid
                                lesson_data.scormid = l_scormid
                                lesson_data.scoid = l_scoid
                                lesson_data.attempt = new_data.attempt+1
                                lesson_data.element = "cmi.core.lesson_status"
                                lesson_data.value = "incomplete"
                                lesson_data.timemodified = l_timemodified
                                await lesson_data.save()

                                const loc_data = new ScormScoesTrack()
                                loc_data.userid = l_userid
                                loc_data.scormid = l_scormid
                                loc_data.scoid = l_scoid
                                loc_data.attempt = new_data.attempt+1
                                loc_data.element = "cmi.core.lesson_location"
                                loc_data.value = "0"
                                loc_data.timemodified = l_timemodified
                                await loc_data.save()
                            }
                        }
                    }
                }else{
		        	//insert new
                    const new_data = new ScormScoesTrack()
                    new_data.userid = l_userid
                    new_data.scormid = l_scormid
                    new_data.scoid = l_scoid
                    new_data.attempt = 1
                    new_data.element = l_element
                    new_data.value = l_value
                    new_data.timemodified = l_timemodified
                    await new_data.save()
                }
                this.check_completion_offline(l_userid, l_scormid)
            }
            let message = "last_synchronized: "+ new Date()
            return response.send({status: 200, message: message, data: []})
        }
    }
    //Check Completion When Offline
    check_completion_offline = async (user_id, scorm_id) => {
        let module_id = 0
        let course_id = 0
        let journey_id = 0

        const get_file_data = await Database.connection('db_reader')
                                        .select("daa_journeys.id AS journey_id", "daa_journeys.name AS journey_name", "daa_courses.id AS course_id", "daa_courses.name AS course_name", "course.id AS module_id", "course.fullname AS module_name", "scorm.id AS scorm_id")
                                        .from("daa_journeys")
                                        .innerJoin("daa_journey_cohort_enrols", "daa_journey_cohort_enrols.journey_id", "daa_journeys.id")
                                        .innerJoin("cohort_members", "cohort_members.cohortid", "daa_journey_cohort_enrols.cohort_id")
                                        .innerJoin("daa_courses", "daa_courses.journey_id", "daa_journeys.id")
                                        .innerJoin("daa_course_modules", "daa_course_modules.course_id", "daa_courses.id")
                                        .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                        .innerJoin("course_format_options", "course_format_options.courseid", "course.id")
                                        .innerJoin("scorm", "scorm.course", "course.id")
                                        .innerJoin("scorm_scoes_track", "scorm_scoes_track.scormid", "scorm.id")
                                        .where("scorm.id", scorm_id)
                                        .where("cohort_members.userid", user_id)
                                        .where("course.visible", 1)
        if(get_file_data != 0){
            for(let index in get_file_data){
                module_id = get_file_data[index].module_id
                course_id = get_file_data[index].course_id
                journey_id = get_file_data[index].journey_id
            }
            const check_if_complete = this.check_if_complete(user_id, scorm_id)
            if(check_if_complete){
                const highest_query = await Database.connection('db_reader')
                                                .select("*")
                                                .from("scorm_scoes_track")
                                                .where("userid", user_id)
                                                .where("scormid", scorm_id)
                                                .where("element", "cmi.core.score.raw")
                                                .orderBy("value", "DESC")
                                                .limit(1)
                if(highest_query != 0){
                    let highest_score = 0
                    for(let index in highest_query){
                        highest_score = highest_query[index].value
                    }
			        //Insert to table module log
                    const log = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_module_logs")
                                            .where("module_id", module_id)
                                            .where("user_id", user_id)
                                            .orderBy("id", "DESC")
                                            .limit(1)
                    if(log == 0){
						//Insert
                        const log_data = new DaaModuleLog()
                        log_data.user_id = user_id
                        log_data.module_id = module_id
                        log_data.score = highest_score
                        log_data.is_completed = 1
                        log_data.last_open = new Date()
                        if(await log_data.save()){
                            this.course_completion(user_id, course_id, journey_id)
                            this.check_badge_user(user_id, module_id, course_id, journey_id, highest_score, scorm_id)
                            this.check_rating_module(user_id, module_id)
                        }
                    }else{
			        	//check if last score is highest
                        let current_score = 0
                        for(let index in log){
                            if(highest_score >= log[index].score){
                                current_score = highest_score
                            }
    			        	//update
                            await Database.connection('db_writer')
                                        .table("daa_module_logs")
                                        .where("module_id", module_id)
                                        .where("user_id", user_id)
                                        .orderBy("id", "DESC")
                                        .limit(1)
                                        .update({
                                            user_id: user_id,
                                            score: 0,
                                            is_completed: 1,
                                            last_open: new Date()
                                        })
                            this.course_completion(user_id, course_id,  journey_id)
                            this.check_badge_user(user_id, module_id, course_id, journey_id, 0, scorm_id)
                            this.check_rating_module(user_id, module_id)
                        }
                    }
                }
            }
        }
    }
    check_if_complete = async (user_id, scorm_id) => {
        const check_complete = await Database.connection('db_reader')
                                            .select("*")
                                            .from("scorm_scoes_track")
                                            .where("userid", user_id)
                                            .where("scormid", scorm_id)
                                            .where("element", "cmi.core.lesson_status")
                                            .whereIn("value", ["passed", "completed"])
        if(check_complete != 0){
            return true
        }else{
    		//exclude this modules
            if(scorm_id.includes(this.exclude_module_check)){
                return false
            }else{
	    		//Check if score 100, then set it to passed/completed
                const check_score = await Database.connection('db_reader')
                                                .select("*")
                                                .from("scorm_scoes_track")
                                                .where("userid", user_id)
                                                .where("scormid", scorm_id)
                                                .where("element", "cmi.core.score.raw")
                                                .where("value", "100")
                if(check_score != 0){
                    for(let index in check_score){
                        const check_status = await Database.connection('db_reader')
                                                        .select("*")
                                                        .from("scorm_scoes_track")
                                                        .where("userid", user_id)
                                                        .where("scormid", scorm_id)
                                                        .where("element", "cmi.core.lesson_status")
                                                        .where("value", "incomplete")
                                                        .where("attempt", check_score[index].attempt)
                        if(check_status != 0){
                            for(let index in check_status){
                                await Database.connection('db_writer')
                                            .table('scorm_scoes_track')
                                            .where("userid", user_id)
                                            .where("scormid", scorm_id)
                                            .where("id", check_status[index].id)
                                            .update({
                                                value: "passed"
                                            })
                            }
                        }
                    }
                    return true
                }else{
                    return false
                }
            }
        }
    }
    course_completion = async (user_id, course_id, journey_id) => {
        let list_module = []
        let total_module = 0
        let status = 0
        let message = ""
        let data = []
    	//Get module list of selected course
        const check_course = await Database.connection('db_reader')
                                        .select("dcm.module_id")
                                        .from("daa_course_modules as dcm")
                                        .join("course as c", "dcm.module_id", "c.id")
                                        .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                        .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                        .join("daa_journey_cohort_enrols as djce", "djce.journey_id", "dj.id")
                                        .join("cohort_members as cm", "cm.cohortid", "djce.cohort_id")
                                        .where("cm.userid", user_id)
                                        .where("dc.id", course_id)
                                        .where("dj.visible", 1)
                                        .where("dc.visible", 1)
                                        .where("c.visible", 1)
                                        .where("c.module_type", 1)
        if(check_course != 0){
            total_module = check_course.length
            let ids = []
            for(let index in check_course){
                ids.push(check_course[index].module_id)
            }
            //Compare total module
            const compare = await Database.connection('db_reader')
                                        .select("module_id")
                                        .from("daa_module_logs")
                                        .where("user_id", user_id)
                                        .whereIn("module_id", ids)
            if(compare != 0){
                let total_complete = compare.length
                if(total_complete == total_module){
            		//insert or update to daa_course_logs
                    const log  = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_course_logs")
                                            .where("course_id", course_id)
                                            .where("user_id", user_id)
                    if(log == 0){
                        //insert
                        const log_data = new DaaCourseLog()
                        log_data.user_id = user_id
                        log_data.course_id = course_id
                        if(await log_data.save()){
                            this.journey_completion(authUser.id, journey_id)
                        }else{
                            status = 400
                            message = "fail"
                        }
                    }else{
                        //update
                        const update = await Database.connection('db_writer')
                                                .table('daa_course_logs')
                                                .where("course_id", course_id)
                                                .where("user_id", user_id)
                                                .update({
                                                    user_id: user_id,
                                                    course_id: course_id
                                                })
                        if(update){
                            this.journey_completion(authUser.id, journey_id)
                        }else{
                            status = 400
                            message = "fail"
                        }
                    }
                }else{
                    status = 200
                    message = "Ok"
                }
            }else{
                status = 200
                message = "Ok"
            }
        }else{
            status = 200
            message = "Ok"
        }
        return response.send({status: status, message: message, data: data})
    }
    journey_completion = async (user_id, journey_id) => {
        let list_course = ""
        let total_course = 0
        let status = 0
        let message = ""
        let data = []
    	//Get course list of selected journey
        const check_journey = await Database.connection('db_reader')
                                        .select("dc.id")
                                        .from("daa_courses as dc")
                                        .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                        .join("daa_journey_cohort_enrols as djce", "djce.journey_id", "dj.id")
                                        .join("cohort_members as cm", "cm.cohortid", "djce.cohort_id")
                                        .where("cm.userid", user_id)
                                        .where("dj.id", journey_id)
                                        .where("dj.visible", 1)
                                        .where("dc.visible", 1)
        if(check_journey != 0){
            const total_course = check_journey.length
            let ids = []
            for(let index in check_journey){
                ids.push(check_journey[index].id)
            }
            //Compare total course
            const compare = await Database.connection('db_reader')
                                        .select("course_id")
                                        .from("daa_course_logs")
                                        .where("user_id", user_id)
                                        .whereIn("course_id", ids)
            if(compare != 0){
                const total_complete = compare.length
                if(total_complete == total_course){
            		//insert or update to daa_course_logs
                    const logs = await Database.connection('db_reader')
                                            .select("*")
                                            .from("daa_journey_logs")
                                            .where("journey_id", journey_id)
                                            .where("user_id", user_id)
                    if(logs == 0){
                        const log_data = new DaaJourneyLog()
                        log_data.user_id = user_id
                        log_data.journey_id = journey_id

                        if(await log_data.save()){
                            status = 200
                            message = "Ok"  
                        }else{
                            status = 400
                            message = "fail"   
                        }
                    }else{
                        //update
                        const update = await Database.connection('db_writer')
                                                .table('daa_journey_logs')
                                                .where("journey_id", journey_id)
                                                .where("user_id", user_id)
                                                .update({
                                                    user_id: user_id,
                                                    journey_id: journey_id
                                                })
                        if(update){
                            status = 200
                            message = "Ok" 
                        }else{
                            status = 400
                            message = "fail"
                        }
                    }
                }else{
                    status = 200
                    message = "Ok"
                }
            }else{
                status = 200
                message = "Ok"
            }
        }else{
            status = 200
            message = "Ok"
        }
        return response.send({status: status, message: message, data: data})
    }
    // BADGES
	// main badge
    check_badge_user = async (user_id, module_id, course_id, journey_id, score, scorm_id) => {
        let attempt = this.setting_badges_attempt(user_id, scorm_id)
        let status = this.setting_badges_status(user_id, scorm_id)

        this.check_module_badges(user_id, module_id, score, attempt, status, journey_id, course_id)
        this.check_course_badge(user_id, course_id)
        this.check_journey_badge(user_id, journey_id)

		// advance badges 
        this.check_advance_badge_journey(user_id, journey_id)
        this.check_advance_badge_course(user_id, journey_id, course_id)

		//Leaderboard badges
        this.check_leaderboard_badge_module(user_id, journey_id, course_id, module_id)
        this.check_leaderboard_badge_course(user_id, journey_id, course_id)
        this.check_leaderboard_badge_journey(user_id, journey_id)
    }
    setting_badges_attempt = async (user_id, scorm_id) => {
		//get max attempt in table scorm_scoes_track.attempt
        const check = await Database.connection('db_reader')
                                .select("attempt")
                                .from("scorm_scoes_track")
                                .where("userid", user_id)
                                .where("scormid", scorm_id)
                                .orderBy("attempt", "DESC")
                                .limit("1")
        let result = 0
        if(cheq != 0){
            for(let index in check){
                let attempt = check[index].attempt
                if(attempt){
                    result = attempt
                }
            }
        }
        return result
    }
	// badges setting type attempt and status (passed/ completed)
    setting_badges_status = async (user_id, scorm_id) => {
		//check status passed/ completed in table scorm_scoes_track cmi.core.lesson_status
        const check = await Database.connection('db_reader')
                                .select("id")
                                .from("scorm_scoes_track")
                                .where("userid", user_id)
                                .where('scormid', scorm_id)
                                .where("element", "cmi.core.lesson_status")
                                .where("value", "passed")
                                .orWhere("value", "completed")
                                .limit(1)
        let result = false
        if(check != 0){
            result = true
        }
        return result
    }
    check_module_badges = async (user_id, module_id, score, attempt, status, journey_id, course_id) => {
        let result = 0
		// check Have Badge
        const check_badge = await Database.connection('db_reader')
                                        .select("id")
                                        .from("daa_badges")
                                        .where("visible", 1)
                                        .where("daa_journey_id", journey_id)
                                        .where("daa_course_id", course_id)
                                        .where("module_id", module_id)
                                        .where("badgetype", 3)
        let id_badge = []
        if(check_badge != 0){
            for(let index in check_badge){
                id_badge.push(check_badge[index].id)
            }
        }
        if(id_badge.length != 0){
			// getSettingBadge
            let compares = this.compare_values(score, attempt, status, id_badge)
            for(let index in compares){
                if(compares[index].status == true){
                    if(this.insert_badge_user(user_id, compares[index].id_badges)){
                        result = 1
                        this.insert_badge_notification(user_id, compares[index].id_badges)
                    }else{
                        result = 0
                    }
                }else{
                    result = 0
                }
            }
        }
        return result
    }
    compare_values = async (score, attempt, status, id_badge) => {
        const get_id_badge_setting = await Database.connection('db_reader')
                                                .select("daa_badge_id as id_badges")
                                                .from("daa_badge_setting")
                                                .where("status", 1)
                                                .whereIn("daa_badge_id", id_badge)
        for(let index in get_id_badge_setting){
            let id_badges = get_id_badge_setting[index].id_badges
            const setting = await Database.connection('db_reader')
                                        .select("setting_name", "setting_value")
                                        .from("daa_badge_setting")
                                        .where("status", 1)
                                        .where("daa_badge_id", id_badge)
            const count = setting.length
            let result_status = false
            if(count > 0){
                let cV1 = false
                let cV2 = false
                let cV3 = false
                let is_setting_score = false
                let is_setting_attempt = false
                let is_setting_completion = false
                for(let index in setting){
                    let parameter = setting[index].setting_name
                    if("score" === parameter){
                        let value1 = setting[index].setting_value
                        is_setting_score = true
                        if(score >= value1){
                            cV1 = true
                        }
                    }else if("attempt" === parameter){
                        let value1 = setting[index].setting_value
                        is_setting_attempt = true
                        if(attempt >= value1){
                            cV2 = true
                        }
                    }else if("completion" === parameter){
                        let value1 = setting[index].setting_value
                        if(status){
                            cV3 = true
                        }
                    }
                }
                if(!is_setting_score){
                    cV1 = true
                }
                if(!is_setting_attempt){
                    cV2 = true
                }
                if(!is_setting_completion){
                    cV3 = true
                }
                if(cV1 == true && cV2 == true && cv3 == true){
                    result_status = true
                }
            }
            get_id_badge_setting[index].status = result_status
        }
        return get_id_badge_setting
    }
    insert_badge_user = async (user_id, id_badge) => {
        let result = false
		// cek duplicate data
        const double = this.check_duplicate_badge_user(user_id, id_badge)
        let data = []
        if(!double){
            const data_badge = new DaaBadgeUser()
            data_badge.user_id = user_id
            data_badge.daa_badge_id = id_badge

            if(await data_badge.save()){
                result =  true
            }
        }
        return result
    }
    check_duplicate_badge_user = async (user_id, id_badge) => {
		//check badge in table daa_badge_users
        const check = await Database.connection('db_reader')
                                .select("id")
                                .from("daa_badge_users")
                                .where("daa_badge_id", id_badge)
                                .where("userid", user_id)
                                .limit(1)
        let result = false
        if(check != 0){
            result = true
        }
        return result
    }
    insert_badge_notification = async (user_id, id_badge) => {
        const data_notif = new DaaNotification()
        data_notif.user_id = user_id
        data_notif.from_id = 0
        data_notif.context_id = id_badge
        data_notif.type = "badge"
        data_notif.subject = "Achivement"
        data_notif.message = ""
        data_notif.status = 0
        data_notif.save()
    }
    check_course_badge = async (user_id, course_id) => {
        let result = 0
		//Get course_id by module_id = 96
        const get = await Database.connection('db_reader')
                                .select("id", "daa_journey_id", "daa_course_id", "module_id", "name", "badgetype")
                                .from("daa_badges")
                                .where("visible", 1)
                                .where("badgetype", 2)
                                .where("daa_course_id", course_id)
        if(get != 0){
            const compare = this.compare_course_badge(user_id, course_id)

            if(compare){
                for(let index in get){
                    let badge_id = get[index].id
                    if(this.insert_badge_user(user_id, badge_id)){
                        result = 1
                        this.insert_badge_notification(user_id, badge_id)
                    }else{
                        result = 0
                    }
                }
            }
        }
        return result
    }
    compare_course_badge = async (user_id, course_id) => {
        let result = false
        let list_module = ""
        let total_module = 0
        let total_complete = 0

    	//Get module list of selected course
        const check_course = await Database.connection('db_reader')
                                        .select("dcm.module_id")
                                        .from("daa_course_modules as dcm")
                                        .join("course as c", "dcm.module_id", "c.id")
                                        .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                        .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                        .join("daa_journey_cohort_enrols as djce", "djce.journey_id", "dj.id")
                                        .join("cohort_members as cm", "cm.cohortid", "djce.cohort_id")
                                        .where("cm.userid", user_id)
                                        .where("dc.id", course_id)
                                        .where("c.visible", 1)
                                        .where("dj.visible", 1)
                                        .where("dc.visible", 1)
                                        .where("c.module_type", 1)
        if(check_course != 0){
            total_module = check_course.length
            let ids = []
            for(let index in check_course){
                ids.push(check_course[index].module_id)
            }
            //Compare total module
            const compare = await Database.connection('db_reader')
                                        .select("module_id")
                                        .from("daa_module_logs")
                                        .where("user_id", user_id)
                                        .whereIn("module_id", ids)
            if(compare != 0){
                total_complete = compare.length
                if(total_complete == total_module){
                    result = true
                }
            }
        }
        return result
    }
    check_journey_badge = async (user_id, journey_id) => {
        let result = 0
		//Get course_id by module_id = 96
        const get = await Database.connection('db_reader')
                                .select("id", "daa_journey_id", "daa_course_id", "module_id", "name", "badgetype")
                                .from("daa_badges")
                                .where("visible", 1)
                                .where("badgetype", 1)
                                .where("daa_journey_id", journey_id)
        if(get != 0){
            const compare = this.compare_journey_badge(user_id, journey_id)
            if(compare){
                for(let index in get){
                    let badge_id = get[index].id
                    if(this.insert_badge_user(user_id, badge_id)){
                        result = 1
                        this.insert_badge_notification(user_id, badge_id)
                    }else{
                        result = 0
                    }
                }
            }
        }
        return result
    }
    compare_journey_badge = async (user_id, journey_id) => {
        let result = false
        let list_module = ""
        let total_module = 0
        let total_complete = 0

    	//Get module list of selected course
        const check_course = await Database.connection('db_reader')
                                        .select("dc.id")
                                        .from("daa_courses as dc")
                                        .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                        .join("daa_journey_cohort_enrols as djce", "djce.journey_id", "dj.id")
                                        .join("cohort_members as cm", "cm.cohortid", "djce.cohort_id")
                                        .where("cm.userid", user_id)
                                        .where("dj.id", journey_id)
                                        .where("dj.visible", 1)
                                        .where("dc.visible", 1)

        if(check_course != 0){
            total_module = check_course.length
            let ids = []
            for(let index in check_course){
                ids.push(check_course[index].id)
            }
            //Compare total module
            const compare = await Database.connection('db_reader')
                                        .select("course_id")
                                        .from("daa_module_logs")
                                        .where("user_id", user_id)
                                        .whereIn("course_id", ids)
            if(compare != 0){
                total_complete = compare.length
                if(total_complete == total_module){
                    result = true
                }
            }
        }
        return result
    }
    check_advance_badge_journey = async (user_id, journey_id) => {
        let result = 0
        let badge_id = 0
		// check Have Badge
        const badge = await Database.connection('db_reader')
                                .select("id")
                                .from("daa_badges")
                                .where("visible", 1)
                                .where("badgetype", 4)
                                .where("daa_journey_id" ,journey_id)
                                .whereNull("daa_course_id")
        let compare
        if(badge_id != 0){
            for(let index in badge){
                id_badge = badge[index].id
                compare = this.compare_value_abj(user_id, badge_id, journey_id)

                if(compare){
                    if(this.insert_badge_user(user_id, badge_id)){
                        result = 1
                        this.insert_badge_notification(user_id, badge_id)
                    }else{
                        result = 0
                    }
                }else{
                    result = 0
                }
            }
        }
        return compare
    }
    compare_value_abj = async (user_id, badge_id, journey_id) => {
        let status = false
        const setting = await Database.connection('db_reader')
                                    .select("setting_name", "setting_value")
                                    .from("daa_badge_setting")
                                    .where("status", 1)
                                    .where("daa_badge_id", badge_id)
        const count = setting.length
        if(count > 0){
            let start_date = false
            let end_date = false
            let total_module_complete = false
            for(let index in setting){
                const parameter = setting[index].setting_name
                if("start_date" === parameter){
                    start_date = setting[index].setting_value
                }else if("end_date" === parameter){
                    end_date = setting[index].setting_value
                }else if("total_module_complete" === parameter){
                    total_module_complete = setting[index].setting_value
                }
            }
            if(start_date && end_date && total_module_complete){
                status = this.get_compare_value_abj(start_date, end_date, total_module_complete, user_id, journey_id)
            }
        }
        return status
    }
    get_compare_value_abj = async (start_date, end_date, total_module_complete, user_id, journey_id) => {
        const sql = "SELECT sst.id"+
                    "scorm_scoes_track sst"+
                    "JOIN scorm s ON sst.scormid = s.id"+
                    "JOIN course c ON c.id = s.course"+
                    "JOIN daa_course_modules dcm ON dcm.module_id = c.id"+
                    "JOIN daa_courses dc ON dc.id = dcm.course_id"+
                    "JOIN daa_journeys dj ON dj.id = dc.journey_id"+
                    "WHERE sst.element='cmi.core.lesson_status'"+
                    "AND sst.value IN ('passed', 'completed')"+
                    "AND (CASE WHEN (LENGTH(sst.timemodified) = 10) THEN"+
                    "DATE_FORMAT(FROM_UNIXTIME(sst.timemodified), '%Y-%m-%d') BETWEEN '"+start_date+"' AND '"+end_date+"' ELSE"+
                    "DATE_FORMAT(FROM_UNIXTIME(sst.timemodified/1000), '%Y-%m-%d') BETWEEN '"+start_date+"' AND '"+end_date+"' END"+
                    "AND sst.userid = "+userid+""+
                    "AND dj.id = "+journey_id+""+
                    "AND dj.visible = 1"+
                    "AND dc.visible = 1"+
                    "AND c.visible = 1"+
                    "GROUP BY sst.scormid"
        let data = Database.connection('db_reader').raw(sql);
        let result = false
        let complete = 0
        if(data != 0){
            complete = data.length
            if(total_module_complete <= complete){ 
                result = true
            }
        }
        return result
    }
    check_advance_badge_course = async (user_id, journey_id, course_id) => {
        let result = 0
        let badge_id = 0
		// check Have Badge
        const badge = await Database.connection('db_reader')
                                .select("id")
                                .from("daa_badges")
                                .where("visible", 1)
                                .where("badgetype", 4)
                                .where("daa_journey_id", journey_id)
                                .where("daa_course_id", course_id)
        let compare
        if(badge != 0){
            for(let index in badge){
                badge_id = badge[index].id
                compare = this.compare_value_abc(user_id, badge_id, journey_id, course_id)
                if(compare){
                    if(this.insert_badge_user(user_id, badge_id)){
                        result = 1
                        this.insert_badge_notification(user_id, badge_id)
                    }else{
                        result = 0
                    }
                }else{
                    result = 0
                }
            }
        }
        return compare
    }
    compare_value_abc = async (user_id, badge_id, journey_id, course_id) => {
        let status = false
        const setting = await Database.connection('db_reader')
                                .select("setting_name", "setting_value")
                                .from("daa_badge_setting")
                                .where("status", 1)
                                .where("daa_badge_id", badge_id)
        const count = setting.length
        if(count > 0){
            let start_date = false
            let end_date = false
            let total_module_complete = false
            for(let index in setting){
                let parameter = setting[index].setting_value
                if("start_date" === parameter){
                    start_date = setting[index].setting_value
                }else if("end_date" === parameter){
                    end_date = setting[index].setting_value
                }else if("total_module_complete" === parameter){
                    total_module_complete = setting[index].setting_value
                }

                if(start_date && end_date && total_module_complete){
                    status = this.get_compare_value_abc(start_date, end_date, total_module_complete, user_id, journey_id, course_id)
                }
            }
        }
        return status
    }
    get_compare_value_abc = async (start_date, end_date, total_module_complete, user_id, journey_id, course_id) => {
        const sql = "SELECT sst.id"+
                    "scorm_scoes_track sst"+
                    "JOIN scorm s ON sst.scormid = s.id"+
                    "JOIN course c ON c.id = s.course"+
                    "JOIN daa_course_modules dcm ON dcm.module_id = c.id"+
                    "JOIN daa_courses dc ON dc.id = dcm.course_id"+
                    "JOIN daa_journeys dj ON dj.id = dc.journey_id"+
                    "WHERE sst.element='cmi.core.lesson_status'"+
                    "AND sst.value IN ('passed', 'completed')"+
                    "AND (CASE WHEN (LENGTH(sst.timemodified) = 10) THEN"+
                    "DATE_FORMAT(FROM_UNIXTIME(sst.timemodified), '%Y-%m-%d') BETWEEN '"+start_date+"' AND '"+end_date+"' ELSE"+
                    "DATE_FORMAT(FROM_UNIXTIME(sst.timemodified/1000), '%Y-%m-%d') BETWEEN '"+start_date+"' AND '"+end_date+"' END"+
                    "AND sst.userid = "+userid+""+
                    "AND dj.id = "+journey_id+""+
                    "AND dc.id = "+course_id+""
                    "AND dj.visible = 1"+
                    "AND dc.visible = 1"+
                    "AND c.visible = 1"+
                    "GROUP BY sst.scormid"
        let check = Database.connection('db_reader').raw(sql);
        
        let result = false
        let complete = 0

        if(check != 0){
            complete = check.length
            if(total_module_complete <= complete){
                result = true
            }
        }
        return result
    }
    check_leaderboard_badge_module = async (user_id, journey_id, course_id, module_id) => {
        let result = 0
        let badge_id = 0
        let compare
		// check Have Badge
        const badge = await Database.connection('db_reader')
                                .select("id")
                                .from("daa_badges")
                                .where("visible", 1)
                                .where("badgetype", 5)
                                .where("daa_journey_id", journey_id)
                                .where("daa_course_id", course_id)
                                .where("module_id", module_id)
        if(badge != 0){
            for(let index in badge){
                badge_id = badge[index].id
                compare = this.compare_value_lbm(user_id, badge_id, journey_id, course_id, module_id)

                if(compare){
                    if(this.insert_badge_user(user_id, badge_id)){
                        result = 1
                        this.insert_badge_notification(user_id, badge_id)
                    }else{
                        result = 0
                    }
                }else{
                    result = 0
                }
            }
        }
        return compare
    }
    compare_value_lbm = async (user_id, badge_id, journey_id, course_id, module_id) => {
        let status = false
        const setting = await Database.connection('db_reader')
                                    .select("setting_name", "setting_value")
                                    .from("daa_badge_setting")
                                    .where("status", 1)
                                    .where("daa_badge_id", badge_id)
        let count = setting.length
        if(count > 0){
            let start_date = false
            let end_date = false

            for(let index in setting){
                let parameter = setting[index].setting_name
                if("start_date" === parameter){
                    start_date = setting[index].setting_value
                }else if("end_date" === parameter){
                    end_date = setting[index].setting_value
                }
            }

            if(start_date && end_date){
                status = this.get_compare_value_lbm(start_date, end_date, user_id, module_id)
            }
        }
        return status
    }
    get_compare_value_lbm = async (start_date, end_date, user_id, module_id) => {
        let result = false
        let var_start_date = new Date(start_date)
        let var_end_date = new Date(end_date)
        const diff_time = Math.abs(var_start_date - var_end_date);
        const diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));

        const check = await Database.connection('db_reader')
                                .select("*")
                                .from("daa_sst_rank_log")
                                .where("userid", user_id)
                                .where("module_id", module_id)
                                .whereBetween("rank_date", [start_date, end_date])
        const count = check.length

        if(diff_days == count){
            result = true
        }
        return result
    }
    check_leaderboard_badge_course = async (user_id, journey_id, course_id) => {
        let result = 0
        let badge_id = 0
        let compare
        let badge = await Database.connection('db_reader')
                                .select("id")
                                .from("daa_badges")
                                .where("visible", 1)
                                .where("badgetype", 5)
                                .where("daa_journey_id", journey_id)
                                .where("daa_course_id", course_id)
                                .whereNull("module_id")
        if(badge != 0){
            for(let index in badge){
                badge_id = badge[index].id
                compare = this.compare_value_lbc(user_id, badge_id, journey_id, course_id)

                if(compare){
                    if(this.insert_badge_user(user_id, badge_id)){
                        this.insert_badge_notification(user_id, badge_id)
                    }
                }else{
                    result = 0
                }
            }
        }
        return compare
    }
    compare_value_lbc = async (user_id, badge_id, journey_id, course_id) => {
        let status = false
        const setting = await Database.connection('db_reader')
                                    .select("setting_name", "setting_value")
                                    .from("daa_badge_setting")
                                    .where("status", 1)
                                    .where("daa_badge_id", badge_id)
        const count = setting.length
        if(count > 0){
            let start_date = false
            let end_date = false

            for(let index in setting){
                let parameter = setting[index].setting_name
                if("start_date" === parameter){
                    start_date = setting[index].setting_value
                }else if("end_date" === parameter){
                    end_date = setting[index].setting_value
                }
            }
            if(start_date && end_date){
                this.get_compare_value_lbc(start_date, end_date, user_id, journey_id, course_id)
            }
        }
        return status
    }
    get_compare_value_lbc = async (start_date, end_date, user_id, journey_id, course_id) => {
        const module = await Database.connection('db_reader')
                                .select("dcm.module_id")
                                .from("daa_course_modules as dcm")
                                .join("course as c", "c.id", "dcm.module_id")
                                .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                .where("dj.visible", 1)
                                .where("dc.visible", 1)
                                .where("journey_id", journey_id)
                                .where("course_id", course_id)
                                .where("c.visible", 1)
                                .where("c.module_type", 1)
        let module_id = []
        for(let index in module){
            module_id.push(module[index].module_id)
        }
        let result = false
        let var_start_date = new Date(start_date)
        let var_end_date = new Date(end_date)
        const diff_time = Math.abs(var_start_date - var_end_date);
        const diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
    
        const check = "SELECT t1.userid, t1.rank_date"+
            "FROM ("+
                "SELECT dsrl.module_id, dsrl.userid, SUM(dsrl.score) AS totalgrade, rank_date"+
                "FROM daa_sst_rank_log dsrl"+
                "WHERE dsrl.module_id IN ("+module_id+")"+
                "AND dsrl.userid="+user_id+""+
                "GROUP BY DATE_FORMAT(rank_date, '%Y-%m-%d')"
                
            ") t1"+
            "JOIN (SELECT dsrl.userid, dsrl.score_time, MAX("+
                "(CASE WHEN (LENGTH(dsrl.score_time) = 10)"+
                    "THEN"+  
                        "FROM_UNIXTIME(dsrl.score_time)"+
                    "ELSE"+ 
                        "FROM_UNIXTIME(dsrl.score_time/1000)"+
                    "END"+
                    ")"+
                ") AS timescore"+ 
                    "FROM daa_sst_rank_log dsrl"+
                    "WHERE dsrl.module_id IN ("+module_id+")"+
                    "AND dsrl.userid="+user_id+""+ 
                    "GROUP BY DATE_FORMAT(rank_date, '%Y-%m-%d')"+
                    ") t2 ON t2.userid=t1.userid"+
            "WHERE DATE_FORMAT(t1.rank_date, '%Y-%m-%d') BETWEEN '"+start_date+"' AND '"+end_date+"'"+
            "AND t1.userid = "+user_id+""+
            "GROUP BY DATE_FORMAT(t1.rank_date, '%Y-%m-%d')"+									
            "ORDER BY t1.totalgrade DESC,  t2.timescore DESC"
        let data = Database.connection('db_reader').raw(check);
        let count = data.length
        if(diff_days == count){
            result = true
        }
        return result
    }
    check_leaderboard_badge_journey = async (user_id, journey_id) => {
        let result = 0
        let badge_id = 0
        let compare
        const badge = await Database.connection('db_reader')
                                .select("id")
                                .from("daa_badges")
                                .where("visible", 1)
                                .where("badgetype", 5)
                                .where("daa_journey_id", journey_id)
                                .whereNull("daa_course_id")
                                .whereNull("module_id")
        if(badge != 0){
            for(let index in badge){
                badge_id = badge[index].id
                compare = this.compare_value_lbj(user_id, badge_id, journey_id)

                if(compare){
                    if(this.insert_badge_user(user_id, badge_id)){
                        result = 1
                        this.insert_badge_notification(user_id, badge_id)
                    }else{
                        result = 0
                    }
                }else{
                    result = 0
                }
            }
        }
        return compare
    }
    compare_value_lbj = async (user_id, badge_id, journey_id) => {
        let status = false
        const setting = await Database.connection('db_reader')
                                    .select("setting_name", "setting_value")
                                    .from("daa_badge_setting")
                                    .where("status", 1)
                                    .where("daa_badge_id", badge_id)
        const count = setting.length
        if(count > 0){
            let start_date = false
            let end_date = false
            for(let index in setting){
                let parameter = setting[index].setting_name
                if("start_date" === parameter){
                    start_date = setting[index].setting_value
                }else if("end_date" == parameter){
                    end_date = setting[index].setting_value
                }
            }
            if(start_date && end_date){
                status = this.get_compare_value_lbj(start_date, end_date, user_id, journey_id)
            }
        }
        return status
    }
    get_compare_value_lbj = async (start_date, end_date, user_id, journey_id) => {
        const module = await Database.connection('db_reader')
                                .select("dcm.module_id")
                                .from("daa_course_modules as dcm")
                                .join("course as c", "c.id", "dcm.module_id")
                                .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                .where("dj.visible", 1)
                                .where("dc.visible", 1)
                                .where("journey_id", journey_id)
                                .where("c.visible", 1)
                                .where("c.module_type", 1)
        let module_id = []
        for(let index in module){
            module_id.push(module[index].module_id)
        }
        let result = false
        let var_start_date = new Date(start_date)
        let var_end_date = new Date(end_date)
        const diff_time = Math.abs(var_start_date - var_end_date);
        const diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));

        const check = "SELECT t1.userid, t1.rank_date"+
                        "FROM ("+
                            "SELECT dsrl.module_id, dsrl.userid, SUM(dsrl.score) AS totalgrade, rank_date"+
                            "FROM daa_sst_rank_log dsrl"+
                            "WHERE dsrl.module_id IN ("+module_id+")"+
                            "AND dsrl.userid="+user_id+""+
                            "GROUP BY DATE_FORMAT(rank_date, '%Y-%m-%d')"+
                        ") t1"+ 
                        "JOIN (SELECT dsrl.userid, dsrl.score_time, MAX("+
                            "(CASE WHEN (LENGTH(dsrl.score_time) = 10)"+
                                "THEN"+  
                                    "FROM_UNIXTIME(dsrl.score_time)"
                                "ELSE" 
                                    "FROM_UNIXTIME(dsrl.score_time/1000)"
                                "END"
                                ")"
                            ") AS timescore" 
                                "FROM daa_sst_rank_log dsrl"
                                "WHERE dsrl.module_id IN ("+module_id+")"
                                "AND dsrl.userid="+user_id+" "
                                "GROUP BY DATE_FORMAT(rank_date, '%Y-%m-%d')"
                                ") t2 ON t2.userid=t1.userid"
                       " WHERE DATE_FORMAT(t1.rank_date, '%Y-%m-%d') BETWEEN '"+start_date+"' AND '"+end_date+"'"
                        "AND t1.userid = "+user_id+""
                        "GROUP BY DATE_FORMAT(t1.rank_date, '%Y-%m-%d')	"								
                        "ORDER BY t1.totalgrade DESC,  t2.timescore DESC"
        let data = Database.connection('db_reader').raw(check);
        let count = data.length
        if(diff_days == count){
           result = true
        }
        return result
    }
    check_rating_module = async (user_id, module_id) => {
        const rating = await Database.connection('db_reader')
                                .select("has_rating")
                                .from("course")
                                .where("id", module_id)
        let has_rating
        for(let index in rating){
            has_rating = rating[index].has_rating
        }
        if(has_rating == 1){
            const check_rating = await Database.connection('db_reader')
                                            .select("id")
                                            .from("daa_rating_module")
                                            .where("user_id", user_id)
                                            .where("module_id", module_id)
            if(check_rating.length == 0){
                await Database.connection('db_writer')
                            .table("daa_rating_module")
                            .insert({
                                user_id: user_id,
                                module_id: module_id,
                                created_at: new Date(),
                                updated_at: new Date()
                            })
            }
        }
    }
}

module.exports = TrackerController
