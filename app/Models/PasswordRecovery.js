'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PasswordRecovery extends Model {
  static table = 'daa_user_pass_recovery';
}

module.exports = PasswordRecovery
