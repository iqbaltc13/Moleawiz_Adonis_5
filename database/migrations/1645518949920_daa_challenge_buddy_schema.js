'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaChallengeBuddySchema extends Schema {

  async up () {
    const exists = await this.hasTable('daa_challenge_buddy')
    if (!exists){
      this.create('daa_challenge_buddy', (table) => {
        table.bigIncrements()
        table.bigInteger('learnerid', 10).nullable()
        table.bigInteger('buddyid',10).nullable()
        table.bigInteger('numreview',10).nullable()
        table.bigInteger('lastupdate',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_challenge_buddies')
  }
}

module.exports = DaaChallengeBuddySchema
