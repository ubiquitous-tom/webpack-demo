import { View } from 'backbone'
import LogoutModel from './model'

class Logout extends View {
  initialize() {
    console.log('Logout initialize')
    this.logoutModel = new LogoutModel()
    /* eslint no-unused-vars: 0 */
    this.listenTo(this.logoutModel, 'change:isLoggedOut', (model, value, options) => {
      // console.log(model, value, options)
      this.model.trigger('global:logoutSuccess', model, value)
    })
  }
}

export default Logout
