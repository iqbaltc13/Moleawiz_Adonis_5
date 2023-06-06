'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaReminderSettingSchema extends Schema {
 async up () {
    const exists = await this.hasTable('daa_reminder_setting')
    if (!exists){
      this.create('daa_reminder_setting', (table) => {
        table.bigIncrements()
        table.bigInteger('reminder_id', 10).nullable()
        table.integer('notif_date').nullable()
        table.integer('send_spv ', 10).nullable()
        table.integer('send_nha', 10).nullable()
        table.integer('notif_type',10).nullable()
        table.integer('visible',10).nullable()
        table.integer('is_completed',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }
  down () {
    this.drop('daa_reminder_setting')
  }
}

module.exports = DaaReminderSettingSchema
