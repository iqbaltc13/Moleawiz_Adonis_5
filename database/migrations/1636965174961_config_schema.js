'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConfigSchema extends Schema {
  async up () {
    const exists = await this.hasTable('config')
    if (!exists){
      this.create('config', (table) => {
        table.bigIncrements()
        table.string('name',255).notNullable().defaultTo('')

        table.text('value', 'longtext').defaultTo('')

        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('config')
  }
}

module.exports = ConfigSchema
