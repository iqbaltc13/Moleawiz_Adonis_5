'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Course extends Model {
    static table = 'course';
    static boot = () => {
      super.boot()
      this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

      /**
       * A hook to hash the user password before saving
       * it to the database.
       */

    }

    kategory(){
        return this.belongsTo('App/Models/CourseCategory','category','id')

    }
    format_option(){
      return this.hasOne('App/Models/CourseFormatOption','id','courseid').whereNull('deleted_at')
    }


    module_logs (){
      return this.hasMany('App/Models/DaaModuleLog','id','module_id').whereNull('deleted_at')
    }
    content_library_module (){
      return this.hasMany('App/Models/DaaContentLibraryModule','module_id' ,'id').whereNull('deleted_at')
    }

    course_module (){

      return this.hasOne('App/Models/DaaCourseModule','id','module_id').whereNull('deleted_at')

    }
    category_module (){

      return this.belongsTo('App/Models/DaaModuleCategory', 'module_category', 'id')

    }

    previous_restrict= () => {
      return this.hasMany('App/Models/DaaRestrict','id','actid').where('acttype',3).whereNull('deleted_at')
    }
    next_restrict= () => {
      return this.hasMany('App/Models/DaaRestrict','id','resid').where('acttype',3).whereNull('deleted_at')
    }
    content_library_module= () => {
      return this.hasMany('App/Models/DaaContentLibraryModule','module_id','id').whereNull('deleted_at')
    }
    scorms= () => {
      return this.hasMany('App/Models/Scorm','id','course').whereNull('deleted_at')
    }
    context = () => {
      return this.hasOne('App/Models/Context','id','instanceid').where('contextlevel','50')
    }


}

module.exports = Course
