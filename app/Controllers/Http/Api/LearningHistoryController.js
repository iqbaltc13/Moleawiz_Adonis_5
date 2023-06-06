'use strict'

const Database = use('Database')
const Env = use('Env')
const { validate } = use('Validator')

class LearningHistoryController {
    //Search All 
    search_all = async ({auth, request, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        let message = ""
        let status = 0
        let data = []
        const { keyword, page } = request.all()
        const rules = {
            keyword: 'required'
        }
      
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "validator_fails", data: validation.messages()})            
        }else{
            let limit = 10
            let offset = 0
            if(page){
                offset = page*limit
            }
            //get module id
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
            let module_id = []
            if(get_module_query != 0){
                for(let index in get_module_query){
                    module_id.push(get_module_query[index].id)
                }
            }
            //all
            const module_query = await Database.connection('db_reader')
                                        .distinct("course.id")
                                        .select("course.id AS cid", "course.fullname", "course.summary", "course_format_options.value AS type", "course.scorm_file", "course.attempt AS attempt_limit", "course.module_type", "course.module_category as cat", "course.has_rating", "course.trailer", "course.description", "course.startdate", "course.enddate", "course.idnumber", "cm.id as cmid")
                                        .from("daa_course_modules")
                                        .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                        .innerJoin("course_format_options", "course_format_options.courseid","course.id")
                                        .innerJoin("course_modules as cm", "cm.course", "course.id")
                                        .innerJoin("daa_courses as dc", "dc.id", "daa_course_modules.course_id")
                                        .innerJoin("daa_journeys as dj", "dj.id", "dc.journey_id")
                                        .where("course.fullname", "LIKE", "%"+keyword+"%")
                                        .where("course.visible", 1)
                                        .where("dj.visible", 1)
                                        .where("dc.visible", 1)
                                        .groupBy("course.id")
                                        .orderBy("course.summary", "ASC")
                                        .limit(limit)
                                        .offset(offset)
            for(let index in module_query){
                const get_restrict_query = await Database.connection('db_reader')
                                                .count("dr.id as total")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                let total_restrict = 0
                for(let index in get_restrict_query){
                    total_restrict = get_restrict_query[index].total
                }
                const query_restrict = await Database.connection('db_reader')
                                                .select("dr.resid")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                let restrict_id = []
                for(let index in query_restrict){
                    restrict_id.push(query_restrict[index].resid)
                }
                const get_scorm_query = await Database.connection('db_reader')
                                                    .countDistinct("st.scormid as total")
                                                    .from("scorm as s")
                                                    .join("scorm_scoes_track as st", "st.scormid", "s.id")
                                                    .whereIn("s.course", restrict_id)
                                                    .where("st.userid", user_id)
                                                    .where("st.element", "cmi.core.lesson_status")
                                                    .where("st.value", "passed")
                                                    .orWhere("st.value", "completed")
                let total_scorm = 0
                for(let index in get_scorm_query){
                    total_scorm = get_scorm_query[index].total
                }
                let is_open = 0
                if(total_restrict == total_scorm){
                    is_open = 1
                }
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
                const current_date = new Date()
                let start_date = ""
                let end_date = ""
                if(module_query[index].startdate != null){
                    start_date = module_query[index].startdate.getFullYear()+"-"+month[module_query[index].startdate.getMonth()+1]+"-"+module_query[index].startdate.getDate()

                }
                if(module_query[index].enddate != null){
                    end_date = module_query[index].enddate.getFullYear()+"-"+month[module_query[index].enddate.getMonth()+1]+"-"+module_query[index].enddate.getDate()
                }
                if(module_query[index].description == null){
                    module_query[index].description = ""
                }
                let category_name = ""
                if(module_query[index].cat != null){
                    const get_category = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("daa_module_category")
                                                    .where("id", module_query[index].cat)
                    for(let index in get_category){
                        category_name = get_category[index].name
                    }
                }
                const get_daa_restrict = await Database.connection('db_reader')
                                                    .select("daa_restrict.id", "daa_restrict.acttype", "daa_restrict.actid", "daa_restrict.resid", "course.fullname AS module_name")
                                                    .from("daa_restrict")
                                                    .innerJoin("daa_course_modules", "daa_course_modules.id", "daa_restrict.actid")
                                                    .innerJoin("course", "course.id", "daa_restrict.resid")
                                                    .where("daa_course_modules.module_id", module_query[index].id)
                                                    .where("acttype", 3)
                let restrict_name = []
                if(get_daa_restrict != 0){
                    for(let index in get_daa_restrict){
                        restrict_name.push(get_daa_restrict[index].module_name)
                    }
                }
                //Get Thumbnails File
                const file = await Database.connection('db_reader')
                                        .select("files.contextid", "files.filename")
                                        .from("files")
                                        .join("context", "context.id", "files.contextid")
                                        .where("files.component", "course")
                                        .where("files.filearea", "overviewfiles")
                                        .where("context.contextlevel", 50)
                                        .where("context.instanceid", module_query[index].id)
                                        .limit(1)
                let thumbnail = ""
                if(file != 0){
                    for(let index in file){
                        const url = Env.get('APP_URL')+'/uploads/file/'
                        thumbnail = url+file[index].filename
                    }
                }
                //Get moodle SCORM data
                const get_sco_data = await Database.connection('db_reader')
                                                .select('scorm.id AS scorm_id', 'scorm_scoes.id AS sco_id', 'scorm.reference')
                                                .from("scorm")
                                                .join('scorm_scoes', 'scorm_scoes.scorm', '=', 'scorm.id')
                                                .where("scorm.course", module_query[index].id)
                                                .whereNot("scorm_scoes.parent", "/")
                                                .limit(1)
                let scorm_id = 0
                let sco_id = 0
                let reference = ""
                if(get_sco_data != 0){
                    for(let index in get_sco_data){
                        scorm_id = get_sco_data[index].scorm_id
                        sco_id = get_sco_data[index].sco_id
                        reference = get_sco_data[index].reference
                    }
                }
                //Get Completed or Incomplete
                const lesson_data = await Database.connection('db_reader')
                                                .select("daa_module_logs.id")
                                                .from("daa_module_logs")
                                                .where("daa_module_logs.user_id", user_id)
                                                .where("daa_module_logs.module_id", module_query[index].id)
                                                .where("daa_module_logs.is_completed", 1)
                                                .limit(1)
                const is_complete = 0
                if(lesson_data != 0){
                    is_complete = 1
                }
                const total_attempt = 0
                //Get Completed or Incomplete
                if(scorm_id != 0){
                    const attempt_data = await Database.connection('db_reader')
                                                    .select("scorm_scoes_track.id AS track_id", "scorm_scoes_track.attempt", "scorm_scoes_track.value")
                                                    .from("scorm_scoes_track")
                                                    .where("scorm_scoes_track.userid", user_id)
                                                    .where("scorm_scoes_track.scormid", scorm_id)
                                                    .where("scorm_scoes_track.scoid", sco_id)
                                                    .orderBy("scorm_scoes_track.attempt", "DESC")
                                                    .limit(1)
                    if(attempt_data != 0){
                        for(let index in attempt_data){
                            if(attempt_data[index].value == "incomplete"){
                                total_attempt = attempt_data[index].attempt-1
                            }else{
                                total_attempt = attempt_data[index].attempt
                            }
                        }
                    }
                }
                const scorm_name = reference.replace(".zip", "")
                //get module competent
                const lesson_data_query = await Database.connection('db_reader')
                                                    .select("daa_module_logs.id")
                                                    .from("daa_module_logs")
                                                    .where("daa_module_logs.user_id", user_id)
                                                    .where("daa_module_logs.module_id", module_query[index].id)
                                                    .where("daa_module_logs.is_competent", 1)
                                                    .limit(1)
                let is_competent = 0
                if(lesson_data_query != 0 ){
                    is_competent = 1
                }
                //check module is placement test
                const is_placement_test_query = await Database.connection('db_reader')
                                                    .select("course.id")
                                                    .from("course")
                                                    .where("course.id", module_query[index].id)
                                                    .where("course.is_placement_test", 1)
                                                    .limit(1)
                let is_placement_test = 0
                let is_placement_test_submitted = 0
                if(is_placement_test_query != 0){
                    is_placement_test = 1
                    
                    const is_submit_query = await Database.connection('db_reader')
                                                        .select("daa_placement_test_result.id")
                                                        .from("daa_placement_test_result")
                                                        .where("daa_placement_test_result.user_id", user_id)
                                                        .where("daa_placement_test_result.module_id", module_query[index].id)
                                                        .where("daa_placement_test_result.is_submit", 1)
                                                        .limit(1)
                    if(is_submit_query != 0){
                        is_placement_test_submitted = 1
                    }
                }else{
                    is_placement_test_submitted = 1
                }
                //Check module is unity or not
                const check_is_unity = await Database.connection('db_reader')
                                                .select("course.id")
                                                .from("course")
                                                .where("course.id", module_query[index].id)
                                                .where("course.unity", 1)
                                                .limit(1)
                let unity = 0
                if(check_is_unity != 0){
                    unity = 1
                }
                //Has Trailer
                let has_trailer = 0
                let trailer = ""
                if(module_query[index].trailer){
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    has_trailer = 1
                    trailer = url+module_query[index].trailer
                }
                //Get Journey, Course
                const get_jcm = await Database.connection('db_reader')
                                            .select("dj.id as journey_id", "dj.name as journey_name", "dc.id as course_id", "dc.name as course_name")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                            .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                            .join("course as c", "c.id", "dcm.module_id")
                                            .where("c.id", module_query[index].id)
                let journey_id = 0
                let journey_name = ""
                let course_id = 0
                let course_name = ""
                if(get_jcm !=0 ){
                    for(let index in get_jcm){
                        journey_id = get_jcm[index].journey_id
                        journey_name = get_jcm[index].journey_name
                        course_id = get_jcm[index].course_id
                        course_name = get_jcm[index].course_name
                    }
                }
                //Submit Rating
                const rating = await Database.connection('db_reader')
                                        .select("id")
                                        .from("daa_rating_module")
                                        .where("module_id", module_query[index].id)
                let has_submit_rating = 0
                if(rating.length > 0){
                    has_submit_rating = 1
                }
                var element = {}
                element.cid = module_query[index].cid
                element.fullname = module_query[index].fullname
                element.summary = module_query[index].summary
                element.type = module_query[index].type
                element.scorm_file = module_query[index].scorm_file
                element.attempt_limit = module_query[index].attempt_limit
                element.module_type = module_query[index].module_type
                element.cat = module_query[index].cat
                element.has_rating = module_query[index].has_rating
                element.trailer = module_query[index].trailer
                element.description = module_query[index].description
                element.currentdate = current_date
                element.startdate = start_date
                element.enddate = end_date
                element.idnumber = module_query[index].idnumber
                element.isopen = is_open
                element.cmid = module_query[index].cmid
                element.total_attempt = 0
                element.category = category_name
                element.restrict = restrict_name
                element.thumbnail = thumbnail
                element.scorm_id = scorm_id
                element.sco_id = sco_id
                element.reference = reference
                element.is_complete = is_complete
                element.scorm_name = scorm_name
                element.is_competent = is_competent
                element.is_placement_test = is_placement_test
                element.is_placement_test_submitted = is_placement_test_submitted
                element.unity = unity
                element.has_trailer = has_trailer
                element.trailer = trailer
                element.journey_id = journey_id
                element.journey_name = journey_name
                element.course_id = course_id
                element.course_name = course_name
                element.has_submit_rating = has_submit_rating 
                
                data.push(element)
            }
            return response.send({status: 200, message: "Ok", data: data})
        }
    }
    //Content Library
    content_library = async ({auth, params, response}) => {
        const get_module_category = await Database.connection('db_reader')
                                                .select("*")
                                                .from("daa_content_library")
                                                .where("visible", 1)
                                                .orderBy("name", "DESC")
        for(let index in get_module_category){
            if(get_module_category[index].thumbnail){
                const url = Env.get('APP_URL')+'/uploads/assets/images/'
                get_module_category[index].thumbnail = url+get_module_category[index].thumbnail
            }else{
                get_module_category[index].thumbnail = ""
            }
            if(get_module_category[index].note == null){
                get_module_category[index].note = ""
            }
        }
        return response.send({status: 200, message: "Ok", data: get_module_category})
    }
    // Module History
    learning_journey_history = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const limit = 10
        const offset = params.page*limit
        let module_id = []
        let data = []

        const get_module_query = await Database.connection('db_reader')
                                            .select("c.id")
                                            .from("scorm_scoes_track as m")
                                            .join("scorm as s", "s.id", "m.scormid")
                                            .join("course as c", "c.id", "s.course")
                                            .join("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                            .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                            .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                            .join("daa_journey_cohort_enrols as djce", "djce.journey_id", "dj.id")
                                            .join("cohort as ch", "ch.id", "djce.cohort_id")
                                            .join("cohort_members as cm", "cm.cohortid", "ch.id")
                                            .join("user as u", "u.id", "cm.userid")
                                            .where("u.id", user_id)
                                            .where("m.userid", user_id)
                                            .where("m.element", "cmi.core.lesson_status")
                                            .whereIn("m.value", ["passed", "completed"])
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
                                            .groupBy("c.id")
                                            .orderBy("m.timemodified", "DESC")
        if(get_module_query != 0){
            for(let index in get_module_query){
                module_id.push(get_module_query[index].id)
            }
        }
        const module_query = await Database.connection('db_reader')
                                        .distinct("course.id")
                                        .select("course.id AS cid", "course.fullname", "course.summary", "course_format_options.value AS type", "course.scorm_file", "course.attempt AS attempt_limit", "course.module_type", "course.module_category as cat", "course.has_rating", "course.trailer", "course.description", "course.startdate", "course.enddate", "course.idnumber", "cm.id as cmid")
                                        .from("daa_course_modules")
                                        .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                        .innerJoin("course_format_options", "course_format_options.courseid","course.id")
                                        .innerJoin("course_modules as cm", "cm.course", "course.id")
                                        .innerJoin("daa_module_logs as dml", "dml.module_id", "course.id")
                                        .whereIn("id", module_id)
                                        .where("course.visible", 1)
                                        .where("dml.user_id", user_id)
                                        .where("dml.is_completed", 1)
                                        .groupBy("cid")
                                        .limit(limit)
                                        .offset(offset)
        for(let index in module_query){
            const get_restrict_query = await Database.connection('db_reader')
                                            .count("dr.id as total")
                                            .from("daa_restrict as dr")
                                            .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                            .where("dcm.module_id", module_query[index].cid)
                                            .where("acttype", 3)
            const total_restrict = 0
            for(let index in get_restrict_query){
                total_restrict = get_restrict_query[index].total
            }
            const query_restrict = await Database.connection('db_reader')
                                            .select("dr.resid")
                                            .from("daa_restrict as dr")
                                            .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                            .where("dcm.module_id", module_query[index].cid)
                                            .where("acttype", 3)
            let restrict_id = []
            for(let index in query_restrict){
                restrict_id.push(query_restrict[index].resid)
            }
            const get_scorm_query = await Database.connection('db_reader')
                                                .countDistinct("st.scormid as total")
                                                .from("scorm as s")
                                                .join("scorm_scoes_track as st", "st.scormid", "s.id")
                                                .whereIn("s.course", restrict_id)
                                                .where("st.userid", user_id)
                                                .where("st.element", "cmi.core.lesson_status")
                                                .where("st.value", "passed")
                                                .orWhere("st.value", "completed")
            let total_scorm = 0
            for(let index in get_scorm_query){
                total_scorm = get_scorm_query[index].total
            }
            let is_open = 0
            if(total_restrict == total_scorm){
                is_open = 1
            }
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
            const current_date = new Date()
            let start_date = ""
            let end_date = ""
            if(module_query[index].startdate != null){
                start_date = module_query[index].startdate.getFullYear()+"-"+month[module_query[index].startdate.getMonth()+1]+"-"+module_query[index].startdate.getDate()

            }
            if(module_query[index].enddate != null){
                end_date = module_query[index].enddate.getFullYear()+"-"+month[module_query[index].enddate.getMonth()+1]+"-"+module_query[index].enddate.getDate()
            }
            if(module_query[index].description == null){
                module_query[index].description = ""
            }
            let category_name = ""
            if(module_query[index].cat != null){
                const get_category = await Database.connection('db_reader')
                                                .select("*")
                                                .from("daa_module_category")
                                                .where("id", module_query[index].cat)
                for(let index in get_category){
                    category_name = get_category[index].name
                }
            }
            const get_daa_restrict = await Database.connection('db_reader')
                                                .select("daa_restrict.id", "daa_restrict.acttype", "daa_restrict.actid", "daa_restrict.resid", "course.fullname AS module_name")
                                                .from("daa_restrict")
                                                .innerJoin("daa_course_modules", "daa_course_modules.id", "daa_restrict.actid")
                                                .innerJoin("course", "course.id", "daa_restrict.resid")
                                                .where("daa_course_modules.module_id", module_query[index].id)
                                                .where("acttype", 3)
            let restrict_name = []
            if(get_daa_restrict != 0){
                for(let index in get_daa_restrict){
                    restrict_name.push(get_daa_restrict[index].module_name)
                }
            }
            //Get Thumbnails File
            const file = await Database.connection('db_reader')
                                    .select("files.contextid", "files.filename")
                                    .from("files")
                                    .join("context", "context.id", "files.contextid")
                                    .where("files.component", "course")
                                    .where("files.filearea", "overviewfiles")
                                    .where("context.contextlevel", 50)
                                    .where("context.instanceid", module_query[index].id)
                                    .limit(1)
            let thumbnail = ""
            if(file != 0){
                for(let index in file){
                    const url = Env.get('APP_URL')+'/uploads/file/'
                    thumbnail = url+file[index].filename
                }
            }
            //Get moodle SCORM data
            const get_sco_data = await Database.connection('db_reader')
                                            .select('scorm.id AS scorm_id', 'scorm_scoes.id AS sco_id', 'scorm.reference')
                                            .from("scorm")
                                            .join('scorm_scoes', 'scorm_scoes.scorm', '=', 'scorm.id')
                                            .where("scorm.course", module_query[index].id)
                                            .whereNot("scorm_scoes.parent", "/")
                                            .limit(1)
            let scorm_id = 0
            let sco_id = 0
            let reference = ""
            if(get_sco_data != 0){
                for(let index in get_sco_data){
                    scorm_id = get_sco_data[index].scorm_id
                    sco_id = get_sco_data[index].sco_id
                    reference = get_sco_data[index].reference
                }
            }
            //Get Completed or Incomplete
            const lesson_data = await Database.connection('db_reader')
                                            .select("daa_module_logs.id")
                                            .from("daa_module_logs")
                                            .where("daa_module_logs.user_id", user_id)
                                            .where("daa_module_logs.module_id", module_query[index].id)
                                            .where("daa_module_logs.is_completed", 1)
                                            .limit(1)
            const is_complete = 0
            if(lesson_data != 0){
                is_complete = 1
            }
            const total_attempt = 0
            //Get Completed or Incomplete
            if(scorm_id != 0){
                const attempt_data = await Database.connection('db_reader')
                                                .select("scorm_scoes_track.id AS track_id", "scorm_scoes_track.attempt", "scorm_scoes_track.value")
                                                .from("scorm_scoes_track")
                                                .where("scorm_scoes_track.userid", user_id)
                                                .where("scorm_scoes_track.scormid", scorm_id)
                                                .where("scorm_scoes_track.scoid", sco_id)
                                                .orderBy("scorm_scoes_track.attempt", "DESC")
                                                .limit(1)
                if(attempt_data != 0){
                    for(let index in attempt_data){
                        if(attempt_data[index].value == "incomplete"){
                            total_attempt = attempt_data[index].attempt-1
                        }else{
                            total_attempt = attempt_data[index].attempt
                        }
                    }
                }
            }
            const scorm_name = reference.replace(".zip", "")
			//get module competent
            const lesson_data_query = await Database.connection('db_reader')
                                                .select("daa_module_logs.id")
                                                .from("daa_module_logs")
                                                .where("daa_module_logs.user_id", user_id)
                                                .where("daa_module_logs.module_id", module_query[index].id)
                                                .where("daa_module_logs.is_competent", 1)
                                                .limit(1)
            let is_competent = 0
            if(lesson_data_query != 0 ){
                is_competent = 1
            }
			//check module is placement test
            const is_placement_test_query = await Database.connection('db_reader')
                                                .select("course.id")
                                                .from("course")
                                                .where("course.id", module_query[index].id)
                                                .where("course.is_placement_test", 1)
                                                .limit(1)
            let is_placement_test = 0
            let is_placement_test_submitted = 0
            if(is_placement_test_query != 0){
                is_placement_test = 1
                
                const is_submit_query = await Database.connection('db_reader')
                                                    .select("daa_placement_test_result.id")
                                                    .from("daa_placement_test_result")
                                                    .where("daa_placement_test_result.user_id", user_id)
                                                    .where("daa_placement_test_result.module_id", module_query[index].id)
                                                    .where("daa_placement_test_result.is_submit", 1)
                                                    .limit(1)
                if(is_submit_query != 0){
                    is_placement_test_submitted = 1
                }
            }else{
                is_placement_test_submitted = 1
            }
			//Check module is unity or not
            const check_is_unity = await Database.connection('db_reader')
                                            .select("course.id")
                                            .from("course")
                                            .where("course.id", module_query[index].id)
                                            .where("course.unity", 1)
                                            .limit(1)
            let unity = 0
            if(check_is_unity != 0){
                unity = 1
            }
            //Has Trailer
            let has_trailer = 0
            let trailer = ""
            if(module_query[index].trailer){
                const url = Env.get('APP_URL')+'/uploads/assets/images/'
                has_trailer = 1
                trailer = url+module_query[index].trailer
            }
            //Get Journey, Course
            const get_jcm = await Database.connection('db_reader')
                                        .select("dj.id as journey_id", "dj.name as journey_name", "dc.id as course_id", "dc.name as course_name")
                                        .from("daa_journeys as dj")
                                        .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                        .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                        .join("course as c", "c.id", "dcm.module_id")
                                        .where("c.id", module_query[index].id)
            let journey_id = 0
            let journey_name = ""
            let course_id = 0
            let course_name = ""
            if(get_jcm !=0 ){
                for(let index in get_jcm){
                    journey_id = get_jcm[index].journey_id
                    journey_name = get_jcm[index].journey_name
                    course_id = get_jcm[index].course_id
                    course_name = get_jcm[index].course_name
                }
            }
            //Submit Rating
            const rating = await Database.connection('db_reader')
                                    .select("id")
                                    .from("daa_rating_module")
                                    .where("module_id", module_query[index].id)
            let has_submit_rating = 0
            if(rating.length > 0){
                has_submit_rating = 1
            }
            var element = {}
            element.cid = module_query[index].cid
            element.fullname = module_query[index].fullname
            element.summary = module_query[index].summary
            element.type = module_query[index].type
            element.scorm_file = module_query[index].scorm_file
            element.attempt_limit = module_query[index].attempt_limit
            element.module_type = module_query[index].module_type
            element.cat = module_query[index].cat
            element.has_rating = module_query[index].has_rating
            element.trailer = module_query[index].trailer
            element.description = module_query[index].description
            element.currentdate = current_date
            element.startdate = start_date
            element.enddate = end_date
            element.idnumber = module_query[index].idnumber
            element.isopen = is_open
            element.cmid = module_query[index].cmid
            element.total_attempt = 0
            element.category = category_name
            element.restrict = restrict_name
            element.thumbnail = thumbnail
            element.scorm_id = scorm_id
            element.sco_id = sco_id
            element.reference = reference
            element.is_complete = is_complete
            element.scorm_name = scorm_name
            element.is_competent = is_competent
            element.is_placement_test = is_placement_test
            element.is_placement_test_submitted = is_placement_test_submitted
            element.unity = unity
            element.has_trailer = has_trailer
            element.trailer = trailer
            element.journey_id = journey_id
            element.journey_name = journey_name
            element.course_id = course_id
            element.course_name = course_name
            element.has_submit_rating = has_submit_rating 
            
            data.push(element)
        }
        // return module
        return response.send({status: 200, message: "Ok", data: data})

    }
    //Learning History - Content Library
    learning_content_history = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const limit = 10
        const offset = params.page*limit
        let module_id = []
        let completed_module_id = []
        let data = []
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
                                            .groupBy("c.id")
        for(let index in get_module_query){
            module_id.push(get_module_query[index].id)
        }
        const get_module_completed_query = await Database.connection('db_reader')
                                            .select("c.id")
                                            .from("scorm_scoes_track as m")
                                            .join("scorm as s", "s.id", "m.scormid")
                                            .join("course as c", "c.id", "s.course")
                                            .join("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                            .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                            .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                            .where("m.userid", user_id)
                                            .where("m.element", "cmi.core.lesson_status")
                                            .whereIn("m.value", ["passed", "completed"])
                                            .whereNotIn("c.id", module_id)
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
                                            .groupBy("c.id")
                                            .orderBy("m.timemodified", "DESC")
        for(let index in get_module_completed_query){
            completed_module_id.push(get_module_completed_query[index].id)
        }
        const module_query = await Database.connection('db_reader')
                                        .distinct("course.id")
                                        .select("course.id AS cid", "course.fullname", "course.summary", "course_format_options.value AS type", "course.scorm_file", "course.attempt AS attempt_limit", "course.module_type", "course.module_category as cat", "course.has_rating", "course.trailer", "course.description", "course.startdate", "course.enddate", "course.idnumber", "cm.id as cmid")
                                        .from("daa_course_modules")
                                        .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                        .innerJoin("course_format_options", "course_format_options.courseid","course.id")
                                        .innerJoin("course_modules as cm", "cm.course", "course.id")
                                        .innerJoin("daa_module_logs as dml", "dml.module_id", "course.id")
                                        .whereIn("course.id", completed_module_id)
                                        .where("course.visible", 1)
                                        .where("dml.user_id", user_id)
                                        .where("dml.is_completed", 1)
                                        .groupBy("cid")
                                        .orderBy("dml.last_open", "DESC")
                                        .limit(limit)
                                        .offset(offset)
        for(let index in module_query){
            const get_restrict_query = await Database.connection('db_reader')
                                            .count("dr.id as total")
                                            .from("daa_restrict as dr")
                                            .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                            .where("dcm.module_id", module_query[index].cid)
                                            .where("acttype", 3)
            const total_restrict = 0
            for(let index in get_restrict_query){
                total_restrict = get_restrict_query[index].total
            }
            const query_restrict = await Database.connection('db_reader')
                                            .select("dr.resid")
                                            .from("daa_restrict as dr")
                                            .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                            .where("dcm.module_id", module_query[index].cid)
                                            .where("acttype", 3)
            let restrict_id = []
            for(let index in query_restrict){
                restrict_id.push(query_restrict[index].resid)
            }
            const get_scorm_query = await Database.connection('db_reader')
                                                .countDistinct("st.scormid as total")
                                                .from("scorm as s")
                                                .join("scorm_scoes_track as st", "st.scormid", "s.id")
                                                .whereIn("s.course", restrict_id)
                                                .where("st.userid", user_id)
                                                .where("st.element", "cmi.core.lesson_status")
                                                .where("st.value", "passed")
                                                .orWhere("st.value", "completed")
            let total_scorm = 0
            for(let index in get_scorm_query){
                total_scorm = get_scorm_query[index].total
            }
            let is_open = 0
            if(total_restrict == total_scorm){
                is_open = 1
            }
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
            const current_date = new Date()
            let start_date = ""
            let end_date = ""
            if(module_query[index].startdate != null){
                start_date = module_query[index].startdate.getFullYear()+"-"+month[module_query[index].startdate.getMonth()+1]+"-"+module_query[index].startdate.getDate()

            }
            if(module_query[index].enddate != null){
                end_date = module_query[index].enddate.getFullYear()+"-"+month[module_query[index].enddate.getMonth()+1]+"-"+module_query[index].enddate.getDate()
            }
            if(module_query[index].description == null){
                module_query[index].description = ""
            }
            let category_name = ""
            if(module_query[index].cat != null){
                const get_category = await Database.connection('db_reader')
                                                .select("*")
                                                .from("daa_module_category")
                                                .where("id", module_query[index].cat)
                for(let index in get_category){
                    category_name = get_category[index].name
                }
            }
            const get_daa_restrict = await Database.connection('db_reader')
                                                .select("daa_restrict.id", "daa_restrict.acttype", "daa_restrict.actid", "daa_restrict.resid", "course.fullname AS module_name")
                                                .from("daa_restrict")
                                                .innerJoin("daa_course_modules", "daa_course_modules.id", "daa_restrict.actid")
                                                .innerJoin("course", "course.id", "daa_restrict.resid")
                                                .where("daa_course_modules.module_id", module_query[index].id)
                                                .where("acttype", 3)
            let restrict_name = []
            if(get_daa_restrict != 0){
                for(let index in get_daa_restrict){
                    restrict_name.push(get_daa_restrict[index].module_name)
                }
            }
            //Get Thumbnails File
            const file = await Database.connection('db_reader')
                                    .select("files.contextid", "files.filename")
                                    .from("files")
                                    .join("context", "context.id", "files.contextid")
                                    .where("files.component", "course")
                                    .where("files.filearea", "overviewfiles")
                                    .where("context.contextlevel", 50)
                                    .where("context.instanceid", module_query[index].id)
                                    .limit(1)
            let thumbnail = ""
            if(file != 0){
                for(let index in file){
                    const url = Env.get('APP_URL')+'/uploads/file/'
                    thumbnail = url+file[index].filename
                }
            }
            //Get moodle SCORM data
            const get_sco_data = await Database.connection('db_reader')
                                            .select('scorm.id AS scorm_id', 'scorm_scoes.id AS sco_id', 'scorm.reference')
                                            .from("scorm")
                                            .join('scorm_scoes', 'scorm_scoes.scorm', '=', 'scorm.id')
                                            .where("scorm.course", module_query[index].id)
                                            .whereNot("scorm_scoes.parent", "/")
                                            .limit(1)
            let scorm_id = 0
            let sco_id = 0
            let reference = ""
            if(get_sco_data != 0){
                for(let index in get_sco_data){
                    scorm_id = get_sco_data[index].scorm_id
                    sco_id = get_sco_data[index].sco_id
                    reference = get_sco_data[index].reference
                }
            }
            //Get Completed or Incomplete
            const lesson_data = await Database.connection('db_reader')
                                            .select("daa_module_logs.id")
                                            .from("daa_module_logs")
                                            .where("daa_module_logs.user_id", user_id)
                                            .where("daa_module_logs.module_id", module_query[index].id)
                                            .where("daa_module_logs.is_completed", 1)
                                            .limit(1)
            const is_complete = 0
            if(lesson_data != 0){
                is_complete = 1
            }
            const total_attempt = 0
            //Get Completed or Incomplete
            if(scorm_id != 0){
                const attempt_data = await Database.connection('db_reader')
                                                .select("scorm_scoes_track.id AS track_id", "scorm_scoes_track.attempt", "scorm_scoes_track.value")
                                                .from("scorm_scoes_track")
                                                .where("scorm_scoes_track.userid", user_id)
                                                .where("scorm_scoes_track.scormid", scorm_id)
                                                .where("scorm_scoes_track.scoid", sco_id)
                                                .orderBy("scorm_scoes_track.attempt", "DESC")
                                                .limit(1)
                if(attempt_data != 0){
                    for(let index in attempt_data){
                        if(attempt_data[index].value == "incomplete"){
                            total_attempt = attempt_data[index].attempt-1
                        }else{
                            total_attempt = attempt_data[index].attempt
                        }
                    }
                }
            }
            const scorm_name = reference.replace(".zip", "")
			//get module competent
            const lesson_data_query = await Database.connection('db_reader')
                                                .select("daa_module_logs.id")
                                                .from("daa_module_logs")
                                                .where("daa_module_logs.user_id", user_id)
                                                .where("daa_module_logs.module_id", module_query[index].id)
                                                .where("daa_module_logs.is_competent", 1)
                                                .limit(1)
            let is_competent = 0
            if(lesson_data_query != 0 ){
                is_competent = 1
            }
			//check module is placement test
            const is_placement_test_query = await Database.connection('db_reader')
                                                .select("course.id")
                                                .from("course")
                                                .where("course.id", module_query[index].id)
                                                .where("course.is_placement_test", 1)
                                                .limit(1)
            let is_placement_test = 0
            let is_placement_test_submitted = 0
            if(is_placement_test_query != 0){
                is_placement_test = 1
                
                const is_submit_query = await Database.connection('db_reader')
                                                    .select("daa_placement_test_result.id")
                                                    .from("daa_placement_test_result")
                                                    .where("daa_placement_test_result.user_id", user_id)
                                                    .where("daa_placement_test_result.module_id", module_query[index].id)
                                                    .where("daa_placement_test_result.is_submit", 1)
                                                    .limit(1)
                if(is_submit_query != 0){
                    is_placement_test_submitted = 1
                }
            }else{
                is_placement_test_submitted = 1
            }
			//Check module is unity or not
            const check_is_unity = await Database.connection('db_reader')
                                            .select("course.id")
                                            .from("course")
                                            .where("course.id", module_query[index].id)
                                            .where("course.unity", 1)
                                            .limit(1)
            let unity = 0
            if(check_is_unity != 0){
                unity = 1
            }
            //Has Trailer
            let has_trailer = 0
            let trailer = ""
            if(module_query[index].trailer){
                const url = Env.get('APP_URL')+'/uploads/assets/images/'
                has_trailer = 1
                trailer = url+module_query[index].trailer
            }
            //Get Journey, Course
            const get_jcm = await Database.connection('db_reader')
                                        .select("dj.id as journey_id", "dj.name as journey_name", "dc.id as course_id", "dc.name as course_name")
                                        .from("daa_journeys as dj")
                                        .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                        .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                        .join("course as c", "c.id", "dcm.module_id")
                                        .where("c.id", module_query[index].id)
            let journey_id = 0
            let journey_name = ""
            let course_id = 0
            let course_name = ""
            if(get_jcm !=0 ){
                for(let index in get_jcm){
                    journey_id = get_jcm[index].journey_id
                    journey_name = get_jcm[index].journey_name
                    course_id = get_jcm[index].course_id
                    course_name = get_jcm[index].course_name
                }
            }
            //Submit Rating
            const rating = await Database.connection('db_reader')
                                    .select("id")
                                    .from("daa_rating_module")
                                    .where("module_id", module_query[index].id)
            let has_submit_rating = 0
            if(rating.length > 0){
                has_submit_rating = 1
            }
            var element = {}
            element.cid = module_query[index].cid
            element.fullname = module_query[index].fullname
            element.summary = module_query[index].summary
            element.type = module_query[index].type
            element.scorm_file = module_query[index].scorm_file
            element.attempt_limit = module_query[index].attempt_limit
            element.module_type = module_query[index].module_type
            element.cat = module_query[index].cat
            element.has_rating = module_query[index].has_rating
            element.trailer = module_query[index].trailer
            element.description = module_query[index].description
            element.currentdate = current_date
            element.startdate = start_date
            element.enddate = end_date
            element.idnumber = module_query[index].idnumber
            element.isopen = is_open
            element.cmid = module_query[index].cmid
            element.total_attempt = 0
            element.category = category_name
            element.restrict = restrict_name
            element.thumbnail = thumbnail
            element.scorm_id = scorm_id
            element.sco_id = sco_id
            element.reference = reference
            element.is_complete = is_complete
            element.scorm_name = scorm_name
            element.is_competent = is_competent
            element.is_placement_test = is_placement_test
            element.is_placement_test_submitted = is_placement_test_submitted
            element.unity = unity
            element.has_trailer = has_trailer
            element.trailer = trailer
            element.journey_id = journey_id
            element.journey_name = journey_name
            element.course_id = course_id
            element.course_name = course_name
            element.has_submit_rating = has_submit_rating 
            
            data.push(element)
        }
        return response.send({status: 200, message: "Ok", data: data})

    }
    //Continue Learning Journey
    continue_learning_journey = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const limit = 10
        const offset = params.page*limit
        let module_id = []
        let module_not_completed = []
        let data = []
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
                                            .groupBy("c.id")
        for(let index in get_module_query){
            module_id.push(get_module_query[index].id)
        }
        let scorm_id = []
        const get_scorm_id = await Database.connection('db_reader')
                                        .select("id")
                                        .from("scorm")
                                        .whereIn("course", module_id)
        for(let index in get_scorm_id){
            scorm_id.push(get_scorm_id[index].id)
        }
        const max_attempt_query = await Database.connection('db_reader')
                                            .select("s.course")
                                            .max("sst.attempt as max_attempt")
                                            .from("scorm_scoes_track as sst")
                                            .join("scorm as s", "s.id", "sst.scormid")
                                            .join("course as c", "c.id", "s.course")
                                            .join("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                            .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                            .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                            .whereIn("scormid", scorm_id)
                                            .where("sst.userid", user_id)
                                            .where("sst.element", "cmi.core.lesson_status")
                                            .whereNotIn("sst.value", ["completed", "passed"])
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
                                            .groupBy("sst.scormid")
        for(let index in max_attempt_query){
            module_not_completed.push(max_attempt_query[index].course)
        }
        const module_query = await Database.connection('db_reader')
                                        .distinct("course.id")
                                        .select("course.id AS cid", "course.fullname", "course.summary", "course_format_options.value AS type", "course.scorm_file", "course.attempt AS attempt_limit", "course.module_type", "course.module_category as cat", "course.has_rating", "course.trailer", "course.description", "sst.timemodified as tgl", "course.startdate", "course.enddate", "course.idnumber", "cm.id as cmid")
                                        .from("daa_course_modules")
                                        .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                        .innerJoin("course_format_options", "course_format_options.courseid","course.id")
                                        .innerJoin("course_modules as cm", "cm.course", "course.id")
                                        .innerJoin("scorm as s", "s.course", "course.id")
                                        .innerJoin("scorm_scoes_track as sst", "sst.scormid", "s.id")
                                        .whereIn("course.id", module_not_completed)
                                        .where("course.visible", 1)
                                        .where("sst.userid", user_id)
                                        .groupBy("cid")
                                        .orderBy("tgl", "DESC")
                                        .limit(limit)
                                        .offset(offset)
        for(let index in module_query){
            const get_restrict_query = await Database.connection('db_reader')
                                            .count("dr.id as total")
                                            .from("daa_restrict as dr")
                                            .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                            .where("dcm.module_id", module_query[index].cid)
                                            .where("acttype", 3)
            const total_restrict = 0
            for(let index in get_restrict_query){
                total_restrict = get_restrict_query[index].total
            }
            const query_restrict = await Database.connection('db_reader')
                                            .select("dr.resid")
                                            .from("daa_restrict as dr")
                                            .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                            .where("dcm.module_id", module_query[index].cid)
                                            .where("acttype", 3)
            let restrict_id = []
            for(let index in query_restrict){
                restrict_id.push(query_restrict[index].resid)
            }
            const get_scorm_query = await Database.connection('db_reader')
                                                .countDistinct("st.scormid as total")
                                                .from("scorm as s")
                                                .join("scorm_scoes_track as st", "st.scormid", "s.id")
                                                .whereIn("s.course", restrict_id)
                                                .where("st.userid", user_id)
                                                .where("st.element", "cmi.core.lesson_status")
                                                .where("st.value", "passed")
                                                .orWhere("st.value", "completed")
            let total_scorm = 0
            for(let index in get_scorm_query){
                total_scorm = get_scorm_query[index].total
            }
            let is_open = 0
            if(total_restrict == total_scorm){
                is_open = 1
            }
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
            const current_date = new Date()
            let start_date = ""
            let end_date = ""
            if(module_query[index].startdate != null){
                start_date = module_query[index].startdate.getFullYear()+"-"+month[module_query[index].startdate.getMonth()+1]+"-"+module_query[index].startdate.getDate()

            }
            if(module_query[index].enddate != null){
                end_date = module_query[index].enddate.getFullYear()+"-"+month[module_query[index].enddate.getMonth()+1]+"-"+module_query[index].enddate.getDate()
            }
            if(module_query[index].description == null){
                module_query[index].description = ""
            }
            let category_name = ""
            if(module_query[index].cat != null){
                const get_category = await Database.connection('db_reader')
                                                .select("*")
                                                .from("daa_module_category")
                                                .where("id", module_query[index].cat)
                for(let index in get_category){
                    category_name = get_category[index].name
                }
            }
            const get_daa_restrict = await Database.connection('db_reader')
                                                .select("daa_restrict.id", "daa_restrict.acttype", "daa_restrict.actid", "daa_restrict.resid", "course.fullname AS module_name")
                                                .from("daa_restrict")
                                                .innerJoin("daa_course_modules", "daa_course_modules.id", "daa_restrict.actid")
                                                .innerJoin("course", "course.id", "daa_restrict.resid")
                                                .where("daa_course_modules.module_id", module_query[index].id)
                                                .where("acttype", 3)
            let restrict_name = []
            if(get_daa_restrict != 0){
                for(let index in get_daa_restrict){
                    restrict_name.push(get_daa_restrict[index].module_name)
                }
            }
            //Get Thumbnails File
            const file = await Database.connection('db_reader')
                                    .select("files.contextid", "files.filename")
                                    .from("files")
                                    .join("context", "context.id", "files.contextid")
                                    .where("files.component", "course")
                                    .where("files.filearea", "overviewfiles")
                                    .where("context.contextlevel", 50)
                                    .where("context.instanceid", module_query[index].id)
                                    .limit(1)
            let thumbnail = ""
            if(file != 0){
                for(let index in file){
                    const url = Env.get('APP_URL')+'/uploads/file/'
                    thumbnail = url+file[index].filename
                }
            }
            //Get moodle SCORM data
            const get_sco_data = await Database.connection('db_reader')
                                            .select('scorm.id AS scorm_id', 'scorm_scoes.id AS sco_id', 'scorm.reference')
                                            .from("scorm")
                                            .join('scorm_scoes', 'scorm_scoes.scorm', '=', 'scorm.id')
                                            .where("scorm.course", module_query[index].id)
                                            .whereNot("scorm_scoes.parent", "/")
                                            .limit(1)
            let scorm_id = 0
            let sco_id = 0
            let reference = ""
            if(get_sco_data != 0){
                for(let index in get_sco_data){
                    scorm_id = get_sco_data[index].scorm_id
                    sco_id = get_sco_data[index].sco_id
                    reference = get_sco_data[index].reference
                }
            }
            //Get Completed or Incomplete
            const lesson_data = await Database.connection('db_reader')
                                            .select("daa_module_logs.id")
                                            .from("daa_module_logs")
                                            .where("daa_module_logs.user_id", user_id)
                                            .where("daa_module_logs.module_id", module_query[index].id)
                                            .where("daa_module_logs.is_completed", 1)
                                            .limit(1)
            const is_complete = 0
            if(lesson_data != 0){
                is_complete = 1
            }
            const total_attempt = 0
            //Get Completed or Incomplete
            if(scorm_id != 0){
                const attempt_data = await Database.connection('db_reader')
                                                .select("scorm_scoes_track.id AS track_id", "scorm_scoes_track.attempt", "scorm_scoes_track.value")
                                                .from("scorm_scoes_track")
                                                .where("scorm_scoes_track.userid", user_id)
                                                .where("scorm_scoes_track.scormid", scorm_id)
                                                .where("scorm_scoes_track.scoid", sco_id)
                                                .orderBy("scorm_scoes_track.attempt", "DESC")
                                                .limit(1)
                if(attempt_data != 0){
                    for(let index in attempt_data){
                        if(attempt_data[index].value == "incomplete"){
                            total_attempt = attempt_data[index].attempt-1
                        }else{
                            total_attempt = attempt_data[index].attempt
                        }
                    }
                }
            }
            const scorm_name = reference.replace(".zip", "")
			//get module competent
            const lesson_data_query = await Database.connection('db_reader')
                                                .select("daa_module_logs.id")
                                                .from("daa_module_logs")
                                                .where("daa_module_logs.user_id", user_id)
                                                .where("daa_module_logs.module_id", module_query[index].id)
                                                .where("daa_module_logs.is_competent", 1)
                                                .limit(1)
            let is_competent = 0
            if(lesson_data_query != 0 ){
                is_competent = 1
            }
			//check module is placement test
            const is_placement_test_query = await Database.connection('db_reader')
                                                .select("course.id")
                                                .from("course")
                                                .where("course.id", module_query[index].id)
                                                .where("course.is_placement_test", 1)
                                                .limit(1)
            let is_placement_test = 0
            let is_placement_test_submitted = 0
            if(is_placement_test_query != 0){
                is_placement_test = 1
                
                const is_submit_query = await Database.connection('db_reader')
                                                    .select("daa_placement_test_result.id")
                                                    .from("daa_placement_test_result")
                                                    .where("daa_placement_test_result.user_id", user_id)
                                                    .where("daa_placement_test_result.module_id", module_query[index].id)
                                                    .where("daa_placement_test_result.is_submit", 1)
                                                    .limit(1)
                if(is_submit_query != 0){
                    is_placement_test_submitted = 1
                }
            }else{
                is_placement_test_submitted = 1
            }
			//Check module is unity or not
            const check_is_unity = await Database.connection('db_reader')
                                            .select("course.id")
                                            .from("course")
                                            .where("course.id", module_query[index].id)
                                            .where("course.unity", 1)
                                            .limit(1)
            let unity = 0
            if(check_is_unity != 0){
                unity = 1
            }
            //Has Trailer
            let has_trailer = 0
            let trailer = ""
            if(module_query[index].trailer){
                const url = Env.get('APP_URL')+'/uploads/assets/images/'
                has_trailer = 1
                trailer = url+module_query[index].trailer
            }
            //Get Journey, Course
            const get_jcm = await Database.connection('db_reader')
                                        .select("dj.id as journey_id", "dj.name as journey_name", "dc.id as course_id", "dc.name as course_name")
                                        .from("daa_journeys as dj")
                                        .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                        .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                        .join("course as c", "c.id", "dcm.module_id")
                                        .where("c.id", module_query[index].id)
            let journey_id = 0
            let journey_name = ""
            let course_id = 0
            let course_name = ""
            if(get_jcm !=0 ){
                for(let index in get_jcm){
                    journey_id = get_jcm[index].journey_id
                    journey_name = get_jcm[index].journey_name
                    course_id = get_jcm[index].course_id
                    course_name = get_jcm[index].course_name
                }
            }
            //Submit Rating
            const rating = await Database.connection('db_reader')
                                    .select("id")
                                    .from("daa_rating_module")
                                    .where("module_id", module_query[index].id)
            let has_submit_rating = 0
            if(rating.length > 0){
                has_submit_rating = 1
            }
            var element = {}
            element.cid = module_query[index].cid
            element.fullname = module_query[index].fullname
            element.summary = module_query[index].summary
            element.type = module_query[index].type
            element.scorm_file = module_query[index].scorm_file
            element.attempt_limit = module_query[index].attempt_limit
            element.module_type = module_query[index].module_type
            element.cat = module_query[index].cat
            element.has_rating = module_query[index].has_rating
            element.trailer = module_query[index].trailer
            element.description = module_query[index].description
            element.tgl = module_query[index].tgl
            element.currentdate = current_date
            element.startdate = start_date
            element.enddate = end_date
            element.idnumber = module_query[index].idnumber
            element.isopen = is_open
            element.cmid = module_query[index].cmid
            element.total_attempt = 0
            element.category = category_name
            element.restrict = restrict_name
            element.thumbnail = thumbnail
            element.scorm_id = scorm_id
            element.sco_id = sco_id
            element.reference = reference
            element.is_complete = is_complete
            element.scorm_name = scorm_name
            element.is_competent = is_competent
            element.is_placement_test = is_placement_test
            element.is_placement_test_submitted = is_placement_test_submitted
            element.unity = unity
            element.has_trailer = has_trailer
            element.trailer = trailer
            element.journey_id = journey_id
            element.journey_name = journey_name
            element.course_id = course_id
            element.course_name = course_name
            element.has_submit_rating = has_submit_rating 
            
            data.push(element)
        }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Continue Learning Content Library
    continue_learning_content = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const limit = 10
        const offset = params.page*limit
        let module_id = []
        let module_not_completed = []
        let data = []
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
                                            .groupBy("c.id")
        for(let index in get_module_query){
            module_id.push(get_module_query[index].id)
        }
        let scorm_id = []
        const get_scorm_id = await Database.connection('db_reader')
                                        .select("id")
                                        .from("scorm")
                                        .whereIn("course", module_id)
        for(let index in get_scorm_id){
            scorm_id.push(get_scorm_id[index].id)
        }
        const max_attempt_query = await Database.connection('db_reader')
                                            .select("s.course")
                                            .max("sst.attempt as max_attempt")
                                            .from("scorm_scoes_track as sst")
                                            .join("scorm as s", "s.id", "sst.scormid")
                                            .join("course as c", "c.id", "s.course")
                                            .join("daa_course_modules as dcm", "dcm.module_id", "c.id")
                                            .join("daa_courses as dc", "dc.id", "dcm.course_id")
                                            .join("daa_journeys as dj", "dj.id", "dc.journey_id")
                                            .whereNotIn("scormid", scorm_id)
                                            .where("sst.userid", user_id)
                                            .where("sst.element", "cmi.core.lesson_status")
                                            .whereNotIn("sst.value", ["completed", "passed"])
                                            .where("dj.visible", 1)
                                            .where("c.visible", 1)
                                            .where("dc.visible", 1)
                                            .groupBy("sst.scormid")
            const module_query = await Database.connection('db_reader')
                                            .distinct("course.id")
                                            .select("course.id AS cid", "course.fullname", "course.summary", "course_format_options.value AS type", "course.scorm_file", "course.attempt AS attempt_limit", "course.module_type", "course.module_category as cat", "course.has_rating", "course.trailer", "course.description", "sst.timemodified as tgl", "course.startdate", "course.enddate", "course.idnumber", "cm.id as cmid")
                                            .from("daa_course_modules")
                                            .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                            .innerJoin("course_format_options", "course_format_options.courseid","course.id")
                                            .innerJoin("course_modules as cm", "cm.course", "course.id")
                                            .innerJoin("scorm as s", "s.course", "course.id")
                                            .innerJoin("scorm_scoes_track as sst", "sst.scormid", "s.id")
                                            .whereIn("course.id", module_not_completed)
                                            .where("course.visible", 1)
                                            .where("sst.userid", user_id)
                                            .groupBy("cid")
                                            .orderBy("tgl", "DESC")
                                            .limit(limit)
                                            .offset(offset)
            for(let index in module_query){
                const get_restrict_query = await Database.connection('db_reader')
                                                .count("dr.id as total")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                const total_restrict = 0
                for(let index in get_restrict_query){
                    total_restrict = get_restrict_query[index].total
                }
                const query_restrict = await Database.connection('db_reader')
                                                .select("dr.resid")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                let restrict_id = []
                for(let index in query_restrict){
                    restrict_id.push(query_restrict[index].resid)
                }
                const get_scorm_query = await Database.connection('db_reader')
                                                    .countDistinct("st.scormid as total")
                                                    .from("scorm as s")
                                                    .join("scorm_scoes_track as st", "st.scormid", "s.id")
                                                    .whereIn("s.course", restrict_id)
                                                    .where("st.userid", user_id)
                                                    .where("st.element", "cmi.core.lesson_status")
                                                    .where("st.value", "passed")
                                                    .orWhere("st.value", "completed")
                let total_scorm = 0
                for(let index in get_scorm_query){
                    total_scorm = get_scorm_query[index].total
                }
                let is_open = 0
                if(total_restrict == total_scorm){
                    is_open = 1
                }
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
                const current_date = new Date()
                let start_date = ""
                let end_date = ""
                if(module_query[index].startdate != null){
                    start_date = module_query[index].startdate.getFullYear()+"-"+month[module_query[index].startdate.getMonth()+1]+"-"+module_query[index].startdate.getDate()
    
                }
                if(module_query[index].enddate != null){
                    end_date = module_query[index].enddate.getFullYear()+"-"+month[module_query[index].enddate.getMonth()+1]+"-"+module_query[index].enddate.getDate()
                }
                if(module_query[index].description == null){
                    module_query[index].description = ""
                }
                let category_name = ""
                if(module_query[index].cat != null){
                    const get_category = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("daa_module_category")
                                                    .where("id", module_query[index].cat)
                    for(let index in get_category){
                        category_name = get_category[index].name
                    }
                }
                const get_daa_restrict = await Database.connection('db_reader')
                                                    .select("daa_restrict.id", "daa_restrict.acttype", "daa_restrict.actid", "daa_restrict.resid", "course.fullname AS module_name")
                                                    .from("daa_restrict")
                                                    .innerJoin("daa_course_modules", "daa_course_modules.id", "daa_restrict.actid")
                                                    .innerJoin("course", "course.id", "daa_restrict.resid")
                                                    .where("daa_course_modules.module_id", module_query[index].id)
                                                    .where("acttype", 3)
                let restrict_name = []
                if(get_daa_restrict != 0){
                    for(let index in get_daa_restrict){
                        restrict_name.push(get_daa_restrict[index].module_name)
                    }
                }
                //Get Thumbnails File
                const file = await Database.connection('db_reader')
                                        .select("files.contextid", "files.filename")
                                        .from("files")
                                        .join("context", "context.id", "files.contextid")
                                        .where("files.component", "course")
                                        .where("files.filearea", "overviewfiles")
                                        .where("context.contextlevel", 50)
                                        .where("context.instanceid", module_query[index].id)
                                        .limit(1)
                let thumbnail = ""
                if(file != 0){
                    for(let index in file){
                        const url = Env.get('APP_URL')+'/uploads/file/'
                        thumbnail = url+file[index].filename
                    }
                }
                //Get moodle SCORM data
                const get_sco_data = await Database.connection('db_reader')
                                                .select('scorm.id AS scorm_id', 'scorm_scoes.id AS sco_id', 'scorm.reference')
                                                .from("scorm")
                                                .join('scorm_scoes', 'scorm_scoes.scorm', '=', 'scorm.id')
                                                .where("scorm.course", module_query[index].id)
                                                .whereNot("scorm_scoes.parent", "/")
                                                .limit(1)
                let scorm_id = 0
                let sco_id = 0
                let reference = ""
                if(get_sco_data != 0){
                    for(let index in get_sco_data){
                        scorm_id = get_sco_data[index].scorm_id
                        sco_id = get_sco_data[index].sco_id
                        reference = get_sco_data[index].reference
                    }
                }
                //Get Completed or Incomplete
                const lesson_data = await Database.connection('db_reader')
                                                .select("daa_module_logs.id")
                                                .from("daa_module_logs")
                                                .where("daa_module_logs.user_id", user_id)
                                                .where("daa_module_logs.module_id", module_query[index].id)
                                                .where("daa_module_logs.is_completed", 1)
                                                .limit(1)
                const is_complete = 0
                if(lesson_data != 0){
                    is_complete = 1
                }
                const total_attempt = 0
                //Get Completed or Incomplete
                if(scorm_id != 0){
                    const attempt_data = await Database.connection('db_reader')
                                                    .select("scorm_scoes_track.id AS track_id", "scorm_scoes_track.attempt", "scorm_scoes_track.value")
                                                    .from("scorm_scoes_track")
                                                    .where("scorm_scoes_track.userid", user_id)
                                                    .where("scorm_scoes_track.scormid", scorm_id)
                                                    .where("scorm_scoes_track.scoid", sco_id)
                                                    .orderBy("scorm_scoes_track.attempt", "DESC")
                                                    .limit(1)
                    if(attempt_data != 0){
                        for(let index in attempt_data){
                            if(attempt_data[index].value == "incomplete"){
                                total_attempt = attempt_data[index].attempt-1
                            }else{
                                total_attempt = attempt_data[index].attempt
                            }
                        }
                    }
                }
                const scorm_name = reference.replace(".zip", "")
                //get module competent
                const lesson_data_query = await Database.connection('db_reader')
                                                    .select("daa_module_logs.id")
                                                    .from("daa_module_logs")
                                                    .where("daa_module_logs.user_id", user_id)
                                                    .where("daa_module_logs.module_id", module_query[index].id)
                                                    .where("daa_module_logs.is_competent", 1)
                                                    .limit(1)
                let is_competent = 0
                if(lesson_data_query != 0 ){
                    is_competent = 1
                }
                //check module is placement test
                const is_placement_test_query = await Database.connection('db_reader')
                                                    .select("course.id")
                                                    .from("course")
                                                    .where("course.id", module_query[index].id)
                                                    .where("course.is_placement_test", 1)
                                                    .limit(1)
                let is_placement_test = 0
                let is_placement_test_submitted = 0
                if(is_placement_test_query != 0){
                    is_placement_test = 1
                    
                    const is_submit_query = await Database.connection('db_reader')
                                                        .select("daa_placement_test_result.id")
                                                        .from("daa_placement_test_result")
                                                        .where("daa_placement_test_result.user_id", user_id)
                                                        .where("daa_placement_test_result.module_id", module_query[index].id)
                                                        .where("daa_placement_test_result.is_submit", 1)
                                                        .limit(1)
                    if(is_submit_query != 0){
                        is_placement_test_submitted = 1
                    }
                }else{
                    is_placement_test_submitted = 1
                }
                //Check module is unity or not
                const check_is_unity = await Database.connection('db_reader')
                                                .select("course.id")
                                                .from("course")
                                                .where("course.id", module_query[index].id)
                                                .where("course.unity", 1)
                                                .limit(1)
                let unity = 0
                if(check_is_unity != 0){
                    unity = 1
                }
                //Has Trailer
                let has_trailer = 0
                let trailer = ""
                if(module_query[index].trailer){
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    has_trailer = 1
                    trailer = url+module_query[index].trailer
                }
                //Get Journey, Course
                const get_jcm = await Database.connection('db_reader')
                                            .select("dj.id as journey_id", "dj.name as journey_name", "dc.id as course_id", "dc.name as course_name")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                            .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                            .join("course as c", "c.id", "dcm.module_id")
                                            .where("c.id", module_query[index].id)
                let journey_id = 0
                let journey_name = ""
                let course_id = 0
                let course_name = ""
                if(get_jcm !=0 ){
                    for(let index in get_jcm){
                        journey_id = get_jcm[index].journey_id
                        journey_name = get_jcm[index].journey_name
                        course_id = get_jcm[index].course_id
                        course_name = get_jcm[index].course_name
                    }
                }
                //Submit Rating
                const rating = await Database.connection('db_reader')
                                        .select("id")
                                        .from("daa_rating_module")
                                        .where("module_id", module_query[index].id)
                let has_submit_rating = 0
                if(rating.length > 0){
                    has_submit_rating = 1
                }
                var element = {}
                element.cid = module_query[index].cid
                element.fullname = module_query[index].fullname
                element.summary = module_query[index].summary
                element.type = module_query[index].type
                element.scorm_file = module_query[index].scorm_file
                element.attempt_limit = module_query[index].attempt_limit
                element.module_type = module_query[index].module_type
                element.cat = module_query[index].cat
                element.has_rating = module_query[index].has_rating
                element.trailer = module_query[index].trailer
                element.description = module_query[index].description
                element.tgl = module_query[index].tgl
                element.currentdate = current_date
                element.startdate = start_date
                element.enddate = end_date
                element.idnumber = module_query[index].idnumber
                element.isopen = is_open
                element.cmid = module_query[index].cmid
                element.total_attempt = 0
                element.category = category_name
                element.restrict = restrict_name
                element.thumbnail = thumbnail
                element.scorm_id = scorm_id
                element.sco_id = sco_id
                element.reference = reference
                element.is_complete = is_complete
                element.scorm_name = scorm_name
                element.is_competent = is_competent
                element.is_placement_test = is_placement_test
                element.is_placement_test_submitted = is_placement_test_submitted
                element.unity = unity
                element.has_trailer = has_trailer
                element.trailer = trailer
                element.journey_id = journey_id
                element.journey_name = journey_name
                element.course_id = course_id
                element.course_name = course_name
                element.has_submit_rating = has_submit_rating 
                
                data.push(element)
            }
        return response.send({status: 200, message: "Ok", data: data})
    }
    //Detail Content Library (All Enroll + Non Enroll)
    detail = async ({auth, params, response}) => {
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        const limit = 10
        const offset = params.page*limit
        let data = []
        const module_query = await Database.connection('db_reader')
                                        .distinct("course.id")
                                        .select("course.id AS cid", "course.fullname", "course.summary", "course_format_options.value AS type", "course.scorm_file", "course.attempt AS attempt_limit", "course.module_type", "course.module_category as cat", "course.has_rating", "course.trailer", "course.description", "course.startdate", "course.enddate", "course.idnumber", "cm.id as cmid")
                                        .from("daa_course_modules")
                                        .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                        .innerJoin("course_format_options", "course_format_options.courseid","course.id")
                                        .innerJoin("course_modules as cm", "cm.course", "course.id")
                                        .innerJoin("daa_content_library_module as dclm", "dclm.module_id", "course.id")
                                        .where("course.visible", 1)
                                        .where("dclm.content_library_id", params.content_id)
                                        .groupBy("cid")
                                        .orderBy("course.summary", "ASC")
                                        .limit(limit)
                                        .offset(offset)
                                                for(let index in module_query){
            const get_restrict_query = await Database.connection('db_reader')
                                            .count("dr.id as total")
                                            .from("daa_restrict as dr")
                                            .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                            .where("dcm.module_id", module_query[index].cid)
                                            .where("acttype", 3)
            const total_restrict = 0
            for(let index in get_restrict_query){
                total_restrict = get_restrict_query[index].total
            }
            const query_restrict = await Database.connection('db_reader')
                                            .select("dr.resid")
                                            .from("daa_restrict as dr")
                                            .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                            .where("dcm.module_id", module_query[index].cid)
                                            .where("acttype", 3)
            let restrict_id = []
            for(let index in query_restrict){
                restrict_id.push(query_restrict[index].resid)
            }
            const get_scorm_query = await Database.connection('db_reader')
                                                .countDistinct("st.scormid as total")
                                                .from("scorm as s")
                                                .join("scorm_scoes_track as st", "st.scormid", "s.id")
                                                .whereIn("s.course", restrict_id)
                                                .where("st.userid", user_id)
                                                .where("st.element", "cmi.core.lesson_status")
                                                .where("st.value", "passed")
                                                .orWhere("st.value", "completed")
            let total_scorm = 0
            for(let index in get_scorm_query){
                total_scorm = get_scorm_query[index].total
            }
            let is_open = 0
            if(total_restrict == total_scorm){
                is_open = 1
            }
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
            const current_date = new Date()
            let start_date = ""
            let end_date = ""
            if(module_query[index].startdate != null){
                start_date = module_query[index].startdate.getFullYear()+"-"+month[module_query[index].startdate.getMonth()+1]+"-"+module_query[index].startdate.getDate()

            }
            if(module_query[index].enddate != null){
                end_date = module_query[index].enddate.getFullYear()+"-"+month[module_query[index].enddate.getMonth()+1]+"-"+module_query[index].enddate.getDate()
            }
            if(module_query[index].description == null){
                module_query[index].description = ""
            }
            let category_name = ""
            if(module_query[index].cat != null){
                const get_category = await Database.connection('db_reader')
                                                .select("*")
                                                .from("daa_module_category")
                                                .where("id", module_query[index].cat)
                for(let index in get_category){
                    category_name = get_category[index].name
                }
            }
            const get_daa_restrict = await Database.connection('db_reader')
                                                .select("daa_restrict.id", "daa_restrict.acttype", "daa_restrict.actid", "daa_restrict.resid", "course.fullname AS module_name")
                                                .from("daa_restrict")
                                                .innerJoin("daa_course_modules", "daa_course_modules.id", "daa_restrict.actid")
                                                .innerJoin("course", "course.id", "daa_restrict.resid")
                                                .where("daa_course_modules.module_id", module_query[index].id)
                                                .where("acttype", 3)
            let restrict_name = []
            if(get_daa_restrict != 0){
                for(let index in get_daa_restrict){
                    restrict_name.push(get_daa_restrict[index].module_name)
                }
            }
            //Get Thumbnails File
            const file = await Database.connection('db_reader')
                                    .select("files.contextid", "files.filename")
                                    .from("files")
                                    .join("context", "context.id", "files.contextid")
                                    .where("files.component", "course")
                                    .where("files.filearea", "overviewfiles")
                                    .where("context.contextlevel", 50)
                                    .where("context.instanceid", module_query[index].id)
                                    .limit(1)
            let thumbnail = ""
            if(file != 0){
                for(let index in file){
                    const url = Env.get('APP_URL')+'/uploads/file/'
                    thumbnail = url+file[index].filename
                }
            }
            //Get moodle SCORM data
            const get_sco_data = await Database.connection('db_reader')
                                            .select('scorm.id AS scorm_id', 'scorm_scoes.id AS sco_id', 'scorm.reference')
                                            .from("scorm")
                                            .join('scorm_scoes', 'scorm_scoes.scorm', '=', 'scorm.id')
                                            .where("scorm.course", module_query[index].id)
                                            .whereNot("scorm_scoes.parent", "/")
                                            .limit(1)
            let scorm_id = 0
            let sco_id = 0
            let reference = ""
            if(get_sco_data != 0){
                for(let index in get_sco_data){
                    scorm_id = get_sco_data[index].scorm_id
                    sco_id = get_sco_data[index].sco_id
                    reference = get_sco_data[index].reference
                }
            }
            //Get Completed or Incomplete
            const lesson_data = await Database.connection('db_reader')
                                            .select("daa_module_logs.id")
                                            .from("daa_module_logs")
                                            .where("daa_module_logs.user_id", user_id)
                                            .where("daa_module_logs.module_id", module_query[index].id)
                                            .where("daa_module_logs.is_completed", 1)
                                            .limit(1)
            const is_complete = 0
            if(lesson_data != 0){
                is_complete = 1
            }
            const total_attempt = 0
            //Get Completed or Incomplete
            if(scorm_id != 0){
                const attempt_data = await Database.connection('db_reader')
                                                .select("scorm_scoes_track.id AS track_id", "scorm_scoes_track.attempt", "scorm_scoes_track.value")
                                                .from("scorm_scoes_track")
                                                .where("scorm_scoes_track.userid", user_id)
                                                .where("scorm_scoes_track.scormid", scorm_id)
                                                .where("scorm_scoes_track.scoid", sco_id)
                                                .orderBy("scorm_scoes_track.attempt", "DESC")
                                                .limit(1)
                if(attempt_data != 0){
                    for(let index in attempt_data){
                        if(attempt_data[index].value == "incomplete"){
                            total_attempt = attempt_data[index].attempt-1
                        }else{
                            total_attempt = attempt_data[index].attempt
                        }
                    }
                }
            }
            const scorm_name = reference.replace(".zip", "")
			//get module competent
            const lesson_data_query = await Database.connection('db_reader')
                                                .select("daa_module_logs.id")
                                                .from("daa_module_logs")
                                                .where("daa_module_logs.user_id", user_id)
                                                .where("daa_module_logs.module_id", module_query[index].id)
                                                .where("daa_module_logs.is_competent", 1)
                                                .limit(1)
            let is_competent = 0
            if(lesson_data_query != 0 ){
                is_competent = 1
            }
			//check module is placement test
            const is_placement_test_query = await Database.connection('db_reader')
                                                .select("course.id")
                                                .from("course")
                                                .where("course.id", module_query[index].id)
                                                .where("course.is_placement_test", 1)
                                                .limit(1)
            let is_placement_test = 0
            let is_placement_test_submitted = 0
            if(is_placement_test_query != 0){
                is_placement_test = 1
                
                const is_submit_query = await Database.connection('db_reader')
                                                    .select("daa_placement_test_result.id")
                                                    .from("daa_placement_test_result")
                                                    .where("daa_placement_test_result.user_id", user_id)
                                                    .where("daa_placement_test_result.module_id", module_query[index].id)
                                                    .where("daa_placement_test_result.is_submit", 1)
                                                    .limit(1)
                if(is_submit_query != 0){
                    is_placement_test_submitted = 1
                }
            }else{
                is_placement_test_submitted = 1
            }
			//Check module is unity or not
            const check_is_unity = await Database.connection('db_reader')
                                            .select("course.id")
                                            .from("course")
                                            .where("course.id", module_query[index].id)
                                            .where("course.unity", 1)
                                            .limit(1)
            let unity = 0
            if(check_is_unity != 0){
                unity = 1
            }
            //Has Trailer
            let has_trailer = 0
            let trailer = ""
            if(module_query[index].trailer){
                const url = Env.get('APP_URL')+'/uploads/assets/images/'
                has_trailer = 1
                trailer = url+module_query[index].trailer
            }
            //Get Journey, Course
            const get_jcm = await Database.connection('db_reader')
                                        .select("dj.id as journey_id", "dj.name as journey_name", "dc.id as course_id", "dc.name as course_name")
                                        .from("daa_journeys as dj")
                                        .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                        .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                        .join("course as c", "c.id", "dcm.module_id")
                                        .where("c.id", module_query[index].id)
            let journey_id = 0
            let journey_name = ""
            let course_id = 0
            let course_name = ""
            if(get_jcm !=0 ){
                for(let index in get_jcm){
                    journey_id = get_jcm[index].journey_id
                    journey_name = get_jcm[index].journey_name
                    course_id = get_jcm[index].course_id
                    course_name = get_jcm[index].course_name
                }
            }
            //Submit Rating
            const rating = await Database.connection('db_reader')
                                    .select("id")
                                    .from("daa_rating_module")
                                    .where("module_id", module_query[index].id)
            let has_submit_rating = 0
            if(rating.length > 0){
                has_submit_rating = 1
            }
            var element = {}
            element.cid = module_query[index].cid
            element.fullname = module_query[index].fullname
            element.summary = module_query[index].summary
            element.type = module_query[index].type
            element.scorm_file = module_query[index].scorm_file
            element.attempt_limit = module_query[index].attempt_limit
            element.module_type = module_query[index].module_type
            element.cat = module_query[index].cat
            element.has_rating = module_query[index].has_rating
            element.trailer = module_query[index].trailer
            element.description = module_query[index].description
            element.currentdate = current_date
            element.startdate = start_date
            element.enddate = end_date
            element.idnumber = module_query[index].idnumber
            element.isopen = is_open
            element.cmid = module_query[index].cmid
            element.total_attempt = 0
            element.category = category_name
            element.restrict = restrict_name
            element.thumbnail = thumbnail
            element.scorm_id = scorm_id
            element.sco_id = sco_id
            element.reference = reference
            element.is_complete = is_complete
            element.scorm_name = scorm_name
            element.is_competent = is_competent
            element.is_placement_test = is_placement_test
            element.is_placement_test_submitted = is_placement_test_submitted
            element.unity = unity
            element.has_trailer = has_trailer
            element.trailer = trailer
            element.journey_id = journey_id
            element.journey_name = journey_name
            element.course_id = course_id
            element.course_name = course_name
            element.has_submit_rating = has_submit_rating 
            
            data.push(element)
        }
        return response.send({status: 200, message: "Ok", data: data})
        
    }
    //Search Content Library
    search_content_library = async ({auth, request, response}) => {
        
        const authUser = auth.user.toJSON()
        const user_id = authUser.id
        let message = ""
        let status = 0
        let data = []
        const { keyword, page } = request.all()
        const rules = {
            keyword: 'required'
        }
      
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "validator_fails", data: validation.messages()})            
        }else{
            let limit = 10
            let offset = 0
            if(page){
                offset = page*limit
            }
            //get module id
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
            let module_id = []
            if(get_module_query != 0){
                for(let index in get_module_query){
                    module_id.push(get_module_query[index].id)
                }
            }
            //all
            const module_query = await Database.connection('db_reader')
                                        .distinct("course.id")
                                        .select("course.id AS cid", "course.fullname", "course.summary", "course_format_options.value AS type", "course.scorm_file", "course.attempt AS attempt_limit", "course.module_type", "course.module_category as cat", "course.has_rating", "course.trailer", "course.description", "course.startdate", "course.enddate", "course.idnumber", "cm.id as cmid")
                                        .from("daa_course_modules")
                                        .innerJoin("course", "course.id", "daa_course_modules.module_id")
                                        .innerJoin("course_format_options", "course_format_options.courseid","course.id")
                                        .innerJoin("course_modules as cm", "cm.course", "course.id")
                                        .innerJoin("daa_courses as dc", "dc.id", "daa_course_modules.course_id")
                                        .innerJoin("daa_journeys as dj", "dj.id", "dc.journey_id")
                                        .where("course.fullname", "LIKE", "%"+keyword+"%")
                                        .where("course.visible", 1)
                                        .whereIn("course.id", module_id)
                                        .where("dj.visible", 1)
                                        .where("dc.visible", 1)
                                        .groupBy("course.id")
                                        .orderBy("course.summary", "ASC")
                                        .limit(limit)
                                        .offset(offset)
            for(let index in module_query){
                const get_restrict_query = await Database.connection('db_reader')
                                                .count("dr.id as total")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                let total_restrict = 0
                for(let index in get_restrict_query){
                    total_restrict = get_restrict_query[index].total
                }
                const query_restrict = await Database.connection('db_reader')
                                                .select("dr.resid")
                                                .from("daa_restrict as dr")
                                                .join("daa_course_modules as dcm", "dcm.id", "dr.actid")
                                                .where("dcm.module_id", module_query[index].cid)
                                                .where("acttype", 3)
                let restrict_id = []
                for(let index in query_restrict){
                    restrict_id.push(query_restrict[index].resid)
                }
                const get_scorm_query = await Database.connection('db_reader')
                                                    .countDistinct("st.scormid as total")
                                                    .from("scorm as s")
                                                    .join("scorm_scoes_track as st", "st.scormid", "s.id")
                                                    .whereIn("s.course", restrict_id)
                                                    .where("st.userid", user_id)
                                                    .where("st.element", "cmi.core.lesson_status")
                                                    .where("st.value", "passed")
                                                    .orWhere("st.value", "completed")
                let total_scorm = 0
                for(let index in get_scorm_query){
                    total_scorm = get_scorm_query[index].total
                }
                let is_open = 0
                if(total_restrict == total_scorm){
                    is_open = 1
                }
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
                const current_date = new Date()
                let start_date = ""
                let end_date = ""
                if(module_query[index].startdate != null){
                    start_date = module_query[index].startdate.getFullYear()+"-"+month[module_query[index].startdate.getMonth()+1]+"-"+module_query[index].startdate.getDate()

                }
                if(module_query[index].enddate != null){
                    end_date = module_query[index].enddate.getFullYear()+"-"+month[module_query[index].enddate.getMonth()+1]+"-"+module_query[index].enddate.getDate()
                }
                if(module_query[index].description == null){
                    module_query[index].description = ""
                }
                let category_name = ""
                if(module_query[index].cat != null){
                    const get_category = await Database.connection('db_reader')
                                                    .select("*")
                                                    .from("daa_module_category")
                                                    .where("id", module_query[index].cat)
                    for(let index in get_category){
                        category_name = get_category[index].name
                    }
                }
                const get_daa_restrict = await Database.connection('db_reader')
                                                    .select("daa_restrict.id", "daa_restrict.acttype", "daa_restrict.actid", "daa_restrict.resid", "course.fullname AS module_name")
                                                    .from("daa_restrict")
                                                    .innerJoin("daa_course_modules", "daa_course_modules.id", "daa_restrict.actid")
                                                    .innerJoin("course", "course.id", "daa_restrict.resid")
                                                    .where("daa_course_modules.module_id", module_query[index].id)
                                                    .where("acttype", 3)
                let restrict_name = []
                if(get_daa_restrict != 0){
                    for(let index in get_daa_restrict){
                        restrict_name.push(get_daa_restrict[index].module_name)
                    }
                }
                //Get Thumbnails File
                const file = await Database.connection('db_reader')
                                        .select("files.contextid", "files.filename")
                                        .from("files")
                                        .join("context", "context.id", "files.contextid")
                                        .where("files.component", "course")
                                        .where("files.filearea", "overviewfiles")
                                        .where("context.contextlevel", 50)
                                        .where("context.instanceid", module_query[index].id)
                                        .limit(1)
                let thumbnail = ""
                if(file != 0){
                    for(let index in file){
                        const url = Env.get('APP_URL')+'/uploads/file/'
                        thumbnail = url+file[index].filename
                    }
                }
                //Get moodle SCORM data
                const get_sco_data = await Database.connection('db_reader')
                                                .select('scorm.id AS scorm_id', 'scorm_scoes.id AS sco_id', 'scorm.reference')
                                                .from("scorm")
                                                .join('scorm_scoes', 'scorm_scoes.scorm', '=', 'scorm.id')
                                                .where("scorm.course", module_query[index].id)
                                                .whereNot("scorm_scoes.parent", "/")
                                                .limit(1)
                let scorm_id = 0
                let sco_id = 0
                let reference = ""
                if(get_sco_data != 0){
                    for(let index in get_sco_data){
                        scorm_id = get_sco_data[index].scorm_id
                        sco_id = get_sco_data[index].sco_id
                        reference = get_sco_data[index].reference
                    }
                }
                //Get Completed or Incomplete
                const lesson_data = await Database.connection('db_reader')
                                                .select("daa_module_logs.id")
                                                .from("daa_module_logs")
                                                .where("daa_module_logs.user_id", user_id)
                                                .where("daa_module_logs.module_id", module_query[index].id)
                                                .where("daa_module_logs.is_completed", 1)
                                                .limit(1)
                const is_complete = 0
                if(lesson_data != 0){
                    is_complete = 1
                }
                const total_attempt = 0
                //Get Completed or Incomplete
                if(scorm_id != 0){
                    const attempt_data = await Database.connection('db_reader')
                                                    .select("scorm_scoes_track.id AS track_id", "scorm_scoes_track.attempt", "scorm_scoes_track.value")
                                                    .from("scorm_scoes_track")
                                                    .where("scorm_scoes_track.userid", user_id)
                                                    .where("scorm_scoes_track.scormid", scorm_id)
                                                    .where("scorm_scoes_track.scoid", sco_id)
                                                    .orderBy("scorm_scoes_track.attempt", "DESC")
                                                    .limit(1)
                    if(attempt_data != 0){
                        for(let index in attempt_data){
                            if(attempt_data[index].value == "incomplete"){
                                total_attempt = attempt_data[index].attempt-1
                            }else{
                                total_attempt = attempt_data[index].attempt
                            }
                        }
                    }
                }
                const scorm_name = reference.replace(".zip", "")
                //get module competent
                const lesson_data_query = await Database.connection('db_reader')
                                                    .select("daa_module_logs.id")
                                                    .from("daa_module_logs")
                                                    .where("daa_module_logs.user_id", user_id)
                                                    .where("daa_module_logs.module_id", module_query[index].id)
                                                    .where("daa_module_logs.is_competent", 1)
                                                    .limit(1)
                let is_competent = 0
                if(lesson_data_query != 0 ){
                    is_competent = 1
                }
                //check module is placement test
                const is_placement_test_query = await Database.connection('db_reader')
                                                    .select("course.id")
                                                    .from("course")
                                                    .where("course.id", module_query[index].id)
                                                    .where("course.is_placement_test", 1)
                                                    .limit(1)
                let is_placement_test = 0
                let is_placement_test_submitted = 0
                if(is_placement_test_query != 0){
                    is_placement_test = 1
                    
                    const is_submit_query = await Database.connection('db_reader')
                                                        .select("daa_placement_test_result.id")
                                                        .from("daa_placement_test_result")
                                                        .where("daa_placement_test_result.user_id", user_id)
                                                        .where("daa_placement_test_result.module_id", module_query[index].id)
                                                        .where("daa_placement_test_result.is_submit", 1)
                                                        .limit(1)
                    if(is_submit_query != 0){
                        is_placement_test_submitted = 1
                    }
                }else{
                    is_placement_test_submitted = 1
                }
                //Check module is unity or not
                const check_is_unity = await Database.connection('db_reader')
                                                .select("course.id")
                                                .from("course")
                                                .where("course.id", module_query[index].id)
                                                .where("course.unity", 1)
                                                .limit(1)
                let unity = 0
                if(check_is_unity != 0){
                    unity = 1
                }
                //Has Trailer
                let has_trailer = 0
                let trailer = ""
                if(module_query[index].trailer){
                    const url = Env.get('APP_URL')+'/uploads/assets/images/'
                    has_trailer = 1
                    trailer = url+module_query[index].trailer
                }
                //Get Journey, Course
                const get_jcm = await Database.connection('db_reader')
                                            .select("dj.id as journey_id", "dj.name as journey_name", "dc.id as course_id", "dc.name as course_name")
                                            .from("daa_journeys as dj")
                                            .join("daa_courses as dc", "dc.journey_id", "dj.id")
                                            .join("daa_course_modules as dcm", "dcm.course_id", "dc.id")
                                            .join("course as c", "c.id", "dcm.module_id")
                                            .where("c.id", module_query[index].id)
                let journey_id = 0
                let journey_name = ""
                let course_id = 0
                let course_name = ""
                if(get_jcm !=0 ){
                    for(let index in get_jcm){
                        journey_id = get_jcm[index].journey_id
                        journey_name = get_jcm[index].journey_name
                        course_id = get_jcm[index].course_id
                        course_name = get_jcm[index].course_name
                    }
                }
                //Submit Rating
                const rating = await Database.connection('db_reader')
                                        .select("id")
                                        .from("daa_rating_module")
                                        .where("module_id", module_query[index].id)
                let has_submit_rating = 0
                if(rating.length > 0){
                    has_submit_rating = 1
                }
                var element = {}
                element.cid = module_query[index].cid
                element.fullname = module_query[index].fullname
                element.summary = module_query[index].summary
                element.type = module_query[index].type
                element.scorm_file = module_query[index].scorm_file
                element.attempt_limit = module_query[index].attempt_limit
                element.module_type = module_query[index].module_type
                element.cat = module_query[index].cat
                element.has_rating = module_query[index].has_rating
                element.trailer = module_query[index].trailer
                element.description = module_query[index].description
                element.currentdate = current_date
                element.startdate = start_date
                element.enddate = end_date
                element.idnumber = module_query[index].idnumber
                element.isopen = is_open
                element.cmid = module_query[index].cmid
                element.total_attempt = 0
                element.category = category_name
                element.restrict = restrict_name
                element.thumbnail = thumbnail
                element.scorm_id = scorm_id
                element.sco_id = sco_id
                element.reference = reference
                element.is_complete = is_complete
                element.scorm_name = scorm_name
                element.is_competent = is_competent
                element.is_placement_test = is_placement_test
                element.is_placement_test_submitted = is_placement_test_submitted
                element.unity = unity
                element.has_trailer = has_trailer
                element.trailer = trailer
                element.journey_id = journey_id
                element.journey_name = journey_name
                element.course_id = course_id
                element.course_name = course_name
                element.has_submit_rating = has_submit_rating 
                
                data.push(element)
            }
            return response.send({status: 200, message: "Ok", data: data})
        }
    }
}

module.exports = LearningHistoryController
