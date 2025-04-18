import { Model } from 'backbone'
import GoogleAnalytics from '../models/google-analytics'
import BackBoneContext from './backbone-context'

class GoogleAnalyticsContext extends Model {
  initialize() {
    console.log('GoogleAnalyticsContext initialize')
    console.log(this.attributes)
    const initializeApp = this.get('model')
    console.log(initializeApp)
    const ga = new GoogleAnalytics(initializeApp)
    this.context = new BackBoneContext()
    this.context.setContext({ ga })
    console.log(this.context)
  }
}

export default GoogleAnalyticsContext
