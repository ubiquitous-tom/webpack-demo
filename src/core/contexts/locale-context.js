import { Model } from 'backbone'
import BackBoneContext from './backbone-context'

class LocaleContext extends Model {
  initialize() {
    console.log('LocaleContext initialize')
    console.log(this.attributes)
    const locale = this.get('model')
    this.context = new BackBoneContext()
    this.context.setContext({ locale })
    console.log(this.context)
  }
}

export default LocaleContext
