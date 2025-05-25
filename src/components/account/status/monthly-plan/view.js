import { View } from 'backbone'
// import _ from 'underscore'
// import Handlebars from 'handlebars'
import FlashMessage from 'shared/elements/flash-message'
import Promo from 'shared/elements/promo'

import './stylesheet.scss'
import placeholder from './placeholder.hbs'
import template from './index.hbs'
import MonthlyPlanModel from './model'
import SwitchToAnnualPlan from '../switch-to-annual-plan'
// import AccountStatusModel from '../model'

class MonthlyPlan extends View {
  get el() {
    return '.current-plan'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'click .switch-to-annual': 'switchToAnnual',
    }
  }

  initialize(options) {
    console.log('MonthlyPlan initialize')
    console.log(this, options)
    this.i18n = options.i18n
    this.model = new MonthlyPlanModel(this.model.attributes)
    this.promoView = new Promo({ i18n: options.i18n })
    // this.getRenewalDate()
    console.log(this)

    if (this.model.has('annualStripePlan')) {
      this.render()
    } else {
      this.contentPlaceholder()
    }

    // this.listenTo(this.model, 'change:annualStripePlan', (model, value) => {
    //   console.log('MonthlyPlan initialize')
    //   console.log(model, value)
    //   debugger
    //   this.render()
    // })
    this.listenTo(this.model, 'change:monthlyStripePlan', this.render)
  }

  render() {
    console.log('MonthlyPlan render')
    // const template = Handlebars.compile(this.template())
    // console.log(template)
    const data = {
      renewalDate: this.getRenewalDate(),
      currSymbol: this.model.get('monthlyStripePlan').CurrSymbol,
      subscriptionAmount: this.getCurrentNetAmount(),
      annualSubscriptionAmount: this.model.get('annualStripePlan').SubscriptionAmount,
      tagline: this.getTagline(),
      // TODO: `isUpgradeAllowed` for initial launch. Remove in phase 2.
      isTigo: (this.model.get('Membership').Store === 'Tigo'),
      isUpgradeAllowed: (this.model.get('Membership').Store !== 'Tigo') && this.model.get('Customer').StripeEnabled,
    }
    const html = this.template(data)
    this.$el.html(html)
    // this.$el.html(this.template)

    this.setPresetOptions()

    // this.specialOfferQ12025()

    return this
  }

  contentPlaceholder() {
    this.$el.html(placeholder)
  }

  switchToAnnual(e) {
    e.preventDefault()
    console.log('switch to annual plan')
    // console.log(this.switchToAnnualPlan)
    this.switchToAnnualPlan = new SwitchToAnnualPlan({
      monthlyPlan: this.model,
      i18n: this.i18n,
    })
    // this.switchToAnnualPlan.render()
  }

  getRenewalDate() {
    return this.model.getRenewalDate()
  }

  getCurrentNetAmount() {
    if (this.model.get('Membership').NetAmount) {
      return this.model.get('Membership').NetAmount
    }
    if (this.model.get('Membership').NextBillingAmount) {
      return this.model.get('Membership').NextBillingAmount
    }
    return this.model.get('Membership').SubscriptionAmount
    // return this.model.get('Membership').NetAmount
    //   ? this.model.get('Membership').NetAmount
    //   : this.model.get('Membership').NextBillingAmount
    //     ? this.model.get('Membership').NextBillingAmount
    //     : this.model.get('Membership').SubscriptionAmount
  }

  getTagline() {
    const taglines = []
    if (this.model.get('Subscription').Promo) {
      taglines.push(this.getPromoCodeInfo())
    }

    if (this.model.get('Subscription').Trial) {
      taglines.push(this.getTrialInfo())
    }

    return taglines.join('<br>')
  }

  getPromoCodeInfo() {
    // return `with promo code - ${this.model.get('Membership').PromoCode}`
    return this.i18n.t('WITH-PROMO-CODE-OFF', { promoCode: this.model.get('Membership').PromoCode })
  }

  getTrialInfo() {
    // const message = `Your free trial starts now and ends on ${this.getTrialEndDate()}`
    const message = this.i18n.t('FREE-TRIAL-START-NOW-DATE', {
      trialEndDate: this.getTrialEndDate(), // this.model.get('Membership').NextBillingDate,
    })
    const type = 'success'

    this.flashMessage = new FlashMessage()
    this.flashMessage.onFlashMessageShow(message, type)

    // return 'after your free trial ends.'
    return this.i18n.t('AFTER-FREE-TRIAL-ENDS')
  }

  getTrialEndDate() {
    const trialDays = this.model.get('monthlyStripePlan').TrialDays
    const joinDate = this.model.get('Customer').JoinDate
    // const date = joinDate.split('/')
    const f = new Date(joinDate) // new Date(date[2], date[0] - 1, date[1])
    // console.log(joinDate)
    // console.log(f.toString())
    const trialEndDate = f.setDate(f.getDate() + trialDays)
    // console.log(trialEndDate)

    const d = new Date(0)
    d.setUTCMilliseconds(trialEndDate)
    console.log(d)
    const trialEnddateOjb = new Intl.DateTimeFormat(
      `${this.model.get('stripePlansLang')}-${this.model.get('stripePlansCountry')}`,
      {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      },
    ).format(d) // this.model.formatDate(d)
    // console.log(trialEnddateOjb)
    // this.set('trialEndDate', trialEnddateOjb)
    return trialEnddateOjb
  }

  setPresetOptions() {
    console.log(sessionStorage.getItem('acorntv_st_pmt'))
    if (
      sessionStorage.getItem('acorntv_st_pmt')
      && sessionStorage.getItem('acorntv_st_pmt').toLowerCase() === 'upgrade'
    ) {
      // debugger
      this
        .$('.upgrade-to-annual button')
        .click()
    }
  }

  specialOfferQ12025() {
    if (!this.model.get('Subscription').Trial) {
      if (!this.model.get('Subscription').Gift) {
        let promoCode = ''
        let offerMonthlyAmount = 0
        switch (this.model.get('stripePlansCountry')) {
          case 'US':
            promoCode = 'TENOFF25'
            offerMonthlyAmount = 7
            break
          case 'CA':
            promoCode = 'TENOFF2025'
            offerMonthlyAmount = 9
            break
          default:
            promoCode = ''
            offerMonthlyAmount = 0
        }
        if (promoCode) {
          const currSymbol = this.model.get('monthlyStripePlan').CurrSymbol
          const offerAnnualAmount = this.model.get('annualStripePlan').SubscriptionAmount - 10
          const offerHeader = `Limited - Time Offer Less than ${currSymbol}${offerMonthlyAmount}/month When You Upgrade to Annual & Prepay for a Year`
          const specialOfferText = `Use promo code ${promoCode} and upgrade for just ${currSymbol}${offerAnnualAmount}`
          const offerSpan = $('<span />')
            .addClass('limited-time-offer-2025')
            .text(specialOfferText)

          this.$el.find('.upgrade-to-annual h2').text(offerHeader)
          this.$el.find('.promo-code-label').before(offerSpan)
        }
      }
    }
  }
}

export default MonthlyPlan
