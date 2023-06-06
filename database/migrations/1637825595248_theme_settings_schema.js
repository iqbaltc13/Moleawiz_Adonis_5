'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ThemeSettingsSchema extends Schema {
  async up () {
    const exists = await this.hasTable('theme_settings')
    if (!exists){
      this.create('theme_settings', (table) => {
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
    this.drop('theme_settings')
  }
}

module.exports = ThemeSettingsSchema
