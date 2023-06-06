'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Setting extends Model {
  static table = 'daa_settings';
}

module.exports = Setting
