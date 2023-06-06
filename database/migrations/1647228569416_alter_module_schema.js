'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterModuleSchema extends Schema {
  

  async up () {
    const exists = await this.hasTable('course')
    if (exists){
      
      this.alter('course', (table) => {
        table.datetime('startdate')
        table.datetime('enddate')
        table.datetime('timecreated')
        table.datetime('timemodified')
        table.datetime('cacherev')

        
        
      })
    }
  }

  down () {
    this.drop('course')
  }
}

module.exports = AlterModuleSchema
