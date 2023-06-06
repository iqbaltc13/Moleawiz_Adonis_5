'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgeCriteriaMetSchema extends Schema {

  async up () {
    const exists = await this.hasTable('badge_criteria_met')
    if (!exists){
      this.create('badge_criteria_met', (table) => {
        table.bigIncrements()
        table.bigInteger('issuedid',10).notNullable().defaultTo(0)
        table.bigInteger('critid',10).notNullable().defaultTo(0)
        table.bigInteger('userid',10).notNullable().defaultTo(0)
        table.bigInteger('datemet',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('badge_criteria_met')
  }
}

module.exports = BadgeCriteriaMetSchema
