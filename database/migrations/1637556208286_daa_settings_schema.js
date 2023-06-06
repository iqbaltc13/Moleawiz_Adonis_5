'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaSettingsSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_settings')
    if (!exists){
      this.create('daa_settings', (table) => {
        table.bigIncrements()
        table.string('setting_name',300).notNullable().defaultTo('')
        table.text('setting_value', 'text').defaultTo('')
        table.integer('setting_status',10).nullable()
        table.bigInteger('created_by',10).nullable()
        table.bigInteger('update_by',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_settings')
  }
}

module.exports = DaaSettingsSchema
