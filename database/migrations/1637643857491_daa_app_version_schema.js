'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaAppVersionSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_app_version')
    if (!exists){
      this.create('daa_app_version', (table) => {
        table.bigIncrements()
        table.string('type', 255).notNullable().defaultTo('')
        table.integer('version_code',10).nullable()
        table.string('version_name', 255).notNullable().defaultTo('')
        table.integer('is_force',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }


  down () {
    this.drop('daa_app_version')
  }
}

module.exports = DaaAppVersionSchema
