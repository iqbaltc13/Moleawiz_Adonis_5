'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaJourneyCohortEnrolsSchema extends Schema {

  async up () {
    const exists = await this.hasTable('daa_journey_cohort_enrols')
    if (!exists){
      this.create('daa_journey_cohort_enrols', (table) => {
        table.bigIncrements()
        table.bigInteger('journey_id',10).notNullable().defaultTo(0)
        table.bigInteger('cohort_id',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_journey_cohort_enrols')
  }
}

module.exports = DaaJourneyCohortEnrolsSchema
