'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaReminderSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_reminder')
    if (!exists){
      this.create('daa_reminder', (table) => {
        table.bigIncrements()
        table.bigInteger('journey_id', 10).nullable()
        table.bigInteger('course_id',10).nullable()
        table.bigInteger('module_id',10).nullable()
        table.string('name', 255).notNullable().defaultTo('')
        table.integer('reminder_type',10).nullable()
        table.integer('start_date').nullable()
        table.integer('expired_date').nullable()
        table.datetime('general_date').nullable()
        table.integer('visible',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_reminder')
  }
}

module.exports = DaaReminderSchema
