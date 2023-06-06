'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterUserSchema extends Schema {
  up () {
    this.alter('user', (table) => {
      table.string('subdirectorate',255).nullable()
      table.string('group',255).nullable()
      table.string('division',255).nullable()
      table.string('superior',255).nullable()
      //table.string('department',255).nullable()
      table.string('position',255).nullable()
      table.string('worklocation',255).nullable()
      table.string('learningagent',255).nullable()
      table.string('directorate',255).nullable()
      table.string('nha',255).nullable()
      table.date('joindate').nullable()

    })
  }

  down () {
    this.table('user', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AlterUserSchema
