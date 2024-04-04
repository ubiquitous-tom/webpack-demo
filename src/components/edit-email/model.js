import { Model } from 'backbone'
import _ from 'underscore'

class EditEmailModel extends Model {
  get url() {
    return '/changeemail'
  }

  initialize() {
    console.log('EditEmailModel initialize')
    this.model = new Model()
  }

  /* eslint consistent-return: 0 */
  /* eslint no-unused-vars: 0 */
  validate(attrs, options) {
    const regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    console.log('EditEmailModel validate')
    console.log(attrs)
    // console.log(options)

    if (_.isEmpty(attrs.NewEmail)) {
      console.log('please enter the email')
      return 'EMAIL-IS-REQUIRED'
    }

    if (_.isEmpty(attrs.ConfirmedEmail)) {
      console.log('please confirm the email')
      return 'EMAIL-IS-REQUIRED'
    }

    if (!regexEmail.test(attrs.NewEmail) || !regexEmail.test(attrs.ConfirmedEmail)) {
      console.log('Please provide a valid email address.')
      return 'INVALID-EMAIL-ERROR'
    }

    if (attrs.NewEmail !== attrs.ConfirmedEmail) {
      console.log('email do not match')
      return 'EMAILS-DONT-MATCH'
    }
  }

  parse(response) {
    console.log('EditEmailModel parse')
    console.log(response)
    return response
  }

  changeEmail(params, defaultEmail) {
    console.log('EditEmailModel changeEmail')
    console.log(params)
    const attributes = {
      NewEmail: params[0].value,
      CurrentEmail: defaultEmail,
      ConfirmedEmail: params[1].value,
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
    console.log('EditEmailModel success')
    console.log(model, resp, options)
    model.set({
      editEmailSuccess: true,
      type: 'success',
      message: 'EMAIL-CHANGED',
    })
  }

  error(model, resp, options) {
    console.log('EditEmailModel error')
    console.log(model, resp, options)
    /* eslint function-paren-newline: 0 */
    resp
      .then(
        (response) => {
          console.log(response.responseJSON)
          if (!_.isEmpty(response.responseJSON)) {
            model.set({
              editEmailSuccess: false,
              type: 'error',
              message: response.responseJSON.Changed,
            })
          }
        },
        (error) => {
          console.log(error.responseJSON)
          if (!_.isEmpty(error.responseJSON)) {
            model.set({
              editEmailSuccess: false,
              type: 'error',
              message: error.responseJSON.error,
            })
          }
        })
  }
}

export default EditEmailModel
