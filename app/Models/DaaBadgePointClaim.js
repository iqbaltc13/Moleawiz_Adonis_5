'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaBadgePointClaim extends Model {

  static table = 'daa_badge_point_claim';
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
  badge(){
    return this.belongsTo('App/Models/DaaBadge','badge_id','id')

  }
}

module.exports = DaaBadgePointClaim
