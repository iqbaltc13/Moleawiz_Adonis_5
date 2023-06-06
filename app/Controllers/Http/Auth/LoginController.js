'use strict'

class LoginController {

  getLogin = async ({ view }) => {
    return view.render('auth.login')
  }

  postLogin = async ({ request, response, auth,session })=> {
    const { email, password } = request.all()
   
   
    try {
      await auth.attempt(email, password)
      return response.route('/home')
    } catch {
      //return response.badRequest('Invalid credentials')
      session.flash({ failMessage: 'Email or Password is Invalid' +'!' });
      return response.route('login')
    }
    
  }

  postLogout = async ({ auth, response })=> {
    await auth.logout()
    return response.route('login')
  }
  postLogoutView = async ({ auth, response }) => {
    await auth.logout()
    return view.render('auth.logout')
  }

}

module.exports = LoginController
