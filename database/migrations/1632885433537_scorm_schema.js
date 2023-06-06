'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ScormSchema extends Schema {


  async up () {
    const exists = await this.hasTable('scorm')
    if (!exists){
      this.create('scorm', (table) => {
        table.bigIncrements()


        table.bigInteger('course',10).nullable()
        table.string('name',255).nullable()
        table.string('scormtype',50).nullable()
        table.string('reference',255).nullable()
        table.text('intro', 'longtext').defaultTo('')
        table.integer('introformat',10).nullable()
        table.string('version',9).nullable()
        table.integer('maxgrade',10).nullable()
        table.integer('grademethod',10).nullable()
        table.bigInteger('whatgrade',10).nullable()
        table.bigInteger('maxattempt',10).nullable()
        table.integer('forcecompleted',10).nullable()
        table.integer('forcenewattempt',10).nullable()
        table.integer('lastattemptlock',10).nullable()
        table.integer('masteryoverride',10).nullable()
        table.integer('displayattemptstatus',10).nullable()
        table.integer('displaycoursestructure',10).nullable()
        table.integer('updatefreq',10).nullable()
        table.string('sha1hash',40).nullable()
        table.string('md5hash',32).nullable()
        table.bigInteger('revision',10).nullable()
        table.bigInteger('launch',10).nullable()
        table.integer('skipview',10).nullable()
        table.integer('hidebrowse',10).nullable()
        table.integer('hidetoc',10).nullable()
        table.integer('nav',10).nullable()
        table.bigInteger('navpositionleft',10).nullable()
        table.bigInteger('navpositiontop',10).nullable()
        table.integer('auto',10).nullable()
        table.integer('popup',10).nullable()
        table.string('options',255).nullable()
        table.bigInteger('width',10).nullable()
        table.bigInteger('height',10).nullable()
        table.bigInteger('timeopen',10).nullable()
        table.bigInteger('timeclose',10).nullable()
        table.bigInteger('timemodified',10).nullable()
        table.integer('completionstatusrequired',10).nullable()
        table.integer('completionscorerequired',10).nullable()
        table.integer('completionstatusallscos',10).nullable()
        table.integer('displayactivityname',10).nullable()
        table.integer('autocommit',10).nullable()
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('scorm')
  }
}

module.exports = ScormSchema
