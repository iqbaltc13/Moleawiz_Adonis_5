'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CohortSchema extends Schema {
 async up () {
    const exists = await this.hasTable('cohort')
    if (!exists){
      this.create('cohort', (table) => {
        table.bigIncrements()
        table.bigInteger('contextid',10).notNullable().defaultTo(1)
        table.string('name',254).notNullable().defaultTo('')
        table.string('idnumber',100).notNullable().defaultTo('')
        table.text('description', 'longtext').defaultTo('')
        table.integer('descriptionformat',2).notNullable().defaultTo(0)
        table.integer('visible',1).notNullable().defaultTo(1)
        table.string('component',100).notNullable().defaultTo('')
        table.bigInteger('timecreated',10).notNullable().defaultTo(1)
        table.bigInteger('timemodified',10).notNullable().defaultTo(1)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('cohort')
  }
}

module.exports = CohortSchema
