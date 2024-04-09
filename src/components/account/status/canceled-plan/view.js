import { View } from 'backbone'

import './stylesheet.scss'
import FlashMessage from 'shared/elements/flash-message'
import Promo from 'shared/elements/promo'
import placeholder from './placeholder.hbs'
import template from './index.hbs'
import AnnualPlanModel from '../annual-plan/model'
// import SwitchToMonthlyPlan from '../switch-to-monthly-plan'

class CanceledPlan extends View {
  get el() {
    return '.current-plan'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'click button#restartMembership': 'restartMembership',
    }
  }

  initialize(options) {
    console.log('CanceledPlan initialize')
    this.flashMessage = new FlashMessage()
    this.i18n = options.i18n
    this.model = new AnnualPlanModel(this.model.attributes)
    this.promoView = new Promo({ i18n: this.i18n })
    console.log(this.promoView.presetOptions)
    if (this.model.has('monthlyStripePlan')) {
      this.render()
    } else {
      this.contentPlaceholder()
    }

    this.listenTo(this.model, 'change:monthlyStripePlan', this.render)
  }

  render() {
    console.log('CanceledPlan render')
    const data = {
      annual: this.model.get('Subscription').Annual,
      planType: this.getPlanType(),
      cancelledDate: this.getLocalizedDate(this.model.get('Membership').CancelDate), // this.model.get('Membership').CancelDate,
      currSymbol: this.model.get('monthlyStripePlan').CurrSymbol,
      subscriptionAmount: this.getCurrentNetAmount(),
      termType: this.getTermType(),
      annualPerMonthPricing: this.model.get('annualPerMonthPricing'),
      monthlySubscriptionAmount: this.model.get('monthlyStripePlan').SubscriptionAmount,
      tagline: this.getTagline(),
    }
    const html = this.template(data)
    this.$el.html(html)

    this.restartNowBanner()

    return this
  }

  contentPlaceholder() {
    console.log('CanceledPlan contentPlaceholder')
    this.$el.html(placeholder)
  }

  restartMembership(e) {
    console.log('CanceledPlan restartMembership')
    e.preventDefault()
    /* eslint max-len: 0 */
    // const startFreeTrialURL = `${this.model.get('signinEnv')}/trialsignup.jsp?OperationalScenario=STORE`
    let reStartMembershipURL = `${this.model.get('storeEnv')}/#membership`
    const presets = this.getPresetOptions()
    const queryString = new URLSearchParams(presets).toString()
    if (queryString) {
      const parsedURL = new URL(reStartMembershipURL)
      reStartMembershipURL = new URL(`${parsedURL.origin}${parsedURL.pathname}?${queryString}${parsedURL.hash}`)
    }
    debugger
    console.log(reStartMembershipURL)
    this.promoView.removePresetOptions()
    window.location.assign(reStartMembershipURL)
  }

  getCurrentNetAmount() {
    if (this.model.get('Membership').NetAmount) {
      return this.model.get('Membership').NetAmount
    }
    if (this.model.get('Membership').NextBillingAmount) {
      return this.model.get('Membership').NextBillingAmount
    }
    return this.model.get('Membership').SubscriptionAmount
  }

  getTagline() {
    const expirationDate = (this.model.get('stripePlansCountry') === 'US')
      ? this.model.get('Membership').ExpirationDate
      : this.getLocalizedDate(this.model.get('Membership').ExpirationDate)
    // return `you can stream until ${this.model.get('Membership').ExpirationDate}.`
    return this.i18n.t('YOU-CAN-STREAM-UNTIL-DATE', { expirationDate })
  }

  getPlanType() {
    return (this.model.get('Subscription').Annual) ? this.i18n.t('ANNUAL') : this.i18n.t('MONTHLY')
  }

  getTermType() {
    return (this.model.get('Subscription').Annual) ? this.i18n.t('YR') : this.i18n.t('MO')
  }

  restartNowBanner() {
    const cancelledDate = (this.model.get('stripePlansCountry') === 'US')
      ? this.model.get('Membership').CancelDate
      : this.getLocalizedDate(this.model.get('Membership').CancelDate)
    const message = this.i18n.t('PLAN-TYPE-WAS-CANCELED-DATE-RESTART-NOW', { cancelledDate })
    const type = 'error'

    this.flashMessage.onFlashMessageShow(message, type)
  }

  getLocalizedDate(mmddyy) {
    const mmddyyObj = Date.parse(mmddyy)
    const d = new Date(0)
    d.setUTCMilliseconds(mmddyyObj)
    return this.model.formatDate(d)
  }

  getPresetOptions() {
    const presets = {}
    Object.entries(this.promoView.presetOptions).forEach((option) => {
      // debugger
      const [preset, sessionKey] = option
      console.log(sessionStorage.getItem(sessionKey))
      if (sessionStorage.getItem(sessionKey)) {
        presets[preset] = sessionStorage.getItem(sessionKey)
      }
    })

    console.log(presets)
    return presets
  }
}

export default CanceledPlan
