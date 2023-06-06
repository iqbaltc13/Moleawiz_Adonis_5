'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ModulePdca extends Model {
  static table = 'daa_project_pdca';
  static get createdAtColumn(){
    return ''
  }
  static get updatedAtColumn(){
    return ''
  }
}

module.exports = ModulePdca
