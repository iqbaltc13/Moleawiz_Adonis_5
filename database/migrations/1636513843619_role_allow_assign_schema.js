'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RoleAllowAssignSchema extends Schema {
  async up () {
    const exists = await this.hasTable('role_allow_assign')
    if (!exists){
      this.create('role_allow_assign', (table) => {
        table.bigIncrements()

        table.bigInteger('roleid',10).notNullable().defaultTo(0)
        table.bigInteger('allowassign',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('role_allow_assign')
  }
}

module.exports = RoleAllowAssignSchema
