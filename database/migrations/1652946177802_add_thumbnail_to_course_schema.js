'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddThumbnailToCourseSchema extends Schema {


   up = async () => {
    const exists = await this.hasTable('course')
    if (exists){

      this.alter('course', (table) => {
        table.text('thumbnail', 'text').nullable()



      })
    }
  }

  down () {
    this.table('add_thumbnail_to_courses', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AddThumbnailToCourseSchema
