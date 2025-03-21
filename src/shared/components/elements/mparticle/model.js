import { Model } from 'backbone'
import mParticle from '@mparticle/web-sdk'

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
    this.customerID = this.model.get('Customer').CustomerID || ''
    this.email = this.model.get('Customer').Email || ''
    this.config = {}

    if (process.env.MP_KEY) {
      this.initializeMParticle()
    }
  }

  initializeMParticle() {
    console.log(`MParticleModel initializeMParticle: ${process.env.MP_KEY}`)

    this.config.dataPlan = {
      planId: 'acorn_web',
      planVersion: 1,
    }
    if (process.env.MP_DEVMODE) {
      this.config.isDevelopmentMode = process.env.MP_DEVMODE
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

  identityCallback(result) {
    // Do something once an identity call has been made.
    // For more information, see https://docs.mparticle.com/developers/client-sdks/web/idsync/#sdk-initialization-and-identify
    console.log(result)
  }
}

export default MParticleModel
