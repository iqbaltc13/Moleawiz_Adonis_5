'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class RoleAssignment extends Model {
  static table = 'role_assignments';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  parent_role(){
    return this.belongsTo('App/Models/Role','roleid','id')
  }
  user(){
    return this.belongsTo('App/Models/User','userid','id')
  }
}

module.exports = RoleAssignment
