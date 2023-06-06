'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaBadgeSettingSchema extends Schema {
   async up () {
    const exists = await this.hasTable('daa_badge_setting')
    if (!exists){
      this.create('daa_badge_setting', (table) => {
        table.bigIncrements()
        table.bigInteger('daa_badge_id', 10).nullable()
        table.string('setting_name', 255).nullable()
        table.text('setting_value', 'longtext').nullable()
        table.text('note', 'longtext').nullable()
        table.integer('status',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_badge_setting')
  }
}

module.exports = DaaBadgeSettingSchema
