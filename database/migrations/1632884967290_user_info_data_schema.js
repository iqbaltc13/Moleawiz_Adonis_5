'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserInfoDataSchema extends Schema {


  async up () {
    const exists = await this.hasTable('user_info_data')
    if (!exists){
      this.create('user_info_data', (table) => {
        table.bigIncrements()
        table.bigInteger('userid',10).notNullable().defaultTo(0)
        table.bigInteger('fieldid',10).notNullable().defaultTo(0)
        table.text('data', 'longtext').defaultTo('')
        table.integer('dataformat',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }


  down () {
    this.drop('user_info_data')
  }
}

module.exports = UserInfoDataSchema
