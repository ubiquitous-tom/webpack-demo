import _ from 'underscore'
import PlansChange from 'core/models/plans-change'
import ATVModel from 'core/model'

class SwitchToAnnualPlanModel extends ATVModel {
  get defaults() {
    return {
      isPromoApplied: false,
    }
  }

  initialize() {
    console.log('SwitchToAnnualPlanModel initialize')
    console.log(this)

    this.getMonthlyToAnnualUpgradeInfo()
  }

  getMonthlyToAnnualUpgradeInfo() {
    console.log('SwitchToAnnualPlanModel getMonthlyToAnnualUpgrade')
    const countryCode = this.get('BillingAddress').StripeCountryCode || this.get('BillingAddress').Country
    const currentStripePlanID = this.get('currentMembership').StripePlanID || false
    const type = 'upgrade'
    const fromFrequency = 'monthly'
    const toFrequency = 'annual'
    const plansAvailable = this.get('plansAvailable')
    if (currentStripePlanID) {
      _.each(plansAvailable, (plan, key, collection) => {
        // console.log(plan.type)
        if (plan.type === type) {
          // console.log(plan.from_frequency, plan.to_frequency)
          if (
            plan.from_stripe_plan_id === currentStripePlanID
            && plan.to_frequency === toFrequency
            && plan.country_code === countryCode
          ) {
            console.log(plan)
            this.set('currentUpgradePlan', plan)
            console.log(this)

            return plan
          }
        }
        return collection
      })
    } else {
      _.each(plansAvailable, (plan, key, collection) => {
        // console.log(plan.type)
        if (plan.type === type) {
          // console.log(plan.from_frequency, plan.to_frequency)
          if (
            plan.from_frequency === fromFrequency
            && plan.to_frequency === toFrequency
            && plan.country_code === countryCode
          ) {
            console.log(plan)
            this.set('currentUpgradePlan', plan)
            console.log(this)

            return plan
          }
        }
        return collection
      })
    }
  }

  confirmUpgrade() {
    console.log('SwitchToAnnualPlanModel confirmUpgrade')
    this.loadingStart()
    const plansChange = new PlansChange()
    const headers = {
      StripeMembershipID: this.get('currentMembership').StripeMembershipID,
      CustomerID: this.get('currentMembership').CustomerID,
      StripeCardToken: '', // Because we now update the card beforehand so this has to be an empty string (WWW-2549).
    }

    const attributes = {
      from: this.get('currentUpgradePlan').from_stripe_plan_id,
      to: this.get('currentUpgradePlan').to_stripe_plan_id,
      promo_code: this.has('promoCode') ? this.get('promoCode') : '',
    }
    const options = {
      url: [plansChange.url, $.param(attributes)].join('?'),
      context: this,
      dataType: 'json',
      ajaxSync: true,
      wait: true,
      headers,
      success: this.success,
      error: this.error,
    }
    console.log(attributes, options)
    plansChange.save(attributes, options)
  }

  success(model, resp, options) {
    console.log('SwitchToAnnualPlanModel success')
    console.log(model, resp, options)
    debugger
    const annualPricing = this.get('annualStripePlan').CurrSymbol + this.get('annualStripePlan').SubscriptionAmount
    const currentPeriodEnd = new Date(resp.current_period_end * 1000)
      .toLocaleDateString(
        `${this.get('stripePlansLang')}-${this.get('stripePlansCountry')}`,
        {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        },
      )
    const pricing = (Math.floor((this.get('annualStripePlan').SubscriptionAmount / 12) * 100) / 100).toFixed(2)
    const perMonthPricing = this.get('annualStripePlan').CurrSymbol + pricing
    this.set({
      upgradeToAnnualWithPromoCode: model.has('promoCode'),
    })
    // const message = `
    // You've upgraded to the Annual Plan. You will be billed ${annualPricing}
    //  on ${currentPeriodEnd}.
    //  That's only ${perMonthPricing}/mo!
    // `
    this.set({
      upgradeToAnnualSuccess: true,
      flashMessage: {
        type: 'success',
        message: 'UPGRADED-TO-ANNUAL-BILLED-DATE-PRICE',
        interpolationOptions: {
          annualPricing,
          currentPeriodEnd,
          perMonthPricing,
        },
      },
    })
  }

  error(model, resp, options) {
    console.log('SwitchToAnnualPlanModel error')
    console.log(model, resp, options)
    debugger
    let message = ''
    /* eslint function-paren-newline: 0 */
    resp
      .then(
        (response) => {
          console.log(response.responseJSON, response.responseText)
          if (!_.isEmpty(response.responseJSON)) {
            message = response.responseJSON.message
            return message
          }
          if (!_.isEmpty(response.responseText)) {
            message = response.responseText
            return message
          }
          return message
        },
        (error) => {
          console.log(error.responseJSON, error.responseText)
          if (!_.isEmpty(error.responseJSON)) {
            message = error.responseJSON.error
            return message
          }
          if (!_.isEmpty(error.responseText)) {
            // TODO: Remove in phase 2. Update to use error message from Stripe API.
            message = 'Sorry, we are unable to process your payment right now. Please contact support@acorn.tv for help.'
            // message = error.statusText
            return message
          }
          return message
        })
      .always(() => {
        options.context.set({
          upgradeToAnnualWithPromoCode: model.has('promoCode'),
        })
        options.context.set({
          upgradeToAnnualSuccess: false,
          flashMessage: {
            type: 'error',
            message,
            interpolationOptions: {},
          },
        })
        console.log(model.get('flashMessage').message, model.get('flashMessage').type)
      })
  }

  loadingStart() {
    console.log('ApplyPromoCodeModel loadingStart')
  }

  loadingStop() {
    console.log('ApplyPromoCodeModel loadingStop')
  }
}

export default SwitchToAnnualPlanModel
