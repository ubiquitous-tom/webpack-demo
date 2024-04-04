import { View } from 'backbone'
// import _ from 'underscore'
// import Handlebars from 'handlebars'
import FlashMessage from 'shared/elements/flash-message'
import SwitchToMonthlyPlan from '../switch-to-monthly-plan'

import './stylesheet.scss'
import placeholder from './placeholder.hbs'
import template from './index.hbs'
import AnnualPlanModel from './model'

class AnnualPlan extends View {
  get el() {
    return '.current-plan'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'click .switch-to-monthly': 'switchToMonthly',
    }
  }

  initialize(options) {
    console.log('AnnualPlan initialize')
    console.log(this)
    this.i18n = options.i18n
    this.model = new AnnualPlanModel(this.model.attributes)
    // console.log(this.model)
    // console.log(this.model.attributes)
    if (this.model.has('monthlyStripePlan')) {
      this.render()
    } else {
      this.contentPlaceholder()
    }

    this.listenTo(this.model, 'change:monthlyStripePlan', () => {
      this.model.annualPerMonthPricing()
      this.render()
    })
  }

  render() {
    console.log('AnnualPlan render')
    // const template = Handlebars.compile(this.template())
    console.log(this.model.attributes)
    const data = {
      renewalDate: this.getRenewalDate(),
      currSymbol: this.model.get('annualStripePlan').CurrSymbol,
      subscriptionAmount: this.getCurrentNetAmount(),
      annualPerMonthPricing: this.model.get('annualPerMonthPricing'),
      monthlySubscriptionAmount: this.model.get('monthlyStripePlan').SubscriptionAmount,
      tagline: this.getTagline(),
      annualPlanMessage: this.getAnnualPlanMessage(),
    }
    const html = this.template(data)
    // console.log(html)
    // console.log(this.$el.find('.current-plan'))
    // this.$el.find('.current-plan').html(html)

    this.$el.html(html)
    // this.$el.html(this.template(this.model.attributes))
    return this
  }

  contentPlaceholder() {
    console.log('AnnualPlan contentPlaceholder')
    this.$el.find('.current-plan').html(placeholder)
  }

  getAnnualPlanMessage() {
    if (this.isGift()) {
      return this.i18n.t('ANNUAL-PLAN-GIFT-ENDS-ON-DATE', { endDate: this.model.get('Membership').ExpirationDate })
    }
    return this.i18n.t('ANNUAL-PLAN-RENEWS-ON-DATE-PRICE', {
      renewalDate: this.getRenewalDate(),
      currSymbol: this.model.get('annualStripePlan').CurrSymbol,
      subscriptionAmount: this.getCurrentNetAmount(),
    })
  }

  isGift() {
    return this.model.get('Subscription').Gift
  }

  switchToMonthly(e) {
    e.preventDefault()
    console.log('AnnualPlan switchToMonthly')
    // console.log(this.switchToMonthlyPlan)
    this.switchToMonthlyPlan = new SwitchToMonthlyPlan({ model: this.model, i18n: this.i18n })
    this.switchToMonthlyPlan.render()
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
    //     : this.getCurrentNetAmount()
  }

  getTagline() {
    let isPromoApplied = false
    const taglines = []
    if (this.model.get('Subscription').Promo) {
      isPromoApplied = true
      taglines.push(this.getPromoCodeInfo())
    }

    if (this.model.get('Subscription').Trial) {
      taglines.push(this.getTrialInfo())
    }

    if (!isPromoApplied) {
      taglines.push(this.getAnnualDiscount())
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
      trialEndDate: this.model.get('Membership').NextBillingDate, // this.getTrialEndDate(),
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

  getAnnualDiscount() {
    // return `
    // That's only ${this.model.get('Customer').CurrSymbol}
    // ${this.model.get('annualPerMonthPricing')}/mo!
    // `
    return this.i18n.t('THATS-ONLY-PRICE', {
      currSymbol: this.model.get('annualStripePlan').CurrSymbol,
      amount: this.model.get('annualPerMonthPricing'),
    })
  }
}

export default AnnualPlan
