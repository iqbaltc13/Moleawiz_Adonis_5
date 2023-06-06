const Env = use('Env')

module.exports = {
  ...
  apiKey = Env.getOrFail('FCM_SERVER_KEY'),
  requestOptions: {
    // proxy: 'http://127.0.0.1'
    // timeout: 5000
  }
}