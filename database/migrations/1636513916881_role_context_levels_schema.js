'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RoleContextLevelsSchema extends Schema {
  async up () {
    const exists = await this.hasTable('role_context_levels')
    if (!exists){
      this.create('role_context_levels', (table) => {
        table.bigIncrements()
        table.bigInteger('contextlevel',10).notNullable().defaultTo(0)
        table.bigInteger('roleid',10).notNullable().defaultTo(0)

        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('role_context_levels')
  }
}

module.exports = RoleContextLevelsSchema
