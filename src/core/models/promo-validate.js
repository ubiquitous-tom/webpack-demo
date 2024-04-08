import { Model } from 'backbone'
import _ from 'underscore'

class PromoValidateModel extends Model {
  get url() {
    const env = this.environment()
    return `https://${env}api.rlje.net/acorn/promo/validate`
  }

  initialize() {
    console.log('PromoValidateModel initialize')
    console.log(this)
  }

  parse(resp) {
    console.log('PromoValidateModel parse')
    console.log(resp)
  }

  /* eslint consistent-return: 0 */
  validate(attributes, options) {
    console.log('PromoValidateModel validate')
    console.log(attributes, options)

    if (_.isEmpty(attributes.promoCode)) {
      console.log('please enter promo code')
      return 'please enter promo code'
    }
  }

  submit(data) {
    console.log('PromoValidateModel submit')
    // const { PlanID } = data
    // this.set({
    //   currentPlanID: PlanID,
    // })

    const options = {
      url: [this.url, $.param(data)].join('?'),
      context: this,
      dataType: 'json',
      ajaxSync: true,
      wait: true,
      success: this.success,
      error: this.error,
    }
    console.log(options)
    this.fetch(options)
  }

  success(model, resp, options) {
    console.log('PromoValidateModel success')
    console.log(model, resp, options)
    console.log(this)
    debugger
    this.set({ promo: resp }, { silent: true })
    this.set({
      promoCodeSuccess: true,
      // promo: resp,
      promoCode: resp.PromotionCode,
      promoName: resp.Name,
      promoAppliedAmount: resp.StripePercentOff,
      flashMessage: {
        type: 'success',
        // message: `PROMO APPLIED - ${resp.Name}`,
        // message: 'PROMO-APPLIED-OFF',
        // message: `${resp.PromotionCode} applied. Enjoy your ${resp.StripePercentOff}% off!`,
        message: this.promoMessageParser(),
        interpolationOptions: {
          promoCode: resp.Name,
        },
      },
    })
  }

  error(model, resp, options) {
    console.log('PromoValidateModel error')
    console.log(model, resp, options)
    console.log(this)
    // debugger
    let message = 'PROMOCODE-ERROR'
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
        // New Error handing for the update promocode of 2024. [DWT1-932]
        if (_.isObject(message)) {
          message = Object.values(message)
        }
        model.set({
          promoCodeSuccess: false,
          flashMessage: {
            type: 'error',
            message,
            interpolationOptions: {},
          },
        })
        console.log(model.get('flashMessage').message, model.get('flashMessage').type)
      })
  }

  promoMessageParser() {
    // 3 types of promo code duration
    // - forever (through the life time of the subscription)
    // - repeating (usually each specified duration of the provided month(s))
    // - once of `empty` (one time thing. usually a gift code)
    const promo = this.get('promo') || this.get('membershipPromo')
    const type = (this.get('currentPlanID') === this.get('monthlyStripePlan').PlanID)
      ? 'monthly'
      : 'annual'
    // debugger
    const promoCode = promo.PromotionCode
    let promoDuration = ''
    if (promo.StripeDuration && (type === 'monthly')) {
      if (promo.StripeDuration === 'repeating' || promo.StripeDuration === 'once') {
        if (promo.StripeDurationInMonths) {
          const months = (promo.StripeDurationInMonths > 1) ? 'months' : 'month'
          promoDuration = ` for ${promo.StripeDurationInMonths} ${months}`
        }
      }
    }

    // 3 types of promo code
    // - gift code (free annual subscription code)
    // - percentage off code
    // - fixed amount off code
    let promoMessage = ''
    if (promo.StripePercentOff) {
      promoMessage = `Enjoy your ${promo.StripePercentOff}% off${promoDuration}!`
    }
    if (promo.StripeAmountOff) {
      const { CurrSymbol } = this.get('gifting').get('gift')
      promoMessage = `Enjoy your ${CurrSymbol}${promo.StripeAmountOff} off${promoDuration}`
    }

    return `${promoCode} applied. ${promoMessage}`
  }

  environment() {
    let env = ''
    if (window.location.hostname.indexOf('dev') > -1) {
      env = 'dev3-'
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

export default PromoValidateModel
