'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaRatingModule extends Model {
  static table = 'daa_rating_module';
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
    return this.belongsTo('App/Models/User','user_id','id')
  }
  module(){
    return this.belongsTo('App/Models/Course','module_id','id')
  }
}

module.exports = DaaRatingModule
