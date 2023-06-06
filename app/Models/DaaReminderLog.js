'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaReminderLog extends Model {
  static table = 'daa_reminder_log';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
  }

  reminder_setting(){
    return this.belongsTo('App/Models/DaaReminderSetting','reminder_setting_id','id')
  }
  user(){
    return this.belongsTo('App/Models/User','user_id','id')
  }
  spv(){
    return this.belongsTo('App/Models/User','spv_id','id')

  }
  nha(){
    return this.belongsTo('App/Models/User','nha_id','id')

  }
}

module.exports = DaaReminderLog
