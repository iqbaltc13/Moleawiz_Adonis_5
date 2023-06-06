'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserInfoFieldSchema extends Schema {
 async up () {
    const exists = await this.hasTable('user_info_field')
    if (!exists){
      this.create('user_info_field', (table) => {
        table.bigIncrements()
        table.string('shortname', 255).nullable()
        table.text('name','longtext').nullable()
        table.string('datatype', 255).nullable()
        table.text('description', 'longtext').nullable()
        table.integer('descriptionformat').nullable()
        table.bigInteger('categoryid').nullable()
        table.bigInteger('sortorder').nullable()
        table.integer('required').nullable()
        table.integer('locked').nullable()
        table.integer('visible').nullable()
        table.integer('forceunique').nullable()
        table.integer('signup').nullable()
        table.text('defaultdata', 'longtext').nullable()
        table.integer('defaultdataformat').nullable()
        table.text('param1', 'longtext').nullable()
        table.text('param2', 'longtext').nullable()
        table.text('param3', 'longtext').nullable()
        table.text('param4', 'longtext').nullable()
        table.text('param5', 'longtext').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('user_info_field')
  }
}

module.exports = UserInfoFieldSchema
