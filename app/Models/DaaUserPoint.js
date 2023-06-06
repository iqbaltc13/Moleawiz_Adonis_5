'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaUserPoint extends Model {
  static table = 'daa_user_point';
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
}

module.exports = DaaUserPoint
