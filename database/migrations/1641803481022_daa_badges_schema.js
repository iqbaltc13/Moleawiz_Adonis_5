'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaBadgesSchema extends Schema {


  async up () {
    const exists = await this.hasTable('daa_badges')
    if (!exists){
      this.create('daa_badges', (table) => {
        table.bigIncrements()
        table.bigInteger('daa_journey_id', 10).nullable()
        table.bigInteger('daa_course_id',10).nullable()
        table.bigInteger('module_id',10).nullable()
        table.integer('badgetype',10).nullable()
        table.string('name', 255).nullable()
        table.text('note', 'longtext').nullable()
        table.string('logo', 255).nullable()
        table.integer('point',10).nullable()
        table.integer('visible',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('daa_badges')
  }
}

module.exports = DaaBadgesSchema
