import { View } from 'backbone'

class Promo extends View {
  initialize(options) {
    console.log('Promo initialize')
    console.log(options)
    this.i18n = options.i18n
    this.presetOptions = {
      promo: 'acorntv_st_pmc',
      promodisplay: 'acorntv_st_pmd',
      plan: 'acorntv_st_pmp',
      type: 'acorntv_st_pmt',
    }
  }

  clearPromoMessage(container) {
    console.log('Promo clearPromoMessage')
    // const container = this.$('#apply-promo-code')
    const promoInput = container.find('#promo-code')
    const button = container.find('button')
    const promoMessage = container.find('.promo-message')
    const promoClear = container.find('#promo-clear')

    promoInput
      .prop('disabled', false)
      .val('')

    promoClear
      .remove()

    button
      .prop('disabled', false)
      .removeAttr('style')
      .html(this.i18n.t('APPLY-CODE'))

    promoMessage.remove()
  }

  updatePromoMessage(container, message, value) {
    console.log('Promo updatePromoMessage')
    // debugger
    const promoCodeApplied = $('<div>').addClass('col-md-9 promo-message text-center pull-right')
    const promoCodeAppliedType = value ? 'success' : 'error'
    // const i = $('<i>').addClass('glyphicon glyphicon-ok')

    // const container = this.$('#apply-promo-code')
    const promoInput = container.find('#promo-code')
    const button = container.find('button')
    const buttonWidth = button.outerWidth()
    const xIcon = $('<i>').addClass('fa fa-times-thin fa-2x').attr({ 'aria-hidden': true })
    const promoClear = $('<a>').attr('id', 'promo-clear').append(xIcon)
    /* eslint comma-dangle: 0 */
    // remove old promo message
    container
      .find('.promo-message')
      .remove()
    // remove old promo-clear
    container
      .find('#promo-clear')
      .remove()

    // disable promo field and button
    // if the promo code is good then disable the input
    // DWT1-1020
    if (value) {
      promoInput
        .prop('disabled', true)
    }
    promoInput
      .after(promoClear)

    // if the promo code is good then disable the button
    // DWT1-1020
    if (value) {
      button
        .prop('disabled', true)
        .css({
          width: buttonWidth,
          background: '#afafaf',
          color: '#000',
          fontWeight: 700,
        })
        .html(this.i18n.t('APPLIED-PROMO-CODE'))
    }

    // display new promo message
    let promoMessage = message

    // if the promo code is bad then show customized message required by the Product owner.
    // DWT1-1020
    if (!value) {
      if (message.includes('expired')) {
        promoMessage = this.i18n.t('EXPIRED-PROMO-CODE-2024')
      }

      if (message.includes('not exist')) {
        promoMessage = this.i18n.t('PROMOCODE-ERROR')
      }
    }

    container
      .find('.form-group')
      .append(
        promoCodeApplied
          .addClass(promoCodeAppliedType)
          // .append(i)
          .append(promoMessage)
      )
  }

  getPresetOptions() {
    console.log('Promo getPresetOptions')
    console.log(window.location)
    let queryString = ''
    const { hash, search } = window.location
    console.log(hash, search)
    if (search) {
      queryString = search
      const urlParamsSearch = new URLSearchParams(queryString)

      Object.entries(this.presetOptions).forEach((option) => {
        // debugger
        const [preset, sessionKey] = option
        console.log(urlParamsSearch.has(preset))
        console.log(urlParamsSearch.get(preset))
        if (urlParamsSearch.has(preset)) {
          const presetValue = urlParamsSearch.get(preset)
          sessionStorage.setItem(sessionKey, presetValue)
        }
      })
    }
  }

  setPresetOptions(el, type, value = '') {
    console.log('Promo setPresetOptions')
    switch (type) {
      case 'promo':
        console.log(sessionStorage.getItem('acorntv_st_pmc'))
        if (sessionStorage.getItem('acorntv_st_pmc')) {
          el
            .find('#promo-code')
            .val(sessionStorage.getItem('acorntv_st_pmc'))
          el
            .find('#apply-promo-code-form button')
            .click()
        }
        break
      case 'plan':
        console.log(sessionStorage.getItem('acorntv_st_pmp'))
        if (sessionStorage.getItem('acorntv_st_pmp') && sessionStorage.getItem('acorntv_st_pmp') === value) {
          el
            .find('input')
            .prop('checked', true)
            .trigger('change')
        }
        break
      default:
        console.log(`${type} is not found for a preset options`)
    }
  }

  removePresetOptions() {
    console.log(window.location)
    let queryString = ''
    const { hash, search } = window.location
    console.log(hash, search)
    if (search) {
      queryString = search
      const urlParamsSearch = new URLSearchParams(queryString)
      Object.entries(this.presetOptions).forEach((option) => {
        // debugger
        const [preset, sessionKey] = option
        console.log(preset, sessionKey)
        console.log(urlParamsSearch.has(preset), urlParamsSearch.get(preset))
        if (urlParamsSearch.has(preset)) {
          urlParamsSearch.delete(preset)
        }
      })
      window.history.pushState({}, document.title, `${window.location.pathname}${window.location.hash}`)
    }

    Object.entries(this.presetOptions).forEach((option) => {
      // debugger
      const [preset, sessionKey] = option
      console.log(preset, sessionKey)
      console.log(sessionStorage.getItem(sessionKey))
      if (sessionStorage.getItem(sessionKey)) {
        sessionStorage.removeItem(sessionKey)
      }
    })
  }
}

export default Promo
