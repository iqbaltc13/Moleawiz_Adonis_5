'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CohortMember extends Model {
  static table = 'cohort_members';
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
  cohort(){
    return this.belongsTo('App/Models/Cohort','cohortid','id')

  }
  user(){
    return this.belongsTo('App/Models/User','userid','id').whereNull('deleted_at').where('deleted',0)

  }
  djce(){
    return this.manyThrough('App/Models/Cohort', 'cohort_enrols')
  }

}

module.exports = CohortMember
