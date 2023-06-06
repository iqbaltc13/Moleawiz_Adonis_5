'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaContentLibrary extends Model {
  static table = 'daa_content_library';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  content_library_module(){
    return this.hasMany('App/Models/DaaContentLibraryModule','id','content_library_id').whereNull('deleted_at')
  }
}

module.exports = DaaContentLibrary
