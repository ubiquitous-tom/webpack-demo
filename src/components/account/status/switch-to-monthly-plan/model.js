import _ from 'underscore'
import ATVModel from 'core/model'
import PlansChange from 'core/models/plans-change'

class SwitchToMonthlyPlanModel extends ATVModel {
  initialize() {
    console.log('SwitchToMonthlyPlanModel initialize')
    console.log(this)

    this.getAnnualToMonthlyDowngradeInfo()
  }

  getAnnualToMonthlyDowngradeInfo() {
    console.log('SwitchToMonthlyPlanModel getAnnualToMonthlyDowngradeInfo')
    const countryCode = this.get('BillingAddress').StripeCountryCode || this.get('BillingAddress').Country
    const type = 'downgrade'
    const fromFrequency = 'annual'
    const toFrequency = 'monthly'
    const plansAvailable = this.get('plansAvailable')
    // console.log(plansAvailable)
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
          this.set('currentDowngradePlan', plan)
          console.log(this)

          return plan
        }
      }
      return collection
    })
  }

  switchToMonthly() {
    console.log('SwitchToMonthlyPlanModel switchToMonthly')
    const plansChange = new PlansChange()
    const headers = {
      StripeMembershipID: this.get('currentMembership').StripeMembershipID,
      CustomerID: this.get('currentMembership').CustomerID,
      StripeCardToken: this.has('currentBillingInfo').StripeCardToken
        ? this.get('currentBillingInfo').StripeCardToken
        : '',
    }

    const attributes = {
      from: this.get('currentDowngradePlan').from_stripe_plan_id,
      to: this.get('currentDowngradePlan').to_stripe_plan_id,
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
    console.log('SwitchToMonthlyPlanModel success')
    console.log(this)
    debugger
    console.log(model, resp, options)
    const currentPeriodEnd = new Date(resp.current_period_end * 1000)
      .toLocaleDateString(
        `${this.model.get('stripePlansLang')}-${this.model.get('stripePlansCountry')}`,
        {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        },
      )
    // const message = `
    // You've switched to Monthly Plan. Monthly billing will start after your Annual Plan ends on
    //  ${currentPeriodEnd}.
    // `
    this.set({
      downgradeToMonthlySuccess: true,
      flashMessage: {
        type: 'success',
        message: 'SWITCHED-TO-MONTHLY-DATE',
        interpolationOptions: {
          currentPeriodEnd,
        },
      },
    })
  }

  error(model, resp, options) {
    console.log('SwitchToMonthlyPlanModel error')
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
            message = error.responseText
            return message
          }
          return message
        })
      .always(() => {
        options.context.set({
          downgradeToMonthlySuccess: false,
          flashMessage: {
            type: 'error',
            message,
            interpolationOptions: {},
          },
        })
        console.log(this.get('flashMessage').message, this.get('flashMessage').type)
      })
  }
}

export default SwitchToMonthlyPlanModel
