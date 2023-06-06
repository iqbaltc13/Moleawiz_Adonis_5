'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaJourneySchema extends Schema {

  async up () {
    const exists = await this.hasTable('daa_journeys')
    if (!exists){
      this.create('daa_journeys', (table) => {
        table.bigIncrements()
        table.string('name',255).notNullable().defaultTo('')
        table.text('description', 'text').defaultTo('')
        table.string('thumbnail',100).notNullable().defaultTo('')
        table.integer('sort',10).notNullable().defaultTo(0)
        table.integer('visible',10).notNullable().defaultTo(0)
        table.integer('is_leaderboard',10).notNullable().defaultTo(0)
        table.integer('is_reward',10).notNullable().defaultTo(0)
        table.integer('is_simulator',10).notNullable().defaultTo(0)
        table.datetime('end_date').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_journeys')
  }
}

module.exports = DaaJourneySchema
