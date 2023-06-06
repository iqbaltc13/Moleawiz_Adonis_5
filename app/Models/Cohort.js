'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Cohort extends Model {
  static table = 'cohort';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  members(){
    return this.hasMany('App/Models/CohortMember','id','cohortid').whereNull('deleted_at').whereHas('user')
  }

  cohort_enrols(){
    return this.hasMany('App/Models/DaaJourneyCohortEnrol','id','cohort_id').whereNull('deleted_at')
  }
}

module.exports = Cohort
