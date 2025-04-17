import { View } from 'backbone'
import docCookies from 'doc-cookies'
import MParticleModel from './model'

class MParticle extends View {
  initialize(options) {
    if (process.env.MP_KEY) {
      console.log('MParticle initialize')
      this.mParticleModel = new MParticleModel({ model: options.model })
      this.requiredAttributes = {}
      this.render()

      this.listenTo(this.model, 'router:executeRoute', (model) => {
        console.log(model)
        this.setLastURL()
      })
    }
  }

  render() {
    console.log('MParticle render')
    this.initializeConfig()

    return this
  }

  initializeConfig() {
    this.requiredAttributes = {
      ga_uid: docCookies.getItem('ATVSessionCookie') || '',
      auth_state: this.getAuthStatus(),
      // page_type: 'home', // this will be coming from `current_page_data`
      full_url: document.location.href,
      url: document.location.pathname,
      platform: 'web',
      service: 'acorn',
      network: 'acorn',
    }
  }

  getAuthStatus() {
    let authStatus = 'unauth' // unauthenticated
    if (this.model.has('Session') && this.model.get('Session')?.LoggedIn === true) {
      if (this.model.has('Subscription') && this.model.get('Subscription')?.NoSubscription === true) {
        authStatus = 'amcn-auth' // authenticated, no subscription
      } else {
        authStatus = 'ob-sub-acorn' // authenticated, subscription
      }
    }

    return authStatus
  }

  setLastURL() {
    /* eslint-disable no-undef */
    const currentUser = mParticle.Identity.getCurrentUser()
    console.log(currentUser)
    if (currentUser) {
      currentUser.setUserAttribute('last_url', this.mParticleModel.getLastURL())
    }
  }

  logPageView(pageName) {
    if (this.isMParticleLoaded()) {
      this.requiredAttributes.page_type = pageName
      console.log('MParticle logPageView', this.requiredAttributes)
      /* eslint-disable no-undef */
      mParticle.logPageView('page_view', this.requiredAttributes)
    }
  }

  logClickEvent(e, customEvent, additionalData) {
    if (this.isMParticleLoaded()) {
      let clickedEl = jQuery(e.target)
      console.log('clicked element', clickedEl)

      const attrItemName = clickedEl.text().trim()
      const elTagName = e.target.tagName.toLowerCase()
      console.log(elTagName)

      let attrCat = 'button'
      let attrAction = 'none'
      let attrLabel = ''
      let attrActionURL = 'none'
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
      const attributes = { ...this.requiredAttributes, ...data }
      mParticle.logEvent('click_event', mParticle.EventType.Other, attributes)

      if (customEvent) {
        const customEventAttributes = { ...this.requiredAttributes, ...additionalData }
        mParticle.logEvent(customEvent, mParticle.EventType.Other, customEventAttributes)
      }
    }
  }

  login(isLoggedIn, data) {
    if (this.isMParticleLoaded()) {
      if (isLoggedIn) {
        console.log(this.model, this.requiredAttributes)
        // debugger
        const identityRequest = {
          userIdentities: {
            email: data.email,
            customerid: data.customerID,
          },
        }
        mParticle.Identity.login(identityRequest, this.identityCallbackLogin.bind(this))
      } else {
        mParticle.logError('Login failed')
      }
    }
  }

  identityCallbackLogin(result) {
    if (result.getUser()) {
      const user = result.getUser()
      mParticle.logEvent('account_sign_in', mParticle.EventType.Other, this.requiredAttributes)
      this.model.trigger('signedin:success')
      console.log(user)
      return
    }

    this.mParticleModel.callbackErrorCode(result)
  }

  logout(isLoggedOut) {
    if (this.isMParticleLoaded()) {
      if (isLoggedOut) {
        mParticle.Identity.logout({}, this.identityCallbackLogout.bind(this))
      } else {
        mParticle.logError('Logout failed')
      }
    }
  }

  identityCallbackLogout(result) {
    if (result.getUser()) {
      // IDSync request succeeded, mutate attributes or query for the MPID as needed
      const logoutAttributes = {
        ...this.requiredAttributes,
        category: 'account_page',
        action: 'active',
      }
      mParticle.logEvent('account_sign_out', mParticle.EventType.Other, logoutAttributes)
      const user = result.getUser()
      user.removeAllUserAttributes()
      console.log(user)
      this.model.trigger('logout:success')
      return
    }

    this.mParticleModel.callbackErrorCode(result)
  }

  isMParticleLoggedIn() {
    const currentUser = mParticle.Identity.getCurrentUser()
    // debugger
    return (currentUser && currentUser.isLoggedIn()) ? currentUser.isLoggedIn() : false
  }

  isMParticleLoaded() {
    return (process.env.MP_KEY)
  }
}

export default MParticle
