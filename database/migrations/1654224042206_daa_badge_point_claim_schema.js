'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaBadgePointClaimSchema extends Schema {
  

  async up () {
    const exists = await this.hasTable('daa_badge_point_claim')
    if (!exists){
      this.create('daa_badge_point_claim', (table) => {
        table.bigIncrements()
        table.bigInteger('user_id').nullable()
        table.bigInteger('badge_id').nullable()
        table.bigInteger('point').nullable()
        table.datetime('claim_date').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_badge_point_claim')
  }
}

module.exports = DaaBadgePointClaimSchema
