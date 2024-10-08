import ATVModel from 'core/model'
import _ from 'underscore'

class PromoCodeModel extends ATVModel {
  get url() {
    const env = this.environment()
    return `https://${env}api.rlje.net/acorn/promo/validate`
  }

  initialize() {
    console.log('PromoCodeModel initialize')
  }

  parse(resp) {
    console.log('PromoCodeModel parse')
    console.log(resp)
  }

  /* eslint consistent-return: 0 */
  validate(attributes, options) {
    console.log('PromoCodeModel validate')
    console.log(attributes, options)

    if (_.isEmpty(attributes.sessionID)) {
      console.log('please enter session ID')
      return 'please enter session ID'
    }

    if (_.isEmpty(attributes.promoCode)) {
      console.log('please enter promo code')
      return 'please enter promo code'
    }
  }

  submit(promoCode) {
    console.log('PromoCodeModel submit')
    const options = {
      url: [this.url, $.param({ Code: promoCode })].join('?'),
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
    console.log('PromoCodeModel success')
    console.log(model, resp, options)
    console.log(this)
    debugger
    this.set({
      promoCodeSuccess: true,
      promoCode: resp.PromotionCode,
      promoAppliedAmount: resp.StripeAmountOff || resp.StripePercentOff,
      flashMessage: {
        type: 'success',
        // message: `PROMO APPLIED - ${resp.Name}`,
        message: 'PROMO-APPLIED-OFF',
        interpolationOptions: {
          promoCode: resp.Name,
        },
      },
    })
  }

  error(model, resp, options) {
    console.log('PromoCodeModel error')
    console.log(model, resp, options)
    console.log(this)
    debugger
    let message = ''
    /* eslint function-paren-newline: 0 */
    resp
      .then(
        (response) => {
          debugger
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
          debugger
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
        debugger
        model.set({
          promoCodeSuccess: false,
          flashMessage: {
            type: 'error',
            message: this.getPromoMessageError(message),
            interpolationOptions: {},
          },
        })
        console.log(model.get('flashMessage').message, model.get('flashMessage').type)
      })
  }

  environment() {
    const env = process.env.ENVIRONMENT || ''
    // console.log(env)
    return env
  }

  hasText(msg, text) {
    return JSON.stringify(msg).toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) !== -1
  }

  getPromoMessageError(error) {
    let message = error
    if (this.hasText(message, 'Invalid Promo Code for customer country') || this.hasText(message, 'Invalid customer country')) {
      message = 'Promo not valid in your country'
    }
    if (this.hasText(message, 'Invalid customer segment')) {
      message = 'Promo is not valid for your subscription status'
    }
    if (this.hasText(message, 'Invalid plan term') || this.hasText(message, 'PlanTermRequirement')) {
      message = 'Promo is not valid for selected plan'
    }
    return message
  }
}

export default PromoCodeModel
