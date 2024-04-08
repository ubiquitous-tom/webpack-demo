import { View } from 'backbone'
import Promo from 'shared/elements/promo'
import SubmitLoader from 'shared/elements/submit-loader/view'
import FlashMessage from 'shared/elements/flash-message'
import PromoValidateModel from 'core/models/promo-validate'
// import ATVView from 'core/view'
import template from './index.hbs'
import ApplyPromoCodeModel from './model'

class ApplyPromoCode extends View {
  get el() {
    return 'section.account-wrap'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'input #EnterPromoCode': 'validatePromoCode',
      'submit #applyCodeForm': 'applyCode',
    }
  }

  initialize(options) {
    console.log('ApplyPromoCode initialize')
    this.sessionID = options.model.attributes.Session.SessionID
    this.i18n = options.i18n

    this.submitLoader = new SubmitLoader()
    this.flashMessage = new FlashMessage()
    this.applyPromoCodeModel = new ApplyPromoCodeModel(this.model.attributes)
    this.model = new PromoValidateModel(this.applyPromoCodeModel.attributes)
    this.promoView = new Promo({ i18n: options.i18n })
    this.promoView.getPresetOptions()

    this.render()

    this.listenTo(this.applyPromoCodeModel, 'change:stripePlans', (model, value) => {
      console.log(model, value)
      // debugger
      this.model.set({
        stripePlans: value,
        stripePlansCountry: model.get('stripePlansCountry'),
        stripePlansLang: model.get('stripePlansLang'),
      })
    })

    this.listenTo(this.applyPromoCodeModel, 'change:annualStripePlan', (model, value) => {
      console.log(model, value)
      // debugger
      this.model.set('annualStripePlan', value)
    })

    this.listenTo(this.applyPromoCodeModel, 'change:monthlyStripePlan', (model, value) => {
      console.log(model, value)
      // debugger
      this.model.set('monthlyStripePlan', value)
      // Enable button to allowed the form to be used and submitted
      this.$('button').prop('disabled', false)

      this.setPresetOptions()
    })

    this.listenTo(this.model, 'invalid', (model, error, options) => {
      console.log(model, error, options)
      const message = this.i18n.t(error)
      debugger
      this.flashMessage.onFlashMessageShow(message, 'error')
      this.loadingStop(model, error, options)
    })

    /* eslint no-shadow: 0 */
    // this.listenTo(this.model, 'change:applyPromoCodeSuccess', (model, value, options) => {
    //   console.log(model, value, options)
    //   let message
    //   if (value) {
    //     message = this.i18n.t('PROMOTION-APPLIED')
    //   } else {
    //     message = this.i18n.t('ERR-PROCESS-REQUEST')
    //     if (model.get('message').indexOf('Your code is invalid') !== -1) {
    //       message = this.i18n.t('CODE-INVALID')
    //     }
    //     if (model.get('message').indexOf('Promo code is expired') !== -1) {
    //       message = this.i18n.t('REDEEM-GIFT-NOT-AVAILABLE')
    //     }
    //     if (model.get('message').indexOf('Promo code not found') !== -1) {
    //       message = this.i18n.t('REDEEM-GIFT-NOT-AVAILABLE')
    //     }
    //   }
    //   // debugger
    //   this.flashMessage.onFlashMessageShow(message, model.get('type'))
    //   this.loadingStop(model, value, options)
    // })

    this.listenTo(this.model, 'change:promoCodeSuccess', (model, value) => {
      console.log(model, value)
      // debugger
      model.unset('promoCodeSuccess', { silent: true })
      this.flashMessage.onFlashMessageShow(model.get('flashMessage').message, model.get('flashMessage').type)
      this.loadingStop(model, value, options)
    })

    // this.listenTo(this.model, 'error', (model, xhr, options) => {
    //   console.log(model, xhr, options)
    //   const message = this.i18n.t('ERROR')
    //   debugger
    //   this.flashMessage.onFlashMessageShow(message, 'error')
    //   this.loadingStop(model, xhr, options)
    // })
  }

  render() {
    console.log('ApplyPromoCode render')
    this.$el.html(this.template())

    return this
  }

  validatePromoCode(e) {
    console.log('ApplyPromoCode validatePromoCode')
    this.toUpperCase(e)

    // Reset errors.
    e.target.parentElement.classList.remove('has-error')
    e.target.setCustomValidity('')

    // Check for errors.
    if (e.target.validity.valueMissing) {
      e.target.parentElement.classList.add('has-error')
      e.target.setCustomValidity(this.i18n.t('CHCK-PROMO-CODE'))
    }
    if (e.target.validity.patternMismatch) {
      e.target.parentElement.classList.add('has-error')
      e.target.setCustomValidity(this.i18n.t('ALPHANUMERIC-ONLY-ERROR'))
    }
  }

  toUpperCase(e) {
    const input = e.target.value.toUpperCase()
    this.$el.find(e.currentTarget).val(input)
  }

  applyCode(e) {
    e.preventDefault()
    console.log('ApplyPromoCode applyCode')
    // const code = e.target[0].value
    this.loadingStart()
    const subscription = (this.model.has('Subscription') && this.model.get('Subscription'))
    const membershipType = (subscription.Monthly) ? 'monthly' : 'annual'
    const data = {
      Code: e.target[0].value,
      Country: this.model.get('stripePlansCountry'),
      CustomerID: (this.model.has('Customer') && this.model.get('Customer').CustomerID) || '',
      PlanID: this.model.get(`${membershipType}StripePlan`).PlanID,
    }
    console.log(data)
    // debugger
    this.model.submit(data)
    // this.model.applyCode(code, this.sessionID)
  }

  loadingStart() {
    console.log('ApplyPromoCode loadingStart')
    this.$el.find('#applyCodeForm input').prop('disabled', true)
    this.submitLoader.loadingStart(this.$el.find('#applyCodeForm button'))
  }

  loadingStop(model, value, options) {
    console.log('ApplyPromoCode loadingStop')
    console.log(model, value, options)
    console.log(this)
    this.$el.find('#applyCodeForm input').val('').prop('disabled', false)
    this.submitLoader.loadingStop(this.$el.find('#applyCodeForm button'))
  }

  setPresetOptions() {
    console.log(sessionStorage.getItem('acorntv_st_pmc'))
    if (sessionStorage.getItem('acorntv_st_pmc')) {
      // debugger
      this
        .$('#applyCodeForm #EnterPromoCode')
        .val(sessionStorage.getItem('acorntv_st_pmc'))
      this
        .$('#applyCodeForm button')
        .click()

      this.promoView.removePresetOptions()
    }
  }
}

export default ApplyPromoCode
