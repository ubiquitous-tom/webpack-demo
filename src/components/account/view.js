import { View } from 'backbone'

import Promo from 'shared/elements/promo'

import './stylesheet.scss'
import template from './index.hbs'

import AccountHomeModel from './model'
import AccountStatus from './status'
import AccountInfo from './info'
import BillingInfo from './billing'

class AccountHome extends View {
  get el() {
    return 'section.account-wrap'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'click a': 'navigate',
    }
  }

  initialize(options) {
    console.log('AccountHome initialize')
    console.log(this.model.attributes)
    this.i18n = options.i18n
    this.model = new AccountHomeModel(this.model.attributes)
    this.promoView = new Promo({ i18n: options.i18n })
    this.promoView.getPresetOptions()
    // console.log(this.model)
    // this.render()
    this.listenTo(this.model, 'sync error', this.render)
    // this.listenTo(this.model, 'change', this.render)
  }

  render() {
    console.log('AccountHome render')
    this.$el.html(this.template())

    // Initialize late in order for all the element to be added to the main dom
    this.accountStatus = new AccountStatus({ model: this.model, i18n: this.i18n })
    this.accountInfo = new AccountInfo({ model: this.model, i18n: this.i18n })
    this.billingInfo = new BillingInfo({ model: this.model, i18n: this.i18n })

    return this
  }
}

export default AccountHome
