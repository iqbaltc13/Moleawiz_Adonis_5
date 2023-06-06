'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaContentLibraryModule extends Model {

  static table = 'daa_content_library_module';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')
    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  content_library(){
    return this.belongsTo('App/Models/DaaContentLibrary','content_library_id','id')

  }

  module(){
    return this.belongsTo('App/Models/Course','module_id','id')

  }
}

module.exports = DaaContentLibraryModule
