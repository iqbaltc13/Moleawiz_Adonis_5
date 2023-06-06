'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaRestrictSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_restrict')
    if (!exists){
      this.create('daa_restrict', (table) => {
        table.bigIncrements()
        table.integer('acttype',10).nullable()
        table.bigInteger('actid',10).nullable()
        table.bigInteger('resid',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_restrict')
  }
}

module.exports = DaaRestrictSchema
