'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseSectionsSchema extends Schema {

  async up () {
    const exists = await this.hasTable('course_sections')
    if (!exists){
      this.create('course_sections', (table) => {
        table.bigIncrements()
        table.bigInteger('course',10).notNullable().defaultTo(0)
        table.bigInteger('section',10).notNullable().defaultTo('')
        table.string('name',255).notNullable().defaultTo('')
        table.text('summary', 'longtext').defaultTo('')
        table.integer('summaryformat',10).notNullable().defaultTo(0)
        table.text('sequence', 'longtext').defaultTo('')
        table.integer('visible',10).notNullable().defaultTo(0)
        table.text('availability', 'longtext').defaultTo('')
        table.bigInteger('timemodified',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }


  down () {
    this.drop('course_sections')
  }
}

module.exports = CourseSectionsSchema
