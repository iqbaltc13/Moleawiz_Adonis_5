'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserInfoCategory extends Model {
    static table = 'user_info_category';
    static boot = () => {
        super.boot()
        this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')
        /**
         * A hook to hash the user password before saving
         * it to the database.
         */

    }
    fields(){
        return this.hasMany('App/Models/UserInfoField','id','categoryid').whereNull('deleted_at').orderBy('sortorder','ASC')
    }
}

module.exports = UserInfoCategory
