'use strict'

const Database = use('Database')
const { validate } = use('Validator')

class VersionController {
    //Get Version App
    index = async ({auth, request, response}) => {
        const { os } = request.all()
        const rules = {
            os: 'required'
        }
      
        const validation = await validate(request.all(), rules)
        if (validation.fails()) {
            return response.send({status: 400, message: "Validation Fails!", data: validation.messages()})            
        }else{
            const data = await Database.connection('db_reader')
                                    .select("*")
                                    .from("daa_app_version")
                                    .where("type", os)
                                    .limit(1)
            return response.send({status: 200, message: "Ok", data: data})
        }
    }
}

module.exports = VersionController
