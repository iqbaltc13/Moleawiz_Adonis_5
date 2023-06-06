'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaReward extends Model {
  static table = 'daa_reward';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  reward_history(){
    return this.hasMany('App/Models/DaaRewardHistory','id','reward_id').whereNull('deleted_at')
  }
  reward_journey(){
    return this.hasMany('App/Models/DaaJourneyReward','id','reward_id').whereNull('deleted_at')
  }
}

module.exports = DaaReward
