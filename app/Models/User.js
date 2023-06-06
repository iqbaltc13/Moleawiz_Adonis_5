'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model  = use('Model');
const Config = use('App/Models/Config');
const Hash = use('Hash');

class User extends Model {
  static table = 'user';
  static boot = () => {
    super.boot()
     this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')
    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password);
      }
    })
  }
  static getYmdLastaccess = (lastaccess) => {


    const milliseconds = lastaccess * 1000; // 1575909015000

    const dateObject = new Date(milliseconds);
    return dateObject.toLocaleString();
  }

  // static checkIfAdmin (id){
  //   let data       =  await Config.query().where('name','siteadmins').first();
  //   let arrIdAdmin =  data.value.split(',');
  //   return arrIdAdmin.includes(id);
  // }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens(){
    return this.hasMany('App/Models/Token');
  }
  nationality(){
    return this.belongsTo('App/Models/DaaCountry','country','code');
    //return this.belongsTo('App/Models/DaaCountry','code','country')
  }
  info(){
      return this.hasOne('App/Models/UserInfoDatum','id','userid').whereNull('deleted_at');
  }
  module_logs(){
    return this.hasMany('App/Models/DaaModuleLog','id','user_id').whereNull('deleted_at').where('score',100);
  }
  cohort_member(){
    return this.hasMany('App/Models/CohortMember','id','userid').whereNull('deleted_at');
  }
  role_assignments(){
    return this.hasMany('App/Models/RoleAssignment','id','userid').whereNull('deleted_at');
  }

  learner_buddies(){
    return this.hasMany('App/Models/DaaChallengeBuddy','id','learnerid').whereNull('deleted_at');
  }
  buddy_learners(){
    return this.hasMany('App/Models/DaaChallengeBuddy','id','buddyid').whereNull('deleted_at');
  }

}

module.exports = User
