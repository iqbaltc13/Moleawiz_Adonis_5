'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class GlossariumSchema extends Schema {


  async up () {
    const exists = await this.hasTable('glossariums')
    if (!exists){
      this.create('glossariums', (table) => {
        table.bigIncrements()
        table.string('term', 255).nullable()
        table.text('description1', 'longtext').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('glossariums')
  }
}

module.exports = GlossariumSchema
