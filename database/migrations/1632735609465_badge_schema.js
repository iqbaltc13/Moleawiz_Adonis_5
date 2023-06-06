'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BadgeSchema extends Schema {


  async up () {
    const exists = await this.hasTable('badge')
    if (!exists){
      this.create('badge', (table) => {
        table.bigIncrements()
        table.string('name',255).notNullable().defaultTo('')
        table.text('description', 'longtext').defaultTo('')
        table.bigInteger('timecreated',10).notNullable().defaultTo(0)
        table.bigInteger('timemodified',10).notNullable().defaultTo(0)
        table.bigInteger('usercreated',10).notNullable().defaultTo(0)
        table.bigInteger('usermodified',10).notNullable().defaultTo(0)
        table.string('issuername',255).notNullable().defaultTo('')
        table.string('issuerurl',255).notNullable().defaultTo('')
        table.string('issuercontact',255).notNullable().defaultTo('')
        table.bigInteger('expiredate',10).notNullable().defaultTo(0)
        table.bigInteger('expireperiod',10).notNullable().defaultTo(0)
        table.integer('type',10).notNullable().defaultTo(0)
        table.bigInteger('courseid',10).notNullable().defaultTo(0)
        table.text('message', 'longtext').defaultTo('')
        table.text('messagesubject', 'longtext').defaultTo('')
        table.integer('attachment',10).notNullable().defaultTo(0)
        table.integer('notification',10).notNullable().defaultTo(0)
        table.integer('status',10).notNullable().defaultTo(0)
        table.bigInteger('nextcron',10).notNullable().defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('badge')
  }
}

module.exports = BadgeSchema
