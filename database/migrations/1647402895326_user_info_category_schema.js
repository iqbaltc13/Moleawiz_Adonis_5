'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserInfoCategorySchema extends Schema {
  async up () {
    const exists = await this.hasTable('user_info_category')
    if (!exists){
      this.create('user_info_category', (table) => {
        table.bigIncrements()
        table.string('name', 255).nullable()
        table.bigInteger('sortorder').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('user_info_category')
  }
}

module.exports = UserInfoCategorySchema
