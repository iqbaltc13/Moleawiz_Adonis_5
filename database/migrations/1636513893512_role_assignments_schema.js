'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RoleAssignmentsSchema extends Schema {
  async up () {
    const exists = await this.hasTable('role_assignments')
    if (!exists){
      this.create('role_assignments', (table) => {
        table.bigIncrements()

        table.bigInteger('roleid',10).notNullable().defaultTo(0)
        table.bigInteger('contextid',10).notNullable().defaultTo(0)
        table.bigInteger('userid',10).notNullable().defaultTo(0)
        table.bigInteger('timemodified',10).notNullable().defaultTo(0)
        table.bigInteger('modifierid',10).notNullable().defaultTo(0)
        table.string('component',100).notNullable().defaultTo('')
        table.bigInteger('itemid',10).notNullable().defaultTo(0)
        table.bigInteger('sortorder',10).notNullable().defaultTo(0)
        table.integer('deleted',10).notNullable().defaultTo(0)
        table.integer('deleted_by',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('role_assignments')
  }
}

module.exports = RoleAssignmentsSchema
