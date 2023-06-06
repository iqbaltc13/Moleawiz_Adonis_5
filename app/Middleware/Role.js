'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Config      = use('App/Models/Config')

class Role {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ auth,request }, next,props) {
    // call next to advance the request
    // console.log(request, props)
    if(props.includes('admin')){

      let data       =  await Config.query().where('name','siteadmins').first();
      let arrIdAdmin =  data.value.split(',');

      //console.log(auth.user.id);
      //console.log(arrIdAdmin.includes(auth.user.id.toString()));

      if(arrIdAdmin.includes(auth.user.id.toString())){
        await next()
      }
    }


  }
}

module.exports = Role
