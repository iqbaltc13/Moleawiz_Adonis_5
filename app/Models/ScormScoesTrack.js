'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ScormScoesTrack extends Model {

 static table = 'scorm_scoes_track';
  // static boot = () => {
  //   super.boot()
  //   this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

  //   /**
  //    * A hook to hash the user password before saving
  //    * it to the database.
  //    */

  // }
  static get createdAtColumn(){
    return ''
  }
  static get updatedAtColumn(){
    return ''
  }

  scorm(){
    return this.belongsTo('App/Models/Scorm','scormid','id')
  }
  user= () => {
    return this.belongsTo('App/Models/User','userid','id')
  }
    
}

module.exports = ScormScoesTrack
