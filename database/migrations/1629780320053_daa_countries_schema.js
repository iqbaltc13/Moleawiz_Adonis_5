'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaCountriesSchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_countries')
    if (!exists){
      this.create('daa_countries', (table) => {
        table.bigIncrements()

        table.string('code',2).notNullable().defaultTo('')
        table.string('name',255).notNullable().defaultTo('')
        table.string('currency',3).notNullable().defaultTo('')
        table.string('iso_numeric',3).notNullable().defaultTo('')
        table.string('iso_alpha3',3).notNullable().defaultTo('')
        table.integer('created_at',10).notNullable().defaultTo(0)
        table.integer('updated_at',10).notNullable().defaultTo(0)
      })
    }
  }

  down () {
    this.drop('daa_countries')
  }
}

module.exports = DaaCountriesSchema
