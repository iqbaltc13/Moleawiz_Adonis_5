'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaCourseModule extends Model {
  static table = 'daa_course_modules';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  course(){
    return this.belongsTo('App/Models/DaaCourse','course_id','id')
  }

  module(){
    //return this.belongsTo('App/Models/Course', 'module_id', 'id').whereNull('deleted_at')
    return this.belongsTo('App/Models/Course','module_id','id')
  }

  badge= () => {
    return this.belongsTo('App/Models/DaaBadge','module_id','module_id')
  }
}

module.exports = DaaCourseModule
