'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DaaCustomCertificateLog extends Model {

  static table = 'daa_custom_certificate_log';
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
  module(){
    return this.belongsTo('App/Models/Course','module_id','id')

  }
  course(){
    return this.belongsTo('App/Models/DaaCourse','course_id','id')

  }
  user(){
    return this.belongsTo('App/Models/User','user_id','id')

  }


}

module.exports = DaaCustomCertificateLog
