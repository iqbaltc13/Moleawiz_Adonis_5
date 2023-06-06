'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const config = use('Config')

class DaaJourney extends Model {

  static table = 'daa_journeys';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }

  static get connection() {
    return this.useConnection !== "undefined" ? this.useConnection : config.get('database.connection')
  }

  static setUseConnection(access) {
    return access
  }
  journey_reward(){
     return this.hasMany('App/Models/DaaJourneyReward','id','journey_id').whereNull('deleted_at')
  }

  course(){
    //return this.hasMany('App/Models/DaaCourse','id','journey_id').whereNull('deleted_at')
    return this.hasMany('App/Models/DaaCourse','id','journey_id')
  }
  cohort_enrols(){
    return this.hasMany('App/Models/DaaJourneyCohortEnrol','id','journey_id').whereNull('deleted_at')
  }
  previous_restrict(){
    return this.hasMany('App/Models/DaaRestrict','id','actid').where('acttype',1).whereNull('deleted_at')
  }
  next_restrict(){
    return this.hasMany('App/Models/DaaRestrict','id','resid').where('acttype',1).whereNull('deleted_at')
  }
}

module.exports = DaaJourney
