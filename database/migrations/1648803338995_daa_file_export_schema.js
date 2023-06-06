'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaFileExportSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_file_exports')
    if (!exists){
      this.create('daa_file_exports', (table) => {
        table.bigIncrements()
        table.string('name', 255).nullable()
        table.text('full_path', 'longtext').nullable()
        table.string('type', 255).nullable()
        table.string('userid', 255).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_file_exports')
  }
}

module.exports = DaaFileExportSchema
