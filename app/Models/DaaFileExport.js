'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaFileExport extends Model {

  static table = 'daa_file_exports';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }

  user(){
    return this.belongsTo('App/Models/User','userid','id')
  }
}

module.exports = DaaFileExport
