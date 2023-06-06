'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DaaCronjobLogSchema extends Schema {


  async up () {
    const exists = await this.hasTable('daa_cronjob_log')
    if (!exists){
      this.create('daa_cronjob_log', (table) => {
        table.bigIncrements()
        table.string('cron_name', 255).nullable()
        table.datetime('start_date').nullable()
        table.datetime('end_date').nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }
  

  down () {
    this.drop('daa_cronjob_log')
  }
}

module.exports = DaaCronjobLogSchema
