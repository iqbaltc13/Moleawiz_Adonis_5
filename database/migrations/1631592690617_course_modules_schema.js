'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseModulesSchema extends Schema {


  async up () {
    const exists = await this.hasTable('course_modules')
    if (!exists){
      this.create('course_modules', (table) => {
        table.bigIncrements()
        table.bigInteger('course',10).notNullable().defaultTo(0)
        table.bigInteger('module',100).notNullable().defaultTo(0)
        table.bigInteger('instance',10).notNullable().defaultTo(0)
        table.bigInteger('section',10).notNullable().defaultTo(0)
        table.string('idnumber',100).notNullable().defaultTo('')
        table.bigInteger('added',10).notNullable().defaultTo(0)
        table.integer('score',10).notNullable().defaultTo(0)
        table.integer('indent',10).notNullable().defaultTo(0)
        table.integer('visible',10).notNullable().defaultTo(0)
        table.integer('visibleoncoursepage',10).notNullable().defaultTo(0)
        table.integer('visibleold',10).notNullable().defaultTo(0)
        table.integer('groupmode',10).notNullable().defaultTo(0)
        table.bigInteger('groupingid',10).notNullable().defaultTo(0)
        table.integer('completion',10).notNullable().defaultTo(0)
        table.bigInteger('completiongradeitemnumber',10).notNullable().defaultTo(0)
        table.integer('completionview',10).notNullable().defaultTo(0)
        table.bigInteger('completionexpected',10).notNullable().defaultTo(0)
        table.integer('showdescription',10).notNullable().defaultTo(0)
        table.text('availability', 'longtext').defaultTo('')
        table.integer('deletioninprogress',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('course_modules')
  }
}

module.exports = CourseModulesSchema
