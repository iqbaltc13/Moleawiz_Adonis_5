'use strict'

class AuthController {
  async getLogin({ view }) {
    return view.render('auth.login')
  }

  async postLogin({ request, response, auth }) {
    const { email, password } = request.all()
    await auth.attempt(email, password)
    return response.route('/dashboard')
  }

  async postLogout({ auth, response }) {
    await auth.logout()
    return response.route('login')
  }



}

module.exports = AuthController
