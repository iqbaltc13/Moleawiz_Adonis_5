'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaCertificateSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_certificate')
    if (!exists){
      this.create('daa_certificate', (table) => {
        table.bigIncrements()
        table.bigInteger('daa_journey_id',10).nullable()
        table.bigInteger('module_id',10).nullable()
        table.string('name', 255).notNullable().defaultTo('')
        table.text('note', 'text').defaultTo('')
        table.string('certificate', 255).notNullable().defaultTo('')
        table.integer('visible',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_certificate')
  }
}

module.exports = DaaCertificateSchema
