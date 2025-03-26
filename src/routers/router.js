import { History, Router } from 'backbone'
import _ from 'underscore'
import BackBoneContext from 'core/contexts/backbone-context'

import Logout from 'shared/elements/logout'

import AccountHome from 'components/account'
import EditEmail from 'components/edit-email'
import EditPassword from 'components/edit-password'
import ApplyPromoCode from 'components/apply-promo-code'
import UpdateCard from 'components/updatecard/view'

class Workspace extends Router {
  get routes() {
    return {
      accountStatus: 'accountStatus',
      editAccount: 'editAccount',
      editEmail: 'editEmail',
      editPassword: 'editPassword',
      cancelMembership: 'cancelMembership',
      renewMembership: 'renewMembership',
      buyMembership: 'buyMembership',
      applyPromoCode: 'applyPromoCode',
      updatecard: 'updateCard',
      refresh: 'refresh',
      logout: 'logout',
      '*path': 'home',
    }
  }

  initialize(options) {
    console.log('Router initialize')
    this.model = options.model
    this.i18n = options.i18n
    this.history = new History()
    this.context = new BackBoneContext()
    this.ga = this.context.getContext('ga')
    this.mp = this.context.getContext('mp')
    // Backbone.history.trigger('route', router, name, args);
  }

  execute(callback, args, name) {
    console.log('Router execute', callback, args, name)
    this.setActiveSidebar()
    this.ga.logPageView(name)
    this.mp.logPageView(name)

    // Once the `/initializeApp` API is fully logged in then log into mParticle.
    if (this.model.get('Session') && this.model.get('Session')?.LoggedIn) {
      const userData = {
        email: this.model.get('Customer')?.Email || '',
        customerID: this.model.get('Customer')?.CustomerID || '',
      }
      if (!this.mp.isMParticleLoggedIn()) {
        debugger
        this.mp.login(this.model.get('Session').LoggedIn, userData)
      }
    } else {
      console.log('logged out')
      debugger
      const signinURL = `${this.model.get('signinEnv')}/signin.jsp?OperationalScenario=STORE`
      window.location.assign(signinURL)
    }

    if (callback) {
      callback.apply(this, args)
    }
  }

  goToLogin() {
    console.log('Router loads goToLogin')
    this.accountStatus()
  }

  accountStatus() {
    console.log('Router loads accountStatus')
    new AccountHome({ model: this.model, i18n: this.i18n })
  }

  logout() {
    console.log('Router loads logout')
    new Logout()
  }

  editAccount() {
    console.log('Router loads editAccount')
  }

  editEmail() {
    console.log('Router loads editEmail')
    new EditEmail({ model: this.model, i18n: this.i18n })
  }

  editPassword() {
    console.log('Router loads editPassword')
    new EditPassword({ model: this.model, i18n: this.i18n })
  }

  cancelMembership() {
    console.log('Router loads cancelMembership')
  }

  renewMembership() {
    console.log('Router loads renewMembership')
  }

  buyMembership() {
    console.log('Router loads buyMembership')
  }

  applyPromoCode() {
    console.log('Router loads applyPromoCode')
    new ApplyPromoCode({ model: this.model, i18n: this.i18n })
  }

  updateCard() {
    console.log('Router loads updateCard')
    new UpdateCard({ model: this.model, i18n: this.i18n })
  }

  refresh() {
    History.loadUrl()
    return false
  }

  home() {
    this.navigate('accountStatus', true)
  }

  setActiveSidebar() {
    // A hack to get default navigation to work
    if (!$('ul li').hasClass('active')) {
      const hash = !_.isEmpty(window.location.hash) ? window.location.hash : '#accountStatus'
      $(`${hash}Nav`).addClass('active')
    }
  }

  subscriptionUpdatedSuccess(model) {
    console.log('Router subscriptionUpdatedSuccess')
    console.log(this, model)
    // debugger
    // this.navigate('accountStatus', { trigger: true, replace: true })
    // let newFragment = Backbone.history.getFragment($(this).attr('href'));
    // if (Backbone.history.fragment == newFragment) {
    //   // need to null out Backbone.history.fragement because
    //   // navigate method will ignore when it is the same as newFragment
    //   Backbone.history.fragment = null;
    //   Backbone.history.navigate(newFragment, true);
    // }
    // this.accountStatus()
    window.location.reload()
  }

  subscriptionUpdatedError(model) {
    console.log('Router subscriptionUpdatedError')
    console.log(this, model)
    // debugger
    // this.navigate('accountStatus', { trigger: true, replace: true })
    // this.accountStatus()
    window.location.reload()
  }
}

export default Workspace
