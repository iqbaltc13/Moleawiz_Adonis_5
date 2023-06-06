'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseCompletionAggrMethdSchema extends Schema {


  async up () {
    const exists = await this.hasTable('course_completion_aggr_methd')
    if (!exists){
      this.create('course_completion_aggr_methd', (table) => {
        table.bigIncrements()
        table.bigInteger('course',10).notNullable().defaultTo(0)
        table.bigInteger('criteriatype',10).notNullable().defaultTo(0)
        table.integer('method',1).notNullable().defaultTo(1)
        table.decimal('value', 10, 5).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }


  down () {
    this.drop('course_completion_aggr_methd')
  }
}

module.exports = CourseCompletionAggrMethdSchema
