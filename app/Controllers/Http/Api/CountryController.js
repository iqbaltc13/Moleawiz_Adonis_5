'use strict'

const Database = use('Database')
const Env = use('Env')
const Country = use('App/Models/Country')

class CountryController {
    //Get All Country
    index = async ({auth, params, response}) => {
        const data = await Country.all()
        return response.send({status: 200, message: "OK", data: data})
    }
}

module.exports = CountryController
