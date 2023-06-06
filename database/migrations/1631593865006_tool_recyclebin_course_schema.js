'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ToolRecyclebinCourseSchema extends Schema {

  async up () {
    const exists = await this.hasTable('tool_recyclebin_course')
    if (!exists){
      this.create('tool_recyclebin_course', (table) => {
        table.bigIncrements()
        table.bigInteger('courseid',10).notNullable().defaultTo(0)
        table.bigInteger('section',10).notNullable().defaultTo(0)
        table.bigInteger('module',10).notNullable().defaultTo(0)
        table.bigInteger('timecreated',10).notNullable().defaultTo(0)
        table.string('name',255).notNullable().defaultTo('')
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('tool_recyclebin_course')
  }
}

module.exports = ToolRecyclebinCourseSchema
