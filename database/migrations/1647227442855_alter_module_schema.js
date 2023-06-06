'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Module = use('App/Models/Course')

class AlterModuleSchema extends Schema {
  async up () {
    const exists = await this.hasTable('course')
    if (exists){
      await Module.truncate();
      this.alter('course', (table) => {
        table.dropColumn('startdate')
        table.dropColumn('enddate')
        table.dropColumn('timecreated')
        table.dropColumn('timemodified')
        table.dropColumn('cacherev')

        
        
      })
    }
  }

  down () {
    this.drop('course')
  }
}

module.exports = AlterModuleSchema
