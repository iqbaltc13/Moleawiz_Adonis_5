'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class RoleAllowAssign extends Model {
  static table = 'role_allow_assign';
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
  assignRole(){
    return this.belongsTo('App/Models/Role','allowassign','id')
  }
}

module.exports = RoleAllowAssign
