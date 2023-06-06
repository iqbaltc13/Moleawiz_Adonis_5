'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CourseFormatOption extends Model {
  static table = 'course_format_options';
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
    return this.belongsTo('App/Models/Course','courseid','id')

  }
}

module.exports = CourseFormatOption
