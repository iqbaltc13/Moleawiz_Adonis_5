'use strict'

class DbConnectionRoutify {
  register (Model, customOptions = {}) {
    const defaultOptions = {}
    const options = Object.assign(defaultOptions, customOptions)

    Object.defineProperty(Model, 'connection', {
      get: () => {
        return this.connection
      },
      set: connection => {
        this.connection = connection
      }
    })

    Model.addHook('beforeCreate', () => {
      this.connection = 'db_writer'
    })
    Model.addHook('beforeUpdate', () => {
      this.connection = 'db_writer'
    })
    Model.addHook('beforeSave', () => {
      this.connection = 'db_writer'
    })
    Model.addHook('beforeDelete', () => {
      this.connection = 'db_writer'
    })

    Model.addHook('afterCreate', () => {
      this.connection = 'db_reader'
    })
    Model.addHook('afterUpdate', () => {
      this.connection = 'db_reader'
    })
    Model.addHook('afterSave', () => {
      this.connection = 'db_reader'
    })
    Model.addHook('afterDelete', () => {
      this.connection = 'db_reader'
    })
    Model.addHook('afterFind', () => {
      this.connection = 'db_reader'
    })
    Model.addHook('afterFetch', () => {
      this.connection = 'db_reader'
    })
    Model.addHook('afterPaginate', () => {
      this.connection = 'db_reader'
    })
  }
}

module.exports = DbConnectionRoutify
