'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseBridgeLearningEffortSchema extends Schema {

  async up () {
    const exists = await this.hasTable('course_bridge_learning_efforts')
    if (!exists){
      this.create('course_bridge_learning_efforts', (table) => {
        table.bigIncrements()
        table.bigInteger('module_id',10).notNullable().defaultTo(0)
        table.decimal('learning_effort', 4, 2).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('course_bridge_learning_efforts')
  }
}

module.exports = CourseBridgeLearningEffortSchema
