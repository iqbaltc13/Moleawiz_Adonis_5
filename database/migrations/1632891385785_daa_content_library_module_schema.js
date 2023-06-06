'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaContentLibraryModuleSchema extends Schema {

  async up () {
    const exists = await this.hasTable('daa_content_library_module')
    if (!exists){
      this.create('daa_content_library_module', (table) => {
        table.bigIncrements()
        table.bigInteger('content_library_id',10).notNullable().defaultTo(0)
        table.bigInteger('module_id',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_content_library_module')
  }
}

module.exports = DaaContentLibraryModuleSchema
