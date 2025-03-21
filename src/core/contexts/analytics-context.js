import { Model } from 'backbone'
import MParticle from 'shared/elements/mparticle'
import GoogleAnalytics from '../models/google-analytics'
import BackBoneContext from './backbone-context'

class AnalyticsContext extends Model {
  initialize() {
    console.log('AnalyticsContext initialize')
    console.log(this.attributes)
    const initializeApp = this.get('model')
    console.log(initializeApp)
    const ga = new GoogleAnalytics(initializeApp)
    const mp = new MParticle({ model: initializeApp })
    this.context = new BackBoneContext()
    this.context.setContext({ ga, mp })
    console.log(this.context)
  }
}

export default AnalyticsContext
