'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaCourse extends Model {
  static table = 'daa_courses';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  course_modules(){
    //return this.hasMany('App/Models/DaaCourseModule', 'id', 'course_id').whereNull('deleted_at')
    return this.hasMany('App/Models/DaaCourseModule','id','course_id')
  }

  journey(){
    return this.belongsTo('App/Models/DaaJourney','journey_id','id')

  }
  previous_restrict= () => {
    return this.hasMany('App/Models/DaaRestrict','id','actid').where('acttype',2).whereNull('deleted_at')
  }
  next_restrict= () => {
    return this.hasMany('App/Models/DaaRestrict','id','resid').where('acttype',2).whereNull('deleted_at')
  }
}

module.exports = DaaCourse
