'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaUserTokenSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_user_tokens')
    if (!exists){
      this.create('daa_user_tokens', (table) => {
        table.bigIncrements()
        table.bigInteger('user_id',10).notNullable().defaultTo(0)
        table.string('token',191).notNullable().defaultTo('')
        table.string('firebase_token',255).notNullable().defaultTo('')
        table.string('brand',255).notNullable().defaultTo('')
        table.string('model',255).notNullable().defaultTo('')
        table.string('serial_number',255).notNullable().defaultTo('')
        table.string('platform', 255).notNullable().defaultTo('')
        table.string('version', 255).notNullable().defaultTo('')
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_user_tokens')
  }
}

module.exports = DaaUserTokenSchema
