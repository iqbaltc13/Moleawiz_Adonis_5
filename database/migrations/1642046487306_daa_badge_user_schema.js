'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaBadgeUserSchema extends Schema {
 async up () {
    const exists = await this.hasTable('daa_badge_users')
    if (!exists){
      this.create('daa_badge_users', (table) => {
        table.bigIncrements()
        table.bigInteger('daa_badge_id', 10).nullable()
        table.bigInteger('userid',10).nullable()
        table.integer('send_notif',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_badge_users')
  }
}

module.exports = DaaBadgeUserSchema
