'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScormScoesTrackSchema extends Schema {
  async up () {
    const exists = await this.hasTable('scorm_scoes_track')
    if (!exists){
      this.create('scorm_scoes_track', (table) => {
        table.bigIncrements()
        table.bigInteger('userid').nullable()
        table.bigInteger('scormid').nullable()
        table.bigInteger('scoid').nullable()
        table.integer('attempt').nullable()
        table.string('element', 255).nullable()
        table.text('value', 'longtext').nullable()
        table.bigInteger('timemodified', 255).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('scorm_scoes_track')
  }
  
}

module.exports = ScormScoesTrackSchema
