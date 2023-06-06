'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaCertificateUser extends Model {
  static table = 'daa_certificate_users';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }

  user(){
    return this.belongsTo('App/Models/User','userid','id')

  }
  daa_certificate(){
    return this.belongsTo('App/Models/DaaCertificate','daa_certificate_id','id')
  }
}

module.exports = DaaCertificateUser
