'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CourseCategory extends Model {

  static table = 'course_categories';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  parentCategory(){
    return this.belongsTo('App/Models/CourseCategory','parent','id')
  }
  courses(){
    return this.hasMany('App/Models/Course','id','category').whereNull('deleted_at')
  }
  childCategory(){
    return this.hasMany('App/Models/CourseCategory','id','parent').whereNull('deleted_at')
  }
}

module.exports = CourseCategory
