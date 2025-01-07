import { View } from 'backbone'
import MParticleModel from './model'

class MParticle extends View {
  initialize(options) {
    if (process.env.MP_KEY) {
      console.log('MParticle initialize')
      this.model = options.model
      this.mParticleModel = new MParticleModel({ model: this.model })
    }
  }

  render() {
    console.log('MParticle render')

    return this
  }

  logPageView() {
    if (process.env.MP_KEY) {
      console.log('MParticleView logPageView')
      const data = {
        page: window.location.toString(),
        page_title: document.title,
        referring_page: document.referrer,
        platform: process.env.MP_PLATFORM,
        network: process.env.MP_NETWORK,
      }
      console.log(data)
      /* eslint-disable no-undef */
      mParticle.logPageView(
        'page_view',
        data,
      )
    }
  }
}

export default MParticle
