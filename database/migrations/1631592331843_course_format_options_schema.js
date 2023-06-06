'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseFormatOptionsSchema extends Schema {


  async up () {
    const exists = await this.hasTable('course_format_options')
    if (!exists){
      this.create('course_format_options', (table) => {
        table.bigIncrements()
        table.bigInteger('courseid',10).notNullable().defaultTo(0)
        table.string('format',100).notNullable().defaultTo('')
        table.bigInteger('sectionid',10).notNullable().defaultTo(0)
        table.string('name',100).notNullable().defaultTo('')
        table.text('value', 'longtext').defaultTo('')
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('course_format_options')
  }
}

module.exports = CourseFormatOptionsSchema
