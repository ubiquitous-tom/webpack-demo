import { Model, wrapError } from 'backbone'
// import _ from 'underscore'

class StripeToken extends Model {
  get defaults() {
    return {
      amount: null,
    }
  }

  initialize() {
    // https://github.com/amccloud/backbone-stripe
    console.log('StripeToken initialize')
    // console.log(Stripe)
    this.api = Stripe
  }

  parse(resp) {
    resp.card.number = `••••••••••••${resp.card.last4}`

    return resp
  }

  validate(attrs) {
    if (attrs.card) {
      if (
        attrs.card.number
        && !attrs.card.last4
        && !this.api.validateCardNumber(attrs.card.number)
      ) {
        return 'Invalid card number'
      }

      if (
        attrs.card.exp_month
        && attrs.card.exp_year
        && !this.api.validateExpiry(attrs.card.exp_month.toString(), attrs.card.exp_year.toString())
      ) {
        return 'Invalid expiration.'
      }

      if (attrs.card.cvc && !this.api.validateCVC(attrs.card.cvc.toString())) return 'Invalid CVC'
    }
  }

  save(options) {
    options = options || {}

    if (!this.isValid()) {
      return false
    }

    options.error = wrapError(options.error, this, options)
    options.success = this.wrapSuccess(options.success, options)

    this.api.createToken(
      this.attributes.card,
      this.attributes.amount,
      options.success,
    )

    return true
  }

  fetch(options) {
    options = options || {}

    options.error = wrapError(options.error, this, options)
    options.success = this.wrapSuccess(options.success, options)

    return this.api.getToken(this.id, options.success)
  }

  wrapSuccess(onSuccess, options) {
    const model = this

    return function (status, resp) {
      if (status !== 200) {
        return options.error(model, resp)
      }

      const serverAttrs = model.parse(resp)

      if (!model.set(serverAttrs, options)) {
        return false
      }

      if (onSuccess) {
        onSuccess(model, resp, options)
      }

      model.trigger('sync', model, resp, options)
    }
  }
}

export default StripeToken
