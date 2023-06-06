'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Role extends Model {
  static table = 'role';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  assigns(){
    return this.hasMany('App/Models/RoleAllowAssign','id','roleid').whereNull('deleted_at').whereHas('assignRole')
  }
  overrides(){
    return this.hasMany('App/Models/RoleAllowOverride','id','roleid').whereNull('deleted_at').whereHas('overrideRole')
  }
  switches(){
    return this.hasMany('App/Models/RoleAllowSwitch','id','roleid').whereNull('deleted_at').whereHas('switchRole')
  }
  assignments(){
    return this.hasMany('App/Models/RoleAssignment','id','roleid').whereNull('deleted_at').whereHas('user')
  }


}

module.exports = Role
