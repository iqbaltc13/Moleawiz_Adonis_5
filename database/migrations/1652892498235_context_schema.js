'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ContextSchema extends Schema {
  
   up = async () => {
    const exists = await this.hasTable('context')
    if (!exists){
      this.create('context', (table) => {
        table.bigIncrements()
        table.bigInteger('contextlevel').nullable()
        table.bigInteger('instanceid').nullable()
        table.string('path', 255).nullable()
        table.integer('depth').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down = () => {
    this.drop('context')
  }
}

module.exports = ContextSchema
