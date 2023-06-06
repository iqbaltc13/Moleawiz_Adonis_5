'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserInfoDatum extends Model {
  static table = 'user_info_data';
  static boot = () => {
    super.boot()
     this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')
    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  user(){
    return this.belongsTo('App/Models/User','userid','id')
  }
  field(){
     return this.belongsTo('App/Models/UserInfoDatum','fieldid','id')
  }

}

module.exports = UserInfoDatum
