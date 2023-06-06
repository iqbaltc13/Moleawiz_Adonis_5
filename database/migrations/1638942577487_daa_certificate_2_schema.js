'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaCertificate2Schema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_certificate2')
    if (!exists){
      this.create('daa_certificate2', (table) => {
        table.bigIncrements()
        table.bigInteger('daa_journey_id',10).nullable()
        table.text('module_id', 'text').defaultTo('')
        table.string('name', 255).notNullable().defaultTo('')
        table.string('kode', 255).notNullable().defaultTo('')
        table.text('note', 'text').defaultTo('')
        table.string('certificate', 255).notNullable().defaultTo('')
        table.integer('visible',10).nullable()
        table.date('expired_date').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_certificate2')
  }
}

module.exports = DaaCertificate2Schema
