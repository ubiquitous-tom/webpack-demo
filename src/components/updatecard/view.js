import { View } from 'backbone'
// import _ from 'underscore'
import BackBoneContext from 'core/contexts/backbone-context'
import SubmitLoader from 'shared/elements/submit-loader'
import FlashMessage from 'shared/elements/flash-message'

import './stylesheet.scss'
import template from './index.hbs'

import UpdateCardModel from './model'
import ConfirmNewBilling from './confirm-new-billing'

class UpdateCard extends View {
  get el() {
    return 'section.account-wrap'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'click button.go-to-membership': 'goToMembership',
    }
  }

  initialize(options) {
    console.log('UpdateCard initialize')
    console.log(this.model, options)
    this.i18n = options.i18n
    this.submitLoader = new SubmitLoader()
    this.flashMessage = new FlashMessage()
    this.model = new UpdateCardModel(options.model.attributes)

    this.render()

    this.context = new BackBoneContext()
    this.ga = this.context.getContext('ga')
    this.ga.logEvent('Upgrade Started', 'Click', 'Upgrade')

    /* eslint no-shadow: 0 */
    this.listenTo(this.model, 'change:currentMembershipSuccess', (model, value, options) => {
      console.log(model, value, options)
      console.log(this)
      // debugger
      this.confirmBilling = new ConfirmNewBilling({ updateCard: this, i18n: this.i18n })
    })
  }

  render() {
    console.log('UpdateCard render')
    // const ckey = '1742pkulzsyysulfkngkfulcd'
    // const stripeCustomerID = this.model.get('Customer').StripeCustomerID
    // const data = {
    //   src: `https://payments.stunning.co/payment_update/${ckey}/${stripeCustomerID}`,
    // }
    console.log(this.model.attributes)
    const html = this.template(this.model.attributes)

    this.$el.html(html)

    // this.hideFooter()

    // _.delay(this.goBack, 3000, this)

    return this
  }

  goToMembership(e) {
    console.log('UpdateCard goToMembership')
    e.preventDefault()
    this.$el.find('#stunning').remove()
    // this.showFooter()
    // window.location.assign('#accountStatus')
    // window.location.reload()
    debugger
    Backbone.history.navigate('accountStatus', { trigger: true })
  }

  // showFooter() {
  //   $('footer').show()
  // }

  // hideFooter() {
  //   $('footer').hide()
  // }
}

export default UpdateCard
