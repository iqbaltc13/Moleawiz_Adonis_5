'use strict'
/** @type {import('@adonisjs/framework/src/Hash')} */
//
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Config = use('App/Models/Config')
const Hash = use('Hash')

class UserToken extends Model {
  static table = 'daa_user_tokens';
  static get createdAtColumn(){
    return ''
  }
  static get updatedAtColumn(){
    return ''
  }
  static boot = () => {
    super.boot()
//     this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

//     /**
//      * A hook to hash the user password before saving
//      * it to the database.
//      */

  }
  user(){
    return this.belongsTo('App/Models/User','user_id','id');
  }
}

module.exports = UserToken
