'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RoleSortorderSchema extends Schema {
  async up () {
    const exists = await this.hasTable('role_sortorder')
    if (!exists){
      this.create('role_sortorder', (table) => {
        table.bigIncrements()
        table.bigInteger('userid',10).notNullable().defaultTo(0)
        table.bigInteger('contextid',10).notNullable().defaultTo(0)
        table.bigInteger('roleid',10).notNullable().defaultTo(0)
        table.bigInteger('sortoder',10).notNullable().defaultTo(0)

        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('role_sortorder')
  }
}

module.exports = RoleSortorderSchema
