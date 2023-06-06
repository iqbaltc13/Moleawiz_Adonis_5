'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaJourneyCohortEnrol extends Model {
  static table = 'daa_journey_cohort_enrols';
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
    return this.belongsTo('App/Models/DaaJourney','journey_id','id')

  }
  cohort(){
    return this.belongsTo('App/Models/Cohort','cohort_id','id')

  }
  cohort_member(){
    return this.belongsTo('App/Models/CohortMember','cohort_id','cohortid')
  }
}

module.exports = DaaJourneyCohortEnrol
