import { View } from 'backbone'
// import _ from 'underscore'
import SubmitLoader from 'shared/elements/submit-loader/view'
import FlashMessage from 'shared/elements/flash-message'
import template from './index.hbs'
import EditEmailModel from './model'

class EditEmail extends View {
  regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/

  get el() {
    return 'section.account-wrap'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'input #Email': 'validateEmail',
      'blur #Email': 'validateEmail',
      'input #ConfirmEmail': 'validateEmail', // 'validateConfirmEmail',
      'blur #ConfirmEmail': 'validateEmail', // 'validateConfirmEmail',
      'submit #changeEmailForm': 'verifySameEmail', // 'changeEmail'
    }
  }

  initialize(options) {
    console.log('EditEmail initialize')
    this.defaultEmail = options.model.attributes.Customer.Email
    this.i18n = options.i18n

    this.submitLoader = new SubmitLoader()
    this.flashMessage = new FlashMessage()
    this.model = new EditEmailModel()
    this.render()

    /* eslint no-shadow: 0 */
    /* eslint no-unused-vars: 0 */
    this.listenTo(this.model, 'change:editEmailSuccess', (model, value, options) => {
      console.log(model, value, options)
      let message = this.i18n.t('ERROR')
      if (value) {
        message = this.i18n.t('EMAIL-CHANGED')
      }
      debugger
      this.flashMessage.onFlashMessageShow(message, model.get('type'))
      this.loadingStop(model, value, options)
    })

    this.model.on('invalid', (model, error, options) => {
      console.log('EditEmail initialize on invalid')
      console.log(model, error, options)
      const message = this.i18n.t(error)
      debugger
      this.$el.find('#changeEmailForm .form-group').addClass('has-error')
      this.flashMessage.onFlashMessageShow(message, 'error')
      this.loadingStop(model, error, options)
    })

    this.listenTo(this.model, 'error', (model, xhr, options) => {
      console.log(model, xhr, options)
      const message = this.i18n.t('ERROR')
      debugger
      this.$el.find('#changeEmailForm .form-group').addClass('has-error')
      this.flashMessage.onFlashMessageShow(message, 'error')
      this.loadingStop(model, xhr, options)
    })
  }

  render() {
    console.log('EditEmail render')
    this.$el.html(this.template())

    return this
  }

  validateEmail(e) {
    // Reset errors.
    e.target.parentElement.classList.remove('has-error')
    e.target.setCustomValidity('')

    // Check for errors.
    if (e.target.validity.valueMissing) {
      e.target.parentElement.classList.add('has-error')
      e.target.setCustomValidity(this.i18n.t('EMAIL-IS-REQUIRED'))
    } else if (e.target.validity.typeMismatch) {
      e.target.parentElement.classList.add('has-error')
      e.target.setCustomValidity(this.i18n.t('ENTER-AN-EMAIL'))
    } else if (!this.regexEmail.test(e.target.value)) {
      e.target.parentElement.classList.add('has-error')
      e.target.setCustomValidity(this.i18n.t('INVALID-EMAIL-ERROR'))
    }
  }

  validateConfirmEmail(e) {
    // Reset errors.
    e.target.parentElement.classList.remove('has-error')
    e.target.setCustomValidity('')

    // Check for errors.
    if (e.target.validity.valueMissing) {
      e.target.parentElement.classList.add('has-error')
      e.target.setCustomValidity(this.i18n.t('EMAIL-IS-REQUIRED'))
    } else if (!this.regexEmail.test(e.target.value)) {
      e.target.parentElement.classList.add('has-error')
      e.target.setCustomValidity(this.i18n.t('INVALID-EMAIL-ERROR'))
    } else {
      if (e.target.validity.typeMismatch) {
        e.target.parentElement.classList.add('has-error')
        e.target.setCustomValidity(this.i18n.t('ENTER-AN-EMAIL'))
      }

      /* eslint eqeqeq: 0 */
      if (this.$el.find('#Password').val() != e.target.value) {
        this.$el.find('#Password')[0].setCustomValidity((this.i18n.t('EMAILS-DONT-MATCH')))
        this.$el.find('#Password')[0].parentElement.classList.add('has-error')
        e.target.setCustomValidity((this.i18n.t('EMAILS-DONT-MATCH')))
        e.target.parentElement.classList.add('has-error')
      }
    }
  }

  verifySameEmail(e) {
    e.preventDefault()
    // console.log(e)
    let password = ''
    let confirmPassword = ''
    $(e.target).find('input').each((index, element, collection) => {
      // console.log(index, element, collection)
      if (index === 0) {
        password = element
      }
      confirmPassword = element
    })
    // console.log(password, confirmPassword, password.value, confirmPassword.value)

    // Reset errors.
    password.parentElement.classList.remove('has-error')
    password.setCustomValidity('')
    confirmPassword.parentElement.classList.remove('has-error')
    confirmPassword.setCustomValidity('')

    if (password.value !== confirmPassword.value) {
      password.setCustomValidity((this.i18n.t('EMAILS-DONT-MATCH')))
      password.parentElement.classList.add('has-error')
      confirmPassword.setCustomValidity((this.i18n.t('EMAILS-DONT-MATCH')))
      confirmPassword.parentElement.classList.add('has-error')
    } else {
      this.changeEmail(e)
    }
  }

  changeEmail(e) {
    e.preventDefault()
    console.log('EditEmail changeEmail')
    const params = $(e.currentTarget).serializeArray()
    this.loadingStart()
    this.model.changeEmail(params, this.defaultEmail)
  }

  loadingStart() {
    this.$el.find('#changeEmailForm input').prop('disabled', true)
    this.submitLoader.loadingStart(this.$el.find('#changeEmailForm button'))
  }

  loadingStop(model, value, options) {
    console.log(model, value, options)
    console.log(this)
    this.$el.find('#changeEmailForm input').val('').prop('disabled', false)
    this.submitLoader.loadingStop(this.$el.find('#changeEmailForm button'))
  }
}

export default EditEmail
