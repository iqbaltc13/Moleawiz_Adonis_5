'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaCertificate2 extends Model {
  static table = 'daa_certificate2';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }

  journey(){
    return this.belongsTo('App/Models/DaaJourney','daa_journey_id','id')

  }

  certificate_user(){
    return this.hasMany('App/Models/DaaCertificateUser2','id','daa_certificate_id').whereNull('deleted_at')
  }


}

module.exports = DaaCertificate2
