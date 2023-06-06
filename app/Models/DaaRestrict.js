'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaRestrict extends Model {
  static table = 'daa_restrict';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }

  previous_program(){
    return this.belongsTo('App/Models/DaaJourney','resid','id').whereNull('deleted_at')
  }
  next_program(){
    return this.belongsTo('App/Models/DaaJourney','actid','id').whereNull('deleted_at')
  }
  previous_course(){
    return this.belongsTo('App/Models/DaaCourse','resid','id').whereNull('deleted_at')
  }
  next_course(){
    return this.belongsTo('App/Models/DaaCourse','actid','id').whereNull('deleted_at')
  }
  previous_module(){
    return this.belongsTo('App/Models/Course','resid','id').whereNull('deleted_at')
  }
  next_module(){
    return this.belongsTo('App/Models/Course','actid','id').whereNull('deleted_at')
  }
}

module.exports = DaaRestrict
