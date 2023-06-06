'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Chat extends Model {
  static table = 'daa_chats';
  static boot () {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    
    }
    detail () {
    return this.hasOne('App/Models/ChatDetail')
    }

}

module.exports = Chat
