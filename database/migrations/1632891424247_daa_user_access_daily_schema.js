'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaUserAccessDailySchema extends Schema {


  async up () {
    const exists = await this.hasTable('daa_user_access_daily')
    if (!exists){
      this.create('daa_user_access_daily', (table) => {
        table.bigIncrements()
        table.date('access_date').nullable()
        table.integer('h0',10).notNullable().defaultTo(0)
        table.integer('h1',10).notNullable().defaultTo(0)
        table.integer('h2',10).notNullable().defaultTo(0)
        table.integer('h3',10).notNullable().defaultTo(0)
        table.integer('h4',10).notNullable().defaultTo(0)
        table.integer('h5',10).notNullable().defaultTo(0)
        table.integer('h6',10).notNullable().defaultTo(0)
        table.integer('h7',10).notNullable().defaultTo(0)
        table.integer('h8',10).notNullable().defaultTo(0)
        table.integer('h9',10).notNullable().defaultTo(0)
        table.integer('h10',10).notNullable().defaultTo(0)
        table.integer('h11',10).notNullable().defaultTo(0)
        table.integer('h12',10).notNullable().defaultTo(0)
        table.integer('h13',10).notNullable().defaultTo(0)
        table.integer('h14',10).notNullable().defaultTo(0)
        table.integer('h15',10).notNullable().defaultTo(0)
        table.integer('h16',10).notNullable().defaultTo(0)
        table.integer('h17',10).notNullable().defaultTo(0)
        table.integer('h18',10).notNullable().defaultTo(0)
        table.integer('h19',10).notNullable().defaultTo(0)
        table.integer('h20',10).notNullable().defaultTo(0)
        table.integer('h21',10).notNullable().defaultTo(0)
        table.integer('h22',10).notNullable().defaultTo(0)
        table.integer('h23',10).notNullable().defaultTo(0)
        table.integer('h24',10).notNullable().defaultTo(0)
        table.integer('total_user',10).notNullable().defaultTo(0)
        table.datetime('started_at').nullable()
        table.datetime('ended_at').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }


  down () {
    this.drop('daa_user_access_daily')
  }
}

module.exports = DaaUserAccessDailySchema
