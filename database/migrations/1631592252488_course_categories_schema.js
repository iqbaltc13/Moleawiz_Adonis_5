'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseCategoriesSchema extends Schema {


  async up () {
    const exists = await this.hasTable('course_categories')
    if (!exists){
      this.create('course_categories', (table) => {
        table.bigIncrements()
        table.string('name',254).notNullable().defaultTo('')
        table.string('idnumber',100).notNullable().defaultTo('')
        table.text('description', 'longtext').defaultTo('')
        table.integer('descriptionformat',2).notNullable().defaultTo(0)
        table.bigInteger('parent',1).notNullable().defaultTo(1)
        table.bigInteger('sortorder',1).notNullable().defaultTo(1)
        table.bigInteger('coursecount',1).notNullable().defaultTo(1)
        table.integer('visible',1).notNullable().defaultTo(1)
        table.integer('visibleold',1).notNullable().defaultTo(1)
        table.bigInteger('timemodified',1).notNullable().defaultTo(1)
        table.bigInteger('depth',1).notNullable().defaultTo(1)
        table.string('path',254).notNullable().defaultTo('')
        table.string('theme',100).notNullable().defaultTo('')
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('course_categories')
  }
}

module.exports = CourseCategoriesSchema
