'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaRewardSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_reward')
    if (!exists){
      this.create('daa_reward', (table) => {
        table.bigIncrements()
        table.string('title',255).notNullable().defaultTo('')
        table.text('description', 'text').defaultTo('')
        table.string('image',255).notNullable().defaultTo('')
        table.integer('visible',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_reward')
  }
}

module.exports = DaaRewardSchema
