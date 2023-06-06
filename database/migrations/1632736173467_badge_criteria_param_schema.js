'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgeCriteriaParamSchema extends Schema {


  async up () {
    const exists = await this.hasTable('badge_criteria_param')
    if (!exists){
      this.create('badge_criteria_param', (table) => {
        table.bigIncrements()


        table.bigInteger('critid',10).notNullable().defaultTo(0)
        table.string('name',255).notNullable().defaultTo('')
        table.string('value',255).notNullable().defaultTo('')
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('badge_criteria_param')
  }
}

module.exports = BadgeCriteriaParamSchema
