'use strict'

/*
|--------------------------------------------------------------------------
| ThemeSettingSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

class ThemeSettingSeeder {
  async run () {
    await User.createMany([
      {
        name  : 'fundamentals',
        value : JSON.stringify({
                                logo : "http://127.0.0.1:3333/templates/UBold_v5.1.0/Admin/dist/assets/images/logo_moleawiz.png",
                                navbar_color : "#40444c",
                                title_website : "Moleawiz",
                                footer: "2021 © UBold theme by" ,
                                author_theme : "Coderthemes"
                              })

      }
    ])
  }
}

module.exports = ThemeSettingSeeder
