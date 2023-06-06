'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RoleNamesSchema extends Schema {
  async up () {
    const exists = await this.hasTable('role_names')
    if (!exists){
      this.create('role_names', (table) => {
        table.bigIncrements()
        table.bigInteger('contextid',10).notNullable().defaultTo(0)
        table.bigInteger('roleid',10).notNullable().defaultTo(0)
        table.string('name',255).notNullable().defaultTo('')

        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('role_names')
  }
}

module.exports = RoleNamesSchema
