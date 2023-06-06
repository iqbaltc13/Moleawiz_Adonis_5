'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaCourseLogsSchema extends Schema {


  async up () {
    const exists = await this.hasTable('daa_course_logs')
    if (!exists){
      this.create('daa_course_logs', (table) => {
        table.bigIncrements()
        table.bigInteger('user_id',10).notNullable().defaultTo(0)
        table.bigInteger('course_id',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }


  down () {
    this.drop('daa_course_logs')
  }
}

module.exports = DaaCourseLogsSchema
