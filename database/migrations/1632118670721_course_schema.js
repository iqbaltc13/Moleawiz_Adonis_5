'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CourseSchema extends Schema {
  
  
  async up () {
    const exists = await this.hasTable('course')
    if (!exists){
      this.create('course', (table) => {
        table.bigIncrements()
        table.bigInteger('category',10).notNullable().defaultTo(0)
        table.bigInteger('sortorder',100).notNullable().defaultTo(0)
        table.string('fullname',254).notNullable().defaultTo('')
        table.string('shortname',255).notNullable().defaultTo('')
        table.string('idnumber',100).notNullable().defaultTo('')
        table.text('summary', 'longtext').defaultTo('')
        table.integer('summaryformat',10).notNullable().defaultTo(0)
        table.string('format',21).notNullable().defaultTo('')
        table.text('scorm_file', 'longtext').defaultTo('')
        table.integer('showgrades',10).notNullable().defaultTo(0)
        table.integer('newsitems',10).notNullable().defaultTo(0)
        table.bigInteger('startdate',10).notNullable().defaultTo(0)
        table.bigInteger('enddate',10).notNullable().defaultTo(0)
        table.bigInteger('marker',10).notNullable().defaultTo(0)
        table.bigInteger('maxbytes',10).notNullable().defaultTo(0)
        table.integer('legacyfiles',10).notNullable().defaultTo(0)
        table.integer('showreports',10).notNullable().defaultTo(0)
        table.integer('visible',10).notNullable().defaultTo(0)
        table.integer('visibleold',10).notNullable().defaultTo(0)
        table.integer('groupmode',10).notNullable().defaultTo(0)
        table.integer('groupmodeforce',10).notNullable().defaultTo(0)
        table.bigInteger('defaultgroupingid',10).notNullable().defaultTo(0)
        table.string('lang',30).notNullable().defaultTo('')
        table.string('calendartype',30).notNullable().defaultTo('')
        table.string('theme',50).notNullable().defaultTo('')
        table.bigInteger('timecreated',10).notNullable().defaultTo(0)
        table.bigInteger('timemodified',10).notNullable().defaultTo(0)
        table.integer('requested',10).notNullable().defaultTo(0)
        table.integer('enablecompletion',10).notNullable().defaultTo(0)
        table.integer('completionnotify',10).notNullable().defaultTo(0)
        table.bigInteger('cacherev',10).notNullable().defaultTo(0)
        table.integer('module_type',10).notNullable().defaultTo(0)
        table.integer('is_placement_test',10).notNullable().defaultTo(0)
        table.integer('max_point_attempt',10).notNullable().defaultTo(0)
        table.integer('module_category',10).notNullable().defaultTo(0)
        table.integer('has_rating',10).notNullable().defaultTo(0)
        table.integer('unity',10).notNullable().defaultTo(0)
        table.string('trailer',50).notNullable().defaultTo('')
        table.integer('attempt',10).notNullable().defaultTo(0)
        table.string('description',255).notNullable().defaultTo('')
        table.decimal('learning_effort', 4, 2).defaultTo(0)
        table.datetime('updated_at').nullable()
        table.datetime('created_at').nullable()
        table.datetime('deleted_at').nullable()
      })
    }
  }

  down () {
    this.drop('course')
  }
}

module.exports = CourseSchema
