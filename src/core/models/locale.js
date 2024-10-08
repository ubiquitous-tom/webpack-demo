import _ from 'underscore'
import { Model, LocalStorage } from 'backbone'
import { getLocalStorage } from 'backbone.localstorage/src/utils'
// import ATVModel from 'core/model'

class ATVLocale extends Model {
  get defaults() {
    return {
      localStorageID: 'atv-locale',
      localeLoaded: false,
    }
  }

  get urlRoot() {
    return 'lang.json'
  }

  // get url() {
  //   console.log('ATVLocale url')
  //   const env = this.environment()
  //   console.log(env)
  //   return `https://app.rlje.net/${env}i18n/api/lang.json`
  // }

  initialize() {
    console.log('ATVLocale initialize')
    this.localStorage = new LocalStorage(this.get('localStorageID'))
    const storage = getLocalStorage(this)
    console.log(storage, this)
    // if (_.isEmpty(storage.records)) {
    console.log('ATVLocale initialize fetch')
    this.fetch({
      ajaxSync: true,
    })
    // } else {
    //   console.log('ATVLocale initialize updateModel')
    //   this.updateModel() // this.updateModel(this.get('localStorageID'), this)
    // }
  }

  parse(response) {
    console.log('ATVLocale Model parse')
    console.log(response)
    // if (!_.isEmpty(this.localStorage.findAll())) {
    //   this.getStorageContent(this.get('localStorageID'))
    // } else
    if (!_.isEmpty(response[0])) {
      console.log('ATVLocale Model parse noEmpty')
      // const langObj = _.pick(response[0], 'languages')
      // const trObj = _.pick(response[0], 'tr')
      // console.log(langObj, trObj)
      // this.set({
      //   languages: _.omit(langObj.languages, 'uk'),
      //   tr: trObj.tr,
      // })
      const { languages, tr } = response[0]
      const data = {
        languages: _.omit(languages, 'uk'),
        tr,
      }
      this.set(data)

      // this.sync('create', this)
      return data
    }
    return response[0]
  }

  environment() {
    // console.log(window.location.hostname)
    // console.log(window.location.hostname.indexOf('dev') > -1)
    const env = (process.env.ENVIRONMENT || '').replace('.', '/')
    return env
  }

  removeLanguage(languages, omitLanguage) {
    return _.omit(languages, omitLanguage)
  }

  getStorageContent() {
    const id = this.localStorage._getItem(this.get('localStorageID'))
    // console.log(id)
    const name = this.localStorage._itemName(id)
    // console.log(name)
    const item = this.localStorage._getItem(name)
    // console.log(item)
    const storage = this.localStorage.serializer.deserialize(item)
    // console.log(storage)

    return storage
  }

  updateModel() {
    console.log('ATVLocale updateModel')
    const storage = this.getStorageContent()
    // console.log(storage)
    this.set(storage)
  }
}

export default ATVLocale
