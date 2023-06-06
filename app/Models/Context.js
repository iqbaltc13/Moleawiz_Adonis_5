'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Context extends Model {
    static table = 'context';
    static boot = () => {
      super.boot()
      this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

      /**
       * A hook to hash the user password before saving
       * it to the database.
       */

    }

    files(){
      return this.hasMany('App/Models/File','id','contextid').whereNull('deleted_at')
    }
}

module.exports = Context
