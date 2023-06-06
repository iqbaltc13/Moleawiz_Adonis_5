'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SessionsSchema extends Schema {

  async up () {
    const exists = await this.hasTable('sessions')
    if (!exists){
      this.create('sessions', (table) => {
        table.bigIncrements()

        table.bigInteger('state',10).notNullable().defaultTo(0)
        table.string('sid',128).notNullable().defaultTo('')
        table.bigInteger('userid',10).notNullable().defaultTo(0)
        table.text('sessdata', 'longtext').defaultTo('')
        table.bigInteger('timecreated',10).notNullable().defaultTo(0)
        table.bigInteger('timemodified',10).notNullable().defaultTo(0)
        table.string('firstip',128).notNullable().defaultTo('')
        table.string('lastip',128).notNullable().defaultTo('')
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('sessions')
  }
}

module.exports = SessionsSchema
