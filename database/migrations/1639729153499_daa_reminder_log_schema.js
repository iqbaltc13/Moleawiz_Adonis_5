'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaReminderLogSchema extends Schema {
   async up () {
    const exists = await this.hasTable('daa_reminder_log')
    if (!exists){
      this.create('daa_reminder_log', (table) => {
        table.bigIncrements()
        table.bigInteger('reminder_setting_id', 10).nullable()
        table.bigInteger('user_id',10).nullable()
        table.bigInteger('spv_id', 10).nullable()
        table.bigInteger('nha_id', 10).nullable()
        table.integer('send_notif', 10).nullable()
        table.integer('show_popup', 10).nullable()
        table.integer('day_before_expired', 10).nullable()
        table.integer('send_notif_spv', 10).nullable()
        table.integer('send_notif_nha', 10).nullable()
        table.integer('is_expired',10).nullable()
        table.datetime('expired_date').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_reminder_log')
  }
}

module.exports = DaaReminderLogSchema
