'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgeIssuedSchema extends Schema {

  async up () {
    const exists = await this.hasTable('badge_issued')
    if (!exists){
      this.create('badge_issued', (table) => {
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

  badge_issued

  down () {
    this.drop('badge_issued')
  }
}

module.exports = BadgeIssuedSchema
