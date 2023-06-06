'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaModuleCategorySchema extends Schema {
  async up () {
    const exists = await this.hasTable('daa_module_category')
    if (!exists){
      this.create('daa_module_category', (table) => {
        table.bigIncrements()
        table.string('name',255).notNullable().defaultTo('')
        table.integer('visible',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }


  down () {
    this.drop('daa_module_category')
  }
}

module.exports = DaaModuleCategorySchema
