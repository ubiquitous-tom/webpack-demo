import { Model } from 'backbone'
import _ from 'underscore'

class ApplyPromoCodeModel extends Model {
  get url() {
    return '/applypromo'
  }

  initialize() {
    console.log('ApplyPromoCodeModel initialize')
    this.model = new Model()
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

    const { message } = resp // Your Promotion Code has been applied!
    // If `TrialEnabled` is `false`, it is a gift code
    // Or
    // If `TrialEnabled` is `null` and the `MembershipTerm` is `12`
    // and `MembershipTermType` is`MONTH`, it is a gift code
    const promoMessagePrefix = 'Promo applied!'
    const promoMessageSuffix = 'Your account has been updated'
    model.set({
      applyPromoCodeSuccess: true,
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
              applyPromoCodeSuccess: false,
              type: 'error',
              message: response.responseJSON.message,
            })
          }
        },
        (error) => {
          console.log(error.responseJSON)
          if (!_.isEmpty(error.responseJSON)) {
            model.set({
              applyPromoCodeSuccess: false,
              type: 'error',
              message: error.responseJSON.error,
            })
          }
        })
  }
}

export default ApplyPromoCodeModel
