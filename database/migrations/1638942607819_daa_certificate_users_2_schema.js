'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaCertificateUsers2Schema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_certificate_users2')
    if (!exists){
      this.create('daa_certificate_users2', (table) => {
        table.bigIncrements()
        table.bigInteger('daa_certificate_id',10).nullable()
        table.string('number_certificate', 255).notNullable().defaultTo('')
        table.bigInteger('userid',10).nullable()
        table.decimal('score', 4, 2).nullable()
        table.datetime('complete_at').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_certificate_users2')
  }
}

module.exports = DaaCertificateUsers2Schema
