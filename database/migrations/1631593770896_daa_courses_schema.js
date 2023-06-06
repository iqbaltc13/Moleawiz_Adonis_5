'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaCoursesSchema extends Schema {

  async up () {
    const exists = await this.hasTable('daa_courses')
    if (!exists){
      this.create('daa_courses', (table) => {
        table.bigIncrements()
        table.bigInteger('journey_id',10).notNullable().defaultTo(0)
        table.string('name',255).notNullable().defaultTo('')
        table.text('description', 'longtext').defaultTo('')
        table.string('thumbnail',255).notNullable().defaultTo('')
        table.integer('sort',10).notNullable().defaultTo(0)
        table.integer('visible',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_courses')
  }
}

module.exports = DaaCoursesSchema
