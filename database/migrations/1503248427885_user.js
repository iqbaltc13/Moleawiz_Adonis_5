'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  async up () {
    const exists = await this.hasTable('user')
    if (!exists){
      this.create('user', (table) => {
        table.bigIncrements()
        table.string('auth',20).notNullable().defaultTo('manual')
        table.integer('confirmed',1).notNullable().defaultTo(0)
        table.integer('policyagreed',1).notNullable().defaultTo(0)
        table.integer('deleted',1).notNullable().defaultTo(0)
        table.integer('suspended',1).notNullable().defaultTo(0)
        table.integer('mnethostid',10).notNullable().defaultTo(0)
        table.string('username',100).notNullable().defaultTo('')
        table.string('password',255).notNullable().defaultTo('')
        table.string('idnumber',255).notNullable().defaultTo('')
        table.string('firstname',100).notNullable().defaultTo('')
        table.string('lasttname',100).notNullable().defaultTo('')
        table.string('email', 100).notNullable().defaultTo('')
        table.integer('emailstop',1).notNullable().defaultTo(0)
        table.string('icq', 15).notNullable().defaultTo('')
        table.string('skype', 50).notNullable().defaultTo('')
        table.string('yahoo', 50).notNullable().defaultTo('')
        table.string('aim', 50).notNullable().defaultTo('')
        table.string('msn', 50).notNullable().defaultTo('')
        table.string('phone1', 20).notNullable().defaultTo('')
        table.string('phone2', 20).notNullable().defaultTo('')
        table.string('institution', 255).notNullable().defaultTo('')
        table.string('department', 255).notNullable().defaultTo('')
        table.string('address', 255).notNullable().defaultTo('')
        table.string('city', 120).notNullable().defaultTo('')
        table.string('country', 2).notNullable().defaultTo('')
        table.string('lang', 30).notNullable().defaultTo('en')
        table.string('calendartype', 30).notNullable().defaultTo('gregorian')
        table.string('theme',50).notNullable().defaultTo('')
        table.string('timezone',100).notNullable().defaultTo('99')
        table.bigInteger('firstaccess',10).notNullable().defaultTo(0)
        table.bigInteger('lastaccess',10).notNullable().defaultTo(0)
        table.bigInteger('lastlogin',10).notNullable().defaultTo(0)
        table.bigInteger('currentlogin',10).notNullable().defaultTo(0)
        table.string('lastip',45).notNullable().defaultTo('')
        table.string('secret',15).notNullable().defaultTo('')
        table.bigInteger('picture',10).notNullable().defaultTo(0)
        table.string('daa_picture',250).notNullable().defaultTo(0)
        table.string('url',255).notNullable().defaultTo('')
        table.text('description','longtext').nullable()
        table.integer('descriptionformat',1).notNullable().defaultTo(0)
        table.integer('mailformat',1).notNullable().defaultTo(1)
        table.integer('maildigest',1).notNullable().defaultTo(0)
        table.integer('maildisplay',2).notNullable().defaultTo(2)
        table.integer('autosubscribe',1).notNullable().defaultTo(1)
        table.integer('trackforums',1).notNullable().defaultTo(0)
        table.bigInteger('timecreated',10).notNullable().defaultTo(0)
        table.bigInteger('timemodified',10).notNullable().defaultTo(0)
        table.bigInteger('trustbitmask',10).notNullable().defaultTo(0)
        table.string('imagealt', 225).nullable()
        table.string('lastnamephonetic',255).nullable()
        table.string('firstnamephonetic',255).nullable()
        table.string('middlename', 255).nullable()
        table.string('alternatename',255).nullable()
        table.integer('isreal',1).notNullable().defaultTo(0)
        table.timestamps()
      })
    }
  }


  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
