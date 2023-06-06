'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserInfoField extends Model {
    static table = 'user_info_field';
    static boot = () => {
        super.boot()
        this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')
        /**
         * A hook to hash the user password before saving
         * it to the database.
         */

    }
    category(){
        return this.belongsTo('App/Models/UserInfoCategory','categoryid','id')
    }
    user_datas(){
        return this.hasMany('App/Models/UserInfoDatum','fieldid','id').whereNull('deleted_at')
    }
}

module.exports = UserInfoField
