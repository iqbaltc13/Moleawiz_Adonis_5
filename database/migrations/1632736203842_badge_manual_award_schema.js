'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgeManualAwardSchema extends Schema {



  async up () {
    const exists = await this.hasTable('badge_manual_award')
    if (!exists){
      this.create('badge_manual_award', (table) => {
        table.bigIncrements()


        table.bigInteger('badgeid',10).notNullable().defaultTo(0)
        table.bigInteger('recipientid',10).notNullable().defaultTo(0)
        table.bigInteger('issuerid',10).notNullable().defaultTo(0)
        table.bigInteger('issuerrole',10).notNullable().defaultTo(0)
        table.bigInteger('datemet',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('badge_manual_award')
  }
}

module.exports = BadgeManualAwardSchema
