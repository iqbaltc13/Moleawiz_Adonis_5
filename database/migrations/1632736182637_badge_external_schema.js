'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgeExternalSchema extends Schema {


  async up () {
    const exists = await this.hasTable('badge_external')
    if (!exists){
      this.create('badge_external', (table) => {
        table.bigIncrements()
        table.bigInteger('backpackid',10).notNullable().defaultTo(0)
        table.bigInteger('collectionid',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('badge_external')
  }
}

module.exports = BadgeExternalSchema
