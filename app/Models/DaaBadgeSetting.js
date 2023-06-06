'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaBadgeSetting extends Model {
  static table = 'daa_badge_setting';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }

  badge(){
    return this.belongsTo('App/Models/DaaBadge','daa_badge_id','id')

  }
 
}

module.exports = DaaBadgeSetting
