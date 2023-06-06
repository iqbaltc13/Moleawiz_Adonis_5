const { hooks } = use('@adonisjs/ignitor')



hooks.after.providersBooted(() => {
    const Env = use('Env')
    const View = use('View')
    const ThemeSetting                 = use('App/Models/ThemeSetting')

    View.global('BASE_URL', function () {
        return Env.get('BASE_URL')
    })    

})

hooks.before.providersBooted(() => {
    const Env = use('Env')
    const View = use('View')
    //

    View.global('NODE_ENV', function () {
        return Env.get('NODE_ENV')
    })

    View.global('THEME_SETTING', async function () {
        const ThemeSetting                 = use('App/Models/ThemeSetting')
        let data = await ThemeSetting.query().where('name', 'fundamentals').first();
        console.log(data.value)
        return data.then((response) => response.json());
    })

    

    


})


