import { Model } from 'backbone'
import _ from 'underscore'
import { LocalStorage } from 'backbone.localstorage'
import { getLocalStorage } from 'backbone.localstorage/src/utils';

class InitializeApp extends Model {

  get defaults() {
    return {
      appVersion: 'ATV2.0.0',
      localStorageID: 'atv-initializeapp',
    }
  }

  url() {
    console.log('InitializeApp url')
    return '/initializeapp?AppVersion=' + this.get('appVersion')
  }

  initialize() {
    console.log('InitializeApp initialize')
    console.log(this)
    this.localStorage = new LocalStorage(this.get('localStorageID'))
    // console.log(this.localStorage)
    const store = getLocalStorage(this)
    // console.log(store)
    if (_.isEmpty(store.records)) {
      this.fetchInitializeApp()
    }
  }

  parse(response) {
    console.log('InitializeApp parse')
    console.log(response)
    const data = response
    if (_.isEmpty(data)) {
      return data
    }
    this.set(data)
    this.set({
      environment: 'dev3.',//this.environment(),
      signinEnv: this.signinEnv(),
      storeEnv: this.storeEnv(),
    })

    // If this is a brand new account never been created then go to signup
    if (!this.has('Customer')) {
      const signinURL = `${this.get('signinEnv')}/signin.jsp?OperationalScenario=STORE`
      window.location.assign(signinURL)
    }

    const storage = getLocalStorage(this)
    if (!_.isEmpty(storage.records)) {
      this.getStorageContent()
    } else {
      // this.sync('create', this)
      // console.log(this.localStorage.findAll())
    }

    return data
  }

  fetchInitializeApp() {
    console.log('InitializeApp fetchInitializeApp')
    this.fetch({
      ajaxSync: true
    })
  }

  environment() {
    return window.location.href.indexOf('dev') > -1
      ? 'dev3.'
      : window.location.href.indexOf('qa') > -1
        ? 'qa.'
        : ''
  }

  signinEnv() {
    return `${window.location.protocol}//${window.location.hostname.replace('account', 'signup')}`
  }
  storeEnv() {
    return `${window.location.protocol}//${window.location.hostname.replace('account', 'store')}`
  }

  getStorageContent() {
    const id = this.localStorage._getItem(this.get('localStorageID'))
    // console.log(id)
    const name = this.localStorage._itemName(id)
    // console.log(name)
    const item = this.localStorage._getItem(name)
    // console.log(item)
    const storage = this.localStorage.serializer.deserialize(item)
    console.log(storage)

    return storage
  }

  subscriptionUpdated(model) {
    console.log('InitializeApp subscriptionUpdated')
    console.log(this, model)
    debugger
    this.fetchInitializeApp()
  }
}

export default InitializeApp
