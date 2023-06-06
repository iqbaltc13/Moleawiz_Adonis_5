'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgeCriteriaSchema extends Schema {

  async up () {
    const exists = await this.hasTable('badge_criteria')
    if (!exists){
      this.create('badge_criteria', (table) => {
        table.bigIncrements()
        table.bigInteger('badgeid',10).notNullable().defaultTo(0)
        table.bigInteger('criteriatype',10).notNullable().defaultTo(0)
        table.integer('method',10).notNullable().defaultTo(0)
        table.text('description', 'longtext').defaultTo('')
        table.integer('descriptionformat',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('badge_criteria')
  }
}

module.exports = BadgeCriteriaSchema
