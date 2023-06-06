'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ChatDeatil extends Model {
  static table = 'daa_chat_details';
  static boot () {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    
    }
    // deatil () {
    // return this.hasMany('App/Models/Cohort','cohortid','id')

    // }

}

module.exports = ChatDeatil
