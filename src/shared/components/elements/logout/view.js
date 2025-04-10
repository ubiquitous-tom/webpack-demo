import { View } from 'backbone'
import BackBoneContext from 'core/contexts/backbone-context'
import LogoutModel from './model'

class Logout extends View {
  initialize() {
    console.log('Logout initialize')
    this.context = new BackBoneContext()
    this.mp = this.context.getContext('mp')

    this.logoutModel = new LogoutModel()
    /* eslint no-unused-vars: 0 */
    this.listenTo(this.logoutModel, 'change:isLoggedOut', (model, value, options) => {
      // console.log(model, value, options)
      this.mp.logout(value)
    })

    this.listenTo(this.model, 'logout:success', () => {
      // debugger
      window.location.assign('/')
    })
  }
}

export default Logout
