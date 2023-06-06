'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CohortMembersSchema extends Schema {

  async up () {
    const exists = await this.hasTable('cohort_members')
    if (!exists){
      this.create('cohort_members', (table) => {
        table.bigIncrements()
        table.bigInteger('cohortid',10).notNullable().defaultTo(0)
        table.bigInteger('userid',10).notNullable().defaultTo(0)
        table.bigInteger('timeadded',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('cohort_members')
  }
}

module.exports = CohortMembersSchema
