'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaUserPointSchema extends Schema {


  async up () {
    const exists = await this.hasTable('daa_user_point')
    if (!exists){
      this.create('daa_user_point', (table) => {
        table.bigIncrements()

        table.bigInteger('user_id',10).notNullable().defaultTo(0)
        table.bigInteger('module_id',10).notNullable().defaultTo(0)
        table.decimal('point', 11, 0).notNullable().defaultTo(0)
        table.integer('point_attempt',10).notNullable().defaultTo(0)
        table.integer('send_notif',10).notNullable().defaultTo(0)
        table.integer('deleted',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_user_point')
  }
}

module.exports = DaaUserPointSchema
