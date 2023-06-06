'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaModuleLogsSchema extends Schema {


  async up () {
    const exists = await this.hasTable('daa_module_logs')
    if (!exists){
      this.create('daa_module_logs', (table) => {
        table.bigIncrements()

        table.bigInteger('user_id',10).notNullable().defaultTo(0)
        table.bigInteger('module_id',10).notNullable().defaultTo(0)
        table.bigInteger('score',10).notNullable().defaultTo(0)
        table.integer('is_migration',10).notNullable().defaultTo(0)
        table.integer('is_completed',10).notNullable().defaultTo(0)
        table.integer('is_competent',10).notNullable().defaultTo(0)
        table.datetime('last_open').nullable()
        table.datetime('updated_at').nullable()//big integer
        table.datetime('created_at').nullable()//big integer
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_module_logs')
  }
}

module.exports = DaaModuleLogsSchema
