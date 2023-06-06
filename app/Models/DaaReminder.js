'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaReminder extends Model {

  static table = 'daa_reminder';
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
  course(){
    return this.belongsTo('App/Models/DaaCourse','course_id','id')
  }
  module(){
    return this.belongsTo('App/Models/Course','module_id','id')
  }
  reminder_settings(){
    return this.hasMany('App/Models/DaaReminderSetting','id','reminder_id').whereNull('deleted_at')
  }
}

module.exports = DaaReminder
