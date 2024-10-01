import _ from 'underscore'
import docCookies from 'doc-cookies'
// import ATVLocale from 'core/models/locale'
import ATVModel from 'core/model'

class FooterModel extends ATVModel {
  get defaults() {
    return {
      navSlug: 'footer-navigation',
      currentYear: new Date().getFullYear(),
      currentLanguage: docCookies.getItem('ATVLocale') || 'en',
    }
  }

  get urlRoot() {
    const env = this.environment()
    return `https://${env}acorn.tv/wp-json/rlje-wp-api/v1/nav`
  }

  initialize() {
    console.log('FooterModel initialize')
    // const locale = new ATVLocale()
    // console.log(locale.attributes)

    // locale.on('sync', (model) => {
    //   console.log('FooterModel ATVLocal sync')
    //   // console.log(model)
    //   this.set(model.attributes)
    // })

    // if (!_.isEmpty(locale.attributes.languages)) {
    //   this.set(locale.attributes)
    // }

    const params = {
      slug: this.get('navSlug'),
    }
    console.log(params)

    this.fetch({
      dataType: 'json',
      ajaxSync: true,
      wait: true,
      data: $.param(params),
      success: this.success,
      error: this.error,
    })
  }

  parse(resp) {
    console.log('FooterModel parse')
    console.log(resp)
    console.log(this.get('currentLanguage'))
    const data = {}

    /* eslint no-param-reassign: "error" */
    resp.forEach((item) => {
      item.i18nKey = item.title.toUpperCase().replace(/\s+/g, '-')
      item.displayClasses = item.classes.join(' ')
      if (item.displayClasses.indexOf('ot-sdk-show-settings') !== -1) {
        // eslint-disable-next-line no-script-url
        item.footerNavURL = 'javascript:void(0)'
      }
      if (item.rlje_external_link_checkbox === '1') {
        item.footerNavURL = item.rlje_external_link.replace('%s', this.get('currentLanguage'))
      }

      if (item.rlje_external_link_checkbox === '1') {
        item.isPopUp = true
      }

      if (item.rlje_link_swap_checkbox_en === '1') {
        item.footerNavURL = item.rlje_link_swap_language_en
      }
      if (this.get('currentLanguage') === 'es') {
        if (item.rlje_link_swap_checkbox_es === '1') {
          item.footerNavURL = item.rlje_link_swap_language_es
        }
      }
    })
    data.navData = resp
    // debugger
    return data
  }

  success(model, resp, options) {
    console.log('FooterModel success')
    console.log(model, resp, options)
    // debugger
    model.set({
      footerNavSuccess: true,
    })
    console.log(model)
  }

  error(model, resp, options) {
    console.log('FooterModel error')
    console.log(model, resp, options)
    // debugger
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
        model.set({
          footerNavSuccess: false,
          message,
        })
      })
  }

  environment() {
    let env = ''
    if (window.location.hostname.indexOf('dev') > -1) {
      env = 'dev.'
    }
    if (window.location.hostname.indexOf('qa') > -1) {
      env = 'qa.'
    }
    if (process.env.NODE_ENV === 'development') {
      env = process.env.ENVIRONMENT
    }
    // console.log(env)
    return env
  }
}

export default FooterModel
