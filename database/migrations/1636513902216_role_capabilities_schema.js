'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RoleCapabilitiesSchema extends Schema {
  async up () {
    const exists = await this.hasTable('role_capabilities')
    if (!exists){
      this.create('role_capabilities', (table) => {
        table.bigIncrements()
        table.bigInteger('contextid',10).notNullable().defaultTo(0)
        table.bigInteger('roleid',10).notNullable().defaultTo(0)
        table.string('capability',100).notNullable().defaultTo('')
        table.bigInteger('permission',10).notNullable().defaultTo(0)
        table.bigInteger('timemodified',10).notNullable().defaultTo(0)
        table.bigInteger('modifierid',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('role_capabilities')
  }
}

module.exports = RoleCapabilitiesSchema
