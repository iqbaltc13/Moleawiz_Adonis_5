'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaCustomCertificateLogSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_custom_certificate_log')
    if (!exists){
      this.create('daa_custom_certificate_log', (table) => {
        table.bigIncrements()
        table.string('cert_number', 255).notNullable().defaultTo('')
        table.bigInteger('user_id',10).nullable()
        table.bigInteger('journey_id',10).nullable()
        table.bigInteger('course_id',10).nullable()
        table.bigInteger('module_id',10).nullable()
        table.decimal('score', 4, 2).nullable()
        table.date('issued_date').nullable()
        table.date('expired_date').nullable()
        table.datetime('last_access').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_custom_certificate_log')
  }
}

module.exports = DaaCustomCertificateLogSchema
