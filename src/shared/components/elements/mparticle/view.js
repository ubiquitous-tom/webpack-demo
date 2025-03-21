import { View } from 'backbone'
import docCookies from 'doc-cookies'
import MParticleModel from './model'

class MParticle extends View {
  initialize(options) {
    if (process.env.MP_KEY) {
      console.log('MParticle initialize')
      this.model = options.model
      this.mParticleModel = new MParticleModel({ model: this.model })

      this.initializeData()
    }
  }

  render() {
    console.log('MParticle render')

    return this
  }

  initializeData() {
    this.requiredAttribures = {
      // page: window.location.toString(),
      // page_title: document.title,
      ga_uid: docCookies.getItem('ATVSessionCookie') || '',
      auth_state: this.model.get('Session')?.LoggedIn ? 'ob-sub-acorn' : 'unauth',
      // page_type: 'home', // this will be coming from `current_page_data`
      last_url: document.referrer,
      full_url: document.location.href,
      url: document.location.pathname,
      platform: 'web',
      service: 'acorn',
      network: 'acorn',
    }

    const { search } = document.location
    const urlParams = new URLSearchParams(search)
    if (urlParams.get('utm_campaign')) {
      this.requiredAttribures.utm_campaign = urlParams.get('utm_campaign')
    }
    if (urlParams.get('utm_source')) {
      this.requiredAttribures.utm_source = urlParams.get('utm_source')
    }
    if (urlParams.get('utm_medium')) {
      this.requiredAttribures.utm_medium = urlParams.get('utm_medium')
    }
    if (urlParams.get('utm_term')) {
      this.requiredAttribures.utm_term = urlParams.get('utm_term')
    }
    if (urlParams.get('utm_content')) {
      this.requiredAttribures.utm_content = urlParams.get('utm_content')
    }
  }

  logPageView(pageName) {
    if (this.isMParticleLoaded()) {
      // const data = {
      //   page: window.location.toString(),
      //   page_title: document.title,
      //   referring_page: document.referrer,
      //   platform: process.env.MP_PLATFORM,
      //   network: process.env.MP_NETWORK,
      // }
      this.requiredAttribures.page_type = pageName
      console.log('MParticle logPageView', this.requiredAttribures)
      /* eslint-disable no-undef */
      mParticle.logPageView('page_view', this.requiredAttribures)
    }
  }

  logClickEvent(e) {
    if (this.isMParticleLoaded()) {
      let clickedEl = jQuery(e.target)
      console.log('clicked element', clickedEl)

      const attrItemName = clickedEl.text().trim()
      const elTagName = e.target.tagName.toLowerCase()
      console.log(elTagName)

      let attrCat = 'button'
      let attrAction = 'none'
      let attrLabel = ''
      let attrActionURL = ''
      if (elTagName !== 'button' && clickedEl.closest('a').length) {
        clickedEl = clickedEl.closest('a')
        attrCat = 'text link'

        const elTarget = clickedEl.attr('target') || ''
        const elHref = clickedEl.attr('href')

        if (elTarget === '' || elTarget === '_self') {
          attrLabel = 'internal'
          attrAction = 'clickthrough'
          attrActionURL = elHref
        } else if (elTarget === '_blank') {
          attrLabel = 'external'
          attrAction = 'clickthrough'
          attrActionURL = elHref
        } else {
          attrLabel = 'contextual'
        }
      }

      const data = {
        category: attrCat,
        action: attrAction,
        label: attrLabel,
        clickthrough_url: attrActionURL,
        item_name: attrItemName,
        element_name: (attrCat === 'button') ? 'button' : '',
      }
      const attributes = { ...this.requiredAttribures, ...data }
      mParticle.logEvent('click_event', mParticle.EventType.Other, attributes)
    }
  }

  login(isLoggedIn) {
    if (this.isMParticleLoaded()) {
      if (isLoggedIn) {
        const identityRequest = this.mParticleModel.get('userIdentities')
        mParticle.Identity.login(identityRequest)
      } else {
        mParticle.logError('Login failed')
      }
    }
  }

  logout(isLoggedOut) {
    if (this.isMParticleLoaded()) {
      if (isLoggedOut) {
        mParticle.Identity.logout({}, this.identityCallback)
      } else {
        mParticle.logError('Logout failed')
      }
    }
  }

  identityCallback(result) {
    if (result.getUser()) {
      // IDSync request succeeded, mutate attributes or query for the MPID as needed
      const user = result.getUser()
      console.log(user)
      return
    }
    debugger
    const codes = window.mParticle.Identity.HTTPCodes
    switch (result.httpCode) {
      case codes.noHttpCoverage:
        // retry the IDSync request
        break
      case codes.activeIdentityRequest:
      case 429:
        // inspect your implementation if this occurs frequency
        // otherwise retry the IDSync request
        break
      case codes.validationIssue:
      case 400:
        console.log(result.body)
        // inspect result.body to determine why the request failed
        // this typically means an implementation issue
        break
      default:
        console.log(result.body)
    }
  }

  isMParticleLoaded() {
    return (process.env.MP_KEY)
  }
}

export default MParticle
