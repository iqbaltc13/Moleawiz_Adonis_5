'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RolesSchema extends Schema {
  async up () {
    const exists = await this.hasTable('role')
    if (!exists){
      this.create('role', (table) => {
        table.bigIncrements()
        table.string('name',255).notNullable().defaultTo('')
        table.string('shortname',100).notNullable().defaultTo('')
        table.text('description', 'longtext').defaultTo('')
        table.bigInteger('sortorder',10).notNullable().defaultTo(0)
        table.string('archetype',30).notNullable().defaultTo('')
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('role')
  }
}

module.exports = RolesSchema
