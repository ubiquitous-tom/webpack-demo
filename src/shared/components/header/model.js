import { Model } from 'backbone'
// import { Model, LocalStorage } from 'backbone'
import _ from 'underscore'
// import { getLocalStorage } from 'backbone.localstorage/src/utils'

class HeaderModel extends Model {
  get defaults() {
    return {
      navSlug: 'main-navigation',
      // localStorageID: 'atv-initializeapp',
    }
  }

  get urlRoot() {
    const env = this.environment()
    return `https://${env}acorn.tv/wp-json/rlje-wp-api/v1/nav`
  }

  initialize() {
    console.log('HeaderModel initialize')
    // this.localStorage = new LocalStorage(this.get('localStorageID'))
    // // console.log(this, this.LocalStorage)
    // const storage = getLocalStorage(this)
    // // console.log(storage)
    // if (!_.isEmpty(storage.records)) {
    //   const content = this.getStorageContent()
    //   this.set(content)
    // } else {
    //   // go to login
    // }

    const params = {
      slug: this.get('navSlug'),
    }
    console.log(params)

    this.fetch({
      dataType: 'json',
      ajaxSync: true,
      wait: true,
      data: $.param(params),
      success: this.success,
      error: this.error,
    })
  }

  parse(resp) {
    console.log('HeaderModel parse')
    console.log(resp)
    const data = {}

    /* eslint no-param-reassign: "error" */
    resp.forEach((item) => {
      item.i18nKey = item.title.toUpperCase().replace(/\s+/g, '-')
      item.displayClasses = item.classes.join(' ')
      console.log(item.url)
      const baseURL = `https://${this.get('environment')}acorn.tv/`
      console.log(baseURL)
      const url = new URL(item.url, baseURL)
      console.log(url)
      item.headerNavURL = url.href
    })
    data.navData = resp
    // debugger
    return data
  }

  success(model, resp, options) {
    console.log('HeaderModel success')
    console.log(model, resp, options)
    // debugger
    model.set({
      headerNavSuccess: true,
    })
    console.log(model)
  }

  error(model, resp, options) {
    console.log('HeaderModel error')
    console.log(model, resp, options)
    // debugger
    let message = ''
    /* eslint function-paren-newline: 0 */
    resp
      .then(
        (response) => {
          console.log(response.responseJSON, response.responseText)
          if (!_.isEmpty(response.responseJSON)) {
            message = response.responseJSON.message
            return message
          }
          if (!_.isEmpty(response.responseText)) {
            message = response.responseText
            return message
          }
          return message
        },
        (error) => {
          console.log(error.responseJSON, error.responseText)
          if (!_.isEmpty(error.responseJSON)) {
            message = error.responseJSON.error
            return message
          }
          if (!_.isEmpty(error.responseText)) {
            message = error.responseText
            return message
          }
          return message
        })
      .always(() => {
        model.set({
          headerNavSuccess: false,
          message,
        })
      })
  }

  environment() {
    const env = process.env.ENVIRONMENT || ''
    // console.log(env)
    return env
  }

  getStorageContent() {
    console.log('HeaderModel getStorageContent')
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
}

export default HeaderModel
