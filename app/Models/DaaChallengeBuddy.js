'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaChallengeBuddy extends Model {
  static table = 'daa_challenge_buddy';
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
    return this.belongsTo('App/Models/User','learnerid','id')

  }
  buddy(){
    return this.belongsTo('App/Models/User','buddyid','id')

  }
}

module.exports = DaaChallengeBuddy
