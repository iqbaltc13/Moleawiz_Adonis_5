'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaNotificationsSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_notifications')
    if (!exists){
      this.create('daa_notifications', (table) => {
        table.bigIncrements()
        table.bigInteger('user_id',10).nullable()
        table.bigInteger('from_id',10).nullable()
        table.bigInteger('context_id',10).nullable()
        table.text('params', 'longtext').defaultTo('')
        table.string('type', 255).notNullable().defaultTo('')
        table.string('subject').nullable()
        table.text('message', 'text').defaultTo('')
        table.integer('status',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }


  down () {
    this.drop('daa_notifications')
  }
}

module.exports = DaaNotificationsSchema
