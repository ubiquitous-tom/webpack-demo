import { View } from 'backbone'
import docCookies from 'doc-cookies'
import MParticleModel from './model'

class MParticle extends View {
  initialize(options) {
    if (process.env.MP_KEY) {
      console.log('MParticle initialize')
      this.model = options.model
      this.mParticleModel = new MParticleModel({ model: this.model })
      this.requiredAttributes = {}
      this.render()

      this.listenTo(this.model, 'router:executeRoute', (model) => {
        console.log(model)
        // Once the `/initializeApp` API is fully logged in then log into mParticle.
        if (model.get('Session') && model.get('Session')?.LoggedIn) {
          this.setLastURL()
          const userData = {
            email: model.get('Customer')?.Email || '',
            customerID: model.get('Customer')?.CustomerID || '',
          }
          if (!this.isMParticleLoggedIn()) {
            // debugger
            this.login(model.get('Session').LoggedIn, userData)
          }
        } else {
          console.log('logged out')
          // debugger
          const signinURL = `${this.model.get('signinEnv')}/signin.jsp?OperationalScenario=STORE`
          window.location.assign(signinURL)
        }
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

    if (this.model.has('Session') && this.model.get('Session')?.LoggedIn === true) {
      this.setLastURL()
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
      currentUser.setUserAttribute('last_url', this.getLastURL())
    }
  }

  getLastURL() {
    const referringUrlWithHash = sessionStorage.getItem('ATVSessionLastURL') || ''
    console.log('MParticle getLastURL', referringUrlWithHash)
    // Optional: Remove the stored URL after use
    // sessionStorage.removeItem('ATVSessionLastURL')
    return referringUrlWithHash
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
      this.mParticleModel.identityCallback(result)
      console.log(user)
      return
    }

    this.mParticleModel.callbackErrorCode(result)
  }

  logout(isLoggedOut) {
    if (this.isMParticleLoaded()) {
      if (isLoggedOut) {
        mParticle.Identity.logout({}, this.identityCallbackLogout.this.bind(this))
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
      console.log(user)
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
