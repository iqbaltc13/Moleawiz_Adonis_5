'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaRatingModuleSchema extends Schema {

  async up () {
    const exists = await this.hasTable('daa_rating_module')
    if (!exists){
      this.create('daa_rating_module', (table) => {
        table.bigIncrements()
        table.bigInteger('user_id',10).notNullable().defaultTo(0)
        table.bigInteger('module_id',10).notNullable().defaultTo(0)
        table.integer('rating_point',10).nullable().defaultTo(0)
        table.text('feedback', 'longtext').defaultTo('')
        table.integer('send_notif',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_rating_module')
  }
}

module.exports = DaaRatingModuleSchema
