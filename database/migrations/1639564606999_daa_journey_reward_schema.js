'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaJourneyRewardSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_journey_reward')
    if (!exists){
      this.create('daa_journey_reward', (table) => {
        table.bigIncrements()    
        table.bigInteger('journey_id', 10).nullable()
        table.bigInteger('reward_id',10).nullable()
        table.decimal('point', 11, 0).nullable()
        table.datetime('expired_date').nullable()
        table.bigInteger('qty',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_journey_reward')
  }
}

module.exports = DaaJourneyRewardSchema
