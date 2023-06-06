'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class RoleAllowSwitch extends Model {
  static table = 'role_allow_switch';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  parentRole(){
    return this.belongsTo('App/Models/Role','roleid','id')
  }
  switchRole(){
    return this.belongsTo('App/Models/Role','allowswitch','id')
  }
}

module.exports = RoleAllowSwitch
