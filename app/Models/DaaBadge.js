'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaBadge extends Model {

  static table = 'daa_badges';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
  }

  journey(){
    return this.belongsTo('App/Models/DaaJourney','daa_journey_id','id')
  }
  course(){
    return this.belongsTo('App/Models/DaaCourse','daa_course_id','id')
  }
  module(){
    return this.belongsTo('App/Models/Course','module_id','id')
  }
  settings(){
    return this.hasMany('App/Models/DaaBadgeSetting','id','daa_badge_id').whereNull('deleted_at')
  }
  recipients(){
    return this.hasMany('App/Models/DaaBadgeUser','id','daa_badge_id').whereNull('deleted_at')
  }
}

module.exports = DaaBadge
