'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaRewardHistorySchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_reward_history')
    if (!exists){
      this.create('daa_reward_history', (table) => {
        table.bigIncrements()
        table.bigInteger('journey_id',10).nullable()
        table.bigInteger('reward_id',10).nullable()
        table.bigInteger('user_id',10).nullable()
        table.decimal('point', 11, 0).notNullable().defaultTo(0)
        table.string('redeem_code', 255).notNullable().defaultTo('')
        table.datetime('redeem_date').nullable()
        table.integer('redeem_status',10).nullable()
        table.datetime('redeem_status_date').nullable()
        table.integer('redeem_updated_by',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_reward_history')
  }
}

module.exports = DaaRewardHistorySchema
