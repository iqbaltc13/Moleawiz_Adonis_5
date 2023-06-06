'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaCertificateUsersSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_certificate_users')
    if (!exists){
      this.create('daa_certificate_users', (table) => {
        table.bigIncrements()
        table.bigInteger('daa_certificate_id',10).nullable()
        table.bigInteger('userid',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_certificate_users')
  }
}

module.exports = DaaCertificateUsersSchema
