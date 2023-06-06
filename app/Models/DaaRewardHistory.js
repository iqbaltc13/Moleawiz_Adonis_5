'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaRewardHistory extends Model {
  static table = 'daa_reward_history';
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
  reward(){
    return this.belongsTo('App/Models/DaaReward','reward_id','id')
  }
  user(){
    return this.belongsTo('App/Models/User','user_id','id')
  }

}


module.exports = DaaRewardHistory
