'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseModulesCompletionSchema extends Schema {

  async up () {
    const exists = await this.hasTable('course_modules_completion')
    if (!exists){
      this.create('course_modules_completion', (table) => {
        table.bigIncrements()
        table.bigInteger('coursemoduleid',10).notNullable().defaultTo(0)
        table.bigInteger('userid',100).notNullable().defaultTo(0)

        table.integer('completionstate',10).notNullable().defaultTo(0)
        table.integer('viewed',10).notNullable().defaultTo(0)
        table.bigInteger('overrideby',10).notNullable().defaultTo(0)
        table.bigInteger('timemodified',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('course_modules_completion')
  }
}

module.exports = CourseModulesCompletionSchema
