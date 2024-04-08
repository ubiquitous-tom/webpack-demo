import { View } from 'backbone'
import _ from 'underscore'
import BackBoneContext from 'core/contexts/backbone-context'
import SubmitLoader from 'shared/elements/submit-loader'
import FlashMessage from 'shared/elements/flash-message'

import './stylesheet.scss'
import template from './index.hbs'

import SwitchToAnnualPlanModel from './model'
import ConfirmBilling from './confirm-billing'
import PromoCode from './promo-code/view'

class SwitchToAnnualPlan extends View {
  get el() {
    return '#account'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'click button.confirm-upgrade': 'confirmUpgrade',
    }
  }

  initialize(options) {
    console.log('SwitchToAnnualPlan intialize')
    // console.log(options.monthlyPlan)
    this.i18n = options.i18n
    this.submitLoader = new SubmitLoader()
    this.flashMessage = new FlashMessage()
    this.model = new SwitchToAnnualPlanModel(options.monthlyPlan.attributes)
    this.confirmBilling = new ConfirmBilling({ switchToAnnualPlan: this, i18n: this.i18n })
    this.promoCode = new PromoCode({ model: this.model, switchToAnnualPlan: this, i18n: this.i18n })
    console.log(this)
    this.render()

    this.context = new BackBoneContext()
    this.ga = this.context.getContext('ga')
    this.ga.logEvent('Upgrade Started', 'Click', 'Upgrade')

    this.model.set('promoCodeFieldDisplay', true)

    /* eslint no-shadow: 0 */
    this.listenTo(this.model, 'change:upgradeToAnnualWithPromoCode', (model, value, options) => {
      console.log(model, value, options)
      console.log(this)
      debugger
      const gaPromoCode = model.has('promoCode') ? model.get('promoCode') : ''
      if (!_.isEmpty(gaPromoCode)) {
        this.ga.logEvent('Subscription Changed', 'Upgrade', gaPromoCode)
      }
    })

    /* eslint no-shadow: 0 */
    this.listenTo(this.model, 'change:upgradeToAnnualSuccess', (model, value, options) => {
      console.log(model, value, options)
      console.log(this)
      debugger
      this.loadingStop()
      this.$el.find('.switch-to-annual-plan-container').remove()
      this.showFooter()
      let { message } = model.get('flashMessage')
      const { interpolationOptions, type } = model.get('flashMessage')
      message = this.i18n.t(message, interpolationOptions)
      debugger
      const gaCategory = 'Subscription Changed'
      const gaAction = 'Upgrade'
      let gaLabel = 'Success'
      if (value) {
        this.ga.logEvent(gaCategory, gaAction, gaLabel)
        this.flashMessage.onFlashMessageSet(message, type, true)
      } else {
        gaLabel = message
        this.ga.logEvent(gaCategory, gaAction, gaLabel)
        this.flashMessage.onFlashMessageShow(message, type)
      }
    })

    // Trigger Show/Hide promo code form in PromoCode View
    /* eslint no-unused-vars: 0 */
    this.listenTo(this.model, 'change:promoCodeFieldDisplay', (model, value, options) => {
      this.submitButtonDisplay(model, value, options)
      this.promoCode.promoCodeFieldDisplay(model, value, options)
    })
  }

  render() {
    console.log('SwitchToAnnualPlan render')
    // console.log(this.model.attributes)
    const data = {
      isPromoApplied: this.model.get('isPromoApplied') ? 'applied-success' : '',
      currSymbol: this.model.get('annualStripePlan').CurrSymbol,
      annualSubscriptionAmount: this.model.has('promoAppliedAmount')
        ? this.model.get('promoAppliedAmount')
        : this.model.get('annualStripePlan').SubscriptionAmount,
      nextBillingDate: this.getLocalizedDate(this.model.get('Membership').NextBillingDate),
    }
    const html = this.template(data)
    // console.log(html)
    this.$el.append(html)

    this.promoCode.render()
    this.hideFooter()

    return this
  }

  confirmUpgrade() {
    console.log('SwitchToAnnualPlan confirmUpgrade')
    this.loadingStart()
    this.model.confirmUpgrade()
  }

  submitButtonDisplay(model, value, options) {
    if (value) {
      this.enableSubmit()
    } else {
      this.disableSubmit()
    }
  }

  enableSubmit() {
    console.log('SwitchToAnnualPlan enabledSubmit')
    this.$el.find('.confirm-upgrade').prop('disabled', false)
  }

  disableSubmit() {
    console.log('SwitchToAnnualPlan disableSubmit')
    this.$el.find('.confirm-upgrade').prop('disabled', true)
  }

  showFooter() {
    $('footer').show()
  }

  hideFooter() {
    $('footer').hide()
  }

  loadingStart() {
    this.disableSubmit()
    this.submitLoader.loadingStart(this.$el.find('.confirm-upgrade'))
  }

  loadingStop() {
    this.enableSubmit()
    this.submitLoader.loadingStop(this.$el.find('.confirm-upgrade'))
  }

  getLocalizedDate(mmddyy) {
    const mmddyyObj = Date.parse(mmddyy)
    const d = new Date(0)
    d.setUTCMilliseconds(mmddyyObj)
    return new Intl.DateTimeFormat(
      `${this.model.get('stripePlansLang')}-${this.model.get('stripePlansCountry')}`,
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      },
    ).format(d) // this.model.formatDate(d)
  }
}

export default SwitchToAnnualPlan
