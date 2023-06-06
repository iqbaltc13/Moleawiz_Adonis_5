'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaModuleCategory extends Model {

  static table = 'daa_module_category';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  module(){
    return this.hasMany('App/Models/Course','id','module_category').whereNull('deleted_at').orderBy('sortorder','asc')
  }
}

module.exports = DaaModuleCategory
