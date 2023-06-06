'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TestResultBadgeSchema extends Schema {



  async up () {
    const exists = await this.hasTable('test_result_badge')
    if (!exists){
      this.create('test_result_badge', (table) => {
        table.bigIncrements()
        table.integer('badge_id',10).notNullable().defaultTo(0)
        table.integer('badge_type',10).notNullable().defaultTo(0)
        table.integer('setting_id',10).notNullable().defaultTo(0)
        table.string('setting_name',150).notNullable().defaultTo('')
        table.string('setting_value',150).notNullable().defaultTo('')
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('test_result_badge')
  }
}

module.exports = TestResultBadgeSchema
