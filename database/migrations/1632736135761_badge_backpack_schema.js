'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgeBackpackSchema extends Schema {

  async up () {
    const exists = await this.hasTable('badge_backpack')
    if (!exists){
      this.create('badge_backpack', (table) => {
        table.bigIncrements()


        table.bigInteger('userid',10).notNullable().defaultTo(0)
        table.string('email',100).notNullable().defaultTo('')
        table.string('backpackurl',255).notNullable().defaultTo('')
        table.bigInteger('backpackuid',10).notNullable().defaultTo(0)
        table.integer('autosync',10).notNullable().defaultTo(0)
        table.string('password',50).notNullable().defaultTo('')
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('badge_backpack')
  }
}

module.exports = BadgeBackpackSchema
