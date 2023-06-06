'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaReminderSetting extends Model {
  static table = 'daa_reminder_setting';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
  }

  reminder(){
    return this.belongsTo('App/Models/DaaReminder','reminder_id','id')
  }
  reminder_logs(){
    return this.hasMany('App/Models/DaaReminderLog','id','reminder_setting_id').whereNull('deleted_at')
  }

}

module.exports = DaaReminderSetting
