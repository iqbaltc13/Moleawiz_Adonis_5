'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaContentLibrarySchema extends Schema {

  async up () {
    const exists = await this.hasTable('daa_content_library')
    if (!exists){
      this.create('daa_content_library', (table) => {
        table.bigIncrements()
        table.string('name',255).notNullable().defaultTo('')
        table.string('thumbnail',255).notNullable().defaultTo('')
        table.text('note', 'text').defaultTo('')
        table.integer('visible',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_content_library')
  }
}

module.exports = DaaContentLibrarySchema
