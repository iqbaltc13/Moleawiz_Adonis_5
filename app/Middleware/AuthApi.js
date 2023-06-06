'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Database = use('Database')

class AuthApi {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth, response }, next) {
    // const user = auth.current.user
    const token = auth.getAuthHeader()
    const check_user_token = await Database.connection('db_reader').from('daa_user_tokens').where("token", token)
    console.log(check_user_token)
    if(check_user_token !=0){
        await next()
    }else{
        return response.send({status: 401, message: "Invalid Token or Missing Token"})
    }
    // try {
    //   return await auth.check()
    // } catch (error) {
    //   return response.send({status: 401, message: "Invalid Token or Missing Token"})
    // }
    // call next to advance the request
  }
}

module.exports = AuthApi
