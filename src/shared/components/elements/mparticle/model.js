import { Model } from 'backbone'
import mParticle from '@mparticle/web-sdk'
// import mixpanelKit from '@mparticle/web-mixpanel-kit'
import docCookies from 'doc-cookies'

class MParticleModel extends Model {
  // get defaults() {
  //   return {
  //     isDevelopmentMode: false,
  //     logLevel: 'none',
  //     dataPlan: {
  //       planId: 'acorn_web',
  //       planVersion: 1,
  //     },
  //     identifyRequest: {
  //       userIdentities: {
  //         email: 'h.jekyll.md@example.com',
  //         customerid: 'h.jekyll.md',
  //       },
  //     },
  //     identityCallback(result) {
  //       // Do something once an identity call has been made.
  //       // For more information, see https://docs.mparticle.com/developers/client-sdks/web/idsync/#sdk-initialization-and-identify
  //       console.log(result)
  //     },
  //   }
  // }

  initialize() {
    console.log('MParticleModel initialize')
    console.log(this.get('model'))
    this.model = this.get('model')
    this.customerID = this.model.get('Customer')?.CustomerID || ''
    this.email = this.model.get('Customer')?.Email || ''
    this.config = {
      dataPlan: {
        planId: 'acorn_web',
        planVersion: 1,
      },
      appVersion: '0.1.1',
    }

    if (process.env.MP_KEY) {
      this.initializeMParticle()
    }
  }

  initializeMParticle() {
    console.log(`MParticleModel initializeMParticle: ${process.env.MP_KEY}`)

    if (process.env.MP_DEVMODE) {
      this.config.isDevelopmentMode = (process.env.MP_DEVMODE === 'true')
    }
    if (process.env.MP_LOG_LEVEL) {
      this.config.logLevel = process.env.MP_LOG_LEVEL
    }
    if (this.customerID && this.email) {
      this.config.identifyRequest = {
        userIdentities: {
          email: this.email,
          customerid: this.customerID,
        },
        identityCallback: this.identityCallback,
      }
    }
    console.log('MParticleModel config: ', this.config)
    // mixpanelKit.register(this.config)
    mParticle.init(process.env.MP_KEY, this.config)
    console.log('MParticleModel finished initializing')
  }

  // identityCallback(result) {
  //   // Do something once an identity call has been made.
  //   // For more information, see https://docs.mparticle.com/developers/client-sdks/web/idsync/#sdk-initialization-and-identify
  //   console.log(result)
  // }
  identityCallback(result) {
    if (result.getUser()) {
      // IDSync request succeeded, mutate attributes or query for the MPID as needed
      const user = result.getUser()
      user.setUserAttributes({
        ga_uid: docCookies.getItem('ATVSessionCookie') || '',
        last_url: this.getLastURL(),
        platform: 'web',
        service: 'acorn',
        on_acorn: 1,
      })

      const { search } = document.location
      const urlParams = new URLSearchParams(search)
      if (urlParams.get('utm_campaign')) {
        user.setUserAttribute('utm_campaign', urlParams.get('utm_campaign'))
      }
      if (urlParams.get('utm_source')) {
        user.setUserAttribute('utm_source', urlParams.get('utm_source'))
      }
      if (urlParams.get('utm_medium')) {
        user.setUserAttribute('utm_medium', urlParams.get('utm_medium'))
      }
      if (urlParams.get('utm_term')) {
        user.setUserAttribute('utm_term', urlParams.get('utm_term'))
      }
      if (urlParams.get('utm_content')) {
        user.setUserAttribute('utm_content', urlParams.get('utm_content'))
      }
      console.log(user)
      return
    }

    this.callbackErrorCode(result)
  }

  callbackErrorCode(result) {
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
}

export default MParticleModel
