'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FileSchema extends Schema {
 up = async () => {
    const exists = await this.hasTable('files')
    if (!exists){
      this.create('files', (table) => {
        table.bigIncrements()
        table.string('contenthash', 40).nullable()
        table.string('pathnamehash', 40).nullable()
        table.bigInteger('contextid').nullable()
        table.string('component', 100).nullable()
        table.string('filearea', 50).nullable()
        table.bigInteger('itemid').nullable()
        table.string('filepath', 255).nullable()
        table.string('filename', 255).nullable()
        table.bigInteger('userid').nullable()
        table.bigInteger('filesize').nullable()
        table.string('mimetype', 100).nullable()
        table.bigInteger('status').nullable()
        table.text('source', 'longtext').defaultTo('')
        table.string('author', 255).nullable()
        table.string('license', 255).nullable() 
        table.bigInteger('timecreated ').nullable()
        table.bigInteger('timemodified').nullable()
        table.bigInteger('sortorder').nullable()
        table.bigInteger('referencefileid').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down = () => {
    this.drop('files')
  }
}

module.exports = FileSchema
