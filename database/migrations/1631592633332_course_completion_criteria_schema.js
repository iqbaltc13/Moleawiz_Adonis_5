'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseCompletionCriteriaSchema extends Schema {


  async up () {
    const exists = await this.hasTable('course_completion_criteria')
    if (!exists){
      this.create('course_completion_criteria', (table) => {
        table.bigIncrements()
        table.bigInteger('course',10).notNullable().defaultTo(0)
        table.bigInteger('criteriatype',10).notNullable().defaultTo(0)
        table.string('module',100).notNullable().defaultTo('')
        table.bigInteger('moduleinstance',10).notNullable().defaultTo(0)
        table.bigInteger('courseinstance',10).notNullable().defaultTo(0)
        table.bigInteger('enrolperiod',10).notNullable().defaultTo(0)
        table.bigInteger('timeend',10).notNullable().defaultTo(0)
        table.decimal('gradepass', 10, 5).notNullable().defaultTo(0)
        table.bigInteger('role',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('course_completion_criteria')
  }
}

module.exports = CourseCompletionCriteriaSchema
