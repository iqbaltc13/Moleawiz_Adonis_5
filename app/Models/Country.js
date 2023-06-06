'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Country extends Model {
  static table = 'daa_countries';
  static boot = () => {
    super.boot()
    this.addTrait("@provider:Lucid/UpdateOrCreate")
    this.addTrait('DbConnectionRoutify')

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */

  }
  static get hidden () {
    return [
    	'id', 'currency', 'iso_numeric', 'iso_alpha3'
    ]
  }

}

module.exports = Country
