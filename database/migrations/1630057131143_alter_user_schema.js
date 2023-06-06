'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterUserSchema extends Schema {
  up () {
    this.alter('user', (table) => {
      table.datetime('updated_at').nullable()
      table.datetime('created_at').nullable()
      table.datetime('deleted_at').nullable()
    })
  }

  down () {
    this.table('user', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AlterUserSchema
