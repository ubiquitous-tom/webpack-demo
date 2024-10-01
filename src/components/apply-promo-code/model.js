import { Model } from 'backbone'
import _ from 'underscore'

import StripePlans from 'core/models/stripe-plans'

class ApplyPromoCodeModel extends Model {
  get url() {
    const env = this.environment()
    return `https://${env}api.rlje.net/acorn/promo`
  }

  initialize() {
    console.log('ApplyPromoCodeModel initialize')
    this.model = new Model()
    this.stripePlans = new StripePlans()
    this.stripePlans.on('change:stripePlans', (model, value) => {
      console.log(model, value)
      this.set({
        stripePlans: value,
        stripePlansCountry: model.get('stripePlansCountry'),
        stripePlansLang: model.get('stripePlansLang'),
      })
      // debugger
    })

    this.stripePlans.on('change:annualStripePlan', (model, value) => {
      console.log(model, value)
      this.set('annualStripePlan', value)
      // debugger
    })

    this.stripePlans.on('change:monthlyStripePlan', (model, value) => {
      console.log(model, value)
      this.set('monthlyStripePlan', value)
      // debugger
      // this.getTrialEndDate()
    })
  }

  /* eslint consistent-return: 0 */
  /* eslint no-unused-vars: 0 */
  validate(attrs, options) {
    if (_.isEmpty(attrs.PromoCode.Code)) {
      console.log('Please make sure there are no illegal characters (including spaces) in the promo code.')
      return 'CHCK-PROMO-CODE' // translation key
    }

    const regexp = /^[a-zA-Z0-9-_]+$/
    if (attrs.PromoCode.Code.search(regexp) === -1) {
      console.log('Only Alphanumeric characters. Space is not allowed.')
      return 'ALPHANUMERIC-ONLY-ERROR' // translation key
    }
  }

  parse(response) {
    console.log('ApplyPromoCodeModel parse')
    console.log(response)
    return response
  }

  applyCode(code, sessionID) {
    console.log('ApplyPromoCodeModel applyCode')
    console.log(this)
    const attributes = {
      Session: {
        SessionID: sessionID,
      },
      PromoCode: {
        Code: code,
      },
    }
    const options = {
      dataType: 'json',
      ajaxSync: true,
      wait: true,
      success: this.success,
      error: this.error,
    }
    console.log(attributes, options)
    this.save(attributes, options)
  }

  success(model, resp, options) {
    console.log('ApplyPromoCodeModel success')
    console.log(model, resp, options)

    const code = model.get('promoCode') || ''
    const message = `Promo ${code} applied!`
    model.set({
      applyPromoCodeResult: true,
      type: 'success',
      message,
    })
  }

  error(model, resp, options) {
    console.log('ApplyPromoCodeModel error')
    console.log(model, resp, options)
    /* eslint function-paren-newline: 0 */
    resp
      .then(
        (response) => {
          console.log(response.responseJSON)
          if (!_.isEmpty(response.responseJSON)) {
            model.set({
              applyPromoCodeResult: false,
              type: 'error',
              message: model.getPromoMessageError(response.responseJSON.message),
            })
          }
        },
        (error) => {
          console.log(error.responseJSON)
          if (!_.isEmpty(error.responseJSON)) {
            model.set({
              applyPromoCodeResult: false,
              type: 'error',
              message: model.getPromoMessageError(error.responseJSON.error),
            })
          }
        })
  }

  getPromoMessageError(error) {
    let message = error
    if (this.hasText(message, [
      'Customer Country restriction',
      'Invalid Promo Code for customer country',
      'Invalid customer country',
    ])) {
      message = 'Promo not valid in your country'
    }
    if (this.hasText(message, [
      'Customer Segment restriction',
      'Invalid customer segment',
    ])) {
      message = 'Promo is not valid for your subscription status'
    }
    if (this.hasText(message, [
      'Invalid plan term',
      'PlanTermRequirement',
    ])) {
      message = 'Promo is not valid for current plan'
    }
    return message
  }

  hasText(content, substrings) {
    if (typeof substrings === 'string') {
      return content.includes(substrings)
    } if (Array.isArray(substrings)) {
      return substrings.some((substring) => content.includes(substring))
    }
    return false
  }

  environment() {
    let env = ''
    if (window.location.hostname.indexOf('dev') > -1) {
      env = 'dev-'
    }
    if (window.location.hostname.indexOf('qa') > -1) {
      env = 'qa-'
    }
    if (process.env.NODE_ENV === 'development') {
      env = process.env.RLJE_API_ENVIRONMENT
    }
    // console.log(env)
    return env
  }
}

export default ApplyPromoCodeModel
