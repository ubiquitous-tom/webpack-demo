import { View } from 'backbone'

import './stylesheet.scss'
import template from './index.hbs'
import reducedTemplate from './reduced.hbs'
import AccountInfoModel from './model'

class AccountInfo extends View {
  get el() {
    return '#accountInfoView'
  }

  get template() {
    return this.getMembershipType()
  }

  get events() {
    return {
      'click .cancel-membership button': 'cancelMembership',
    }
  }

  initialize() {
    console.log('AccountInfo initialize')
    this.model = new AccountInfoModel(this.model.attributes)
    this.listenTo(this.model, 'change:monthlyStripePlan', () => {
      this.model.getJoinedDate()
      this.render()
    })
  }

  render() {
    console.log('AccountInfo render')
    const data = {
      isWebPaymentEdit: this.model.get('Customer').webPaymentEdit,
      customerName: this.model.get('Customer').Name,
      customerEmail: this.model.get('Customer').Email,
      customerJoinedDate: this.model.get('joinedDate'),
      noSubscription: this.model.get('Subscription').NoSubscription,
      isTigo: (this.model.get('Membership').Store === 'Tigo'),
      showCancelMembership: this.model.get('Membership').Cancelable && this.model.get('Customer').StripeEnabled,
    }
    const html = this.template(data)
    this.$el.html(html)

    return this
  }

  cancelMembership(e) {
    console.log('AccountInfo cancelMembership')
    e.preventDefault()
    const env = this.environment()
    const cancelMembershipURL = `https://${env}acorn.tv/account/cancel`
    window.location.assign(cancelMembershipURL)
  }

  getMembershipType() {
    if (this.model.get('Subscription').NoSubscription || this.model.get('Subscription').Canceled) {
      return reducedTemplate
    }

    return template
  }

  environment() {
    const env = process.env.ENVIRONMENT || ''
    // console.log(env)
    return env
  }
}

export default AccountInfo
