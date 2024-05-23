import _ from 'underscore'
// import { LocalStorage } from 'backbone'
// import { getLocalStorage } from 'backbone.localstorage/src/utils'
import ATVModel from 'core/model'

class AccountStatusModel extends ATVModel {
  get defaults() {
    return {
      localStorageID: 'atv-plans-available',
      // data: [{
      //   country_code: 'US',
      //   from_id: 58,
      //   to_frequency: 'annual',
      //   from_frequency: 'monthly',
      //   to_name: 'ATV-ANNUAL-US-7999',
      //   from_stripe_plan_id: '4b7c3f49-a4a8-11e8-bf79-0a1697e042ca',
      //   to_id: 59,
      //   from_name: 'ATV-MONTHLY-US-799',
      //   type: 'upgrade',
      //   to_stripe_plan_id: '4b8cc7be-a4a8-11e8-bf79-0a1697e042ca',
      // },
      // {
      //   country_code: 'US',
      //   from_id: 59,
      //   to_frequency: 'monthly',
      //   from_frequency: 'annual',
      //   to_name: 'ATV-MONTHLY-US-799',
      //   from_stripe_plan_id: '4b8cc7be-a4a8-11e8-bf79-0a1697e042ca',
      //   to_id: 58,
      //   from_name: 'ATV-ANNUAL-US-7999',
      //   type: 'downgrade',
      //   to_stripe_plan_id: '4b7c3f49-a4a8-11e8-bf79-0a1697e042ca',
      // }],
    }
  }

  get url() {
    return '/acorn/plans/available?platform=stripe'
  }

  initialize() {
    console.log('AccountStatusModel initialize')
    console.log(this)
    // this.checkStorages()

    // this.localStorage = new LocalStorage('atv-plans-available')
    // const store = getLocalStorage(this)
    // // console.log(store)
    // if (!_.isEmpty(store.records)) {
    //   const data = this.getStorageContent('atv-plans-available')
    //   // console.log(data)
    //   this.set(data)
    // } else {
    this.fetch({
      dataType: 'json',
      ajaxSync: true,
      wait: true,
      success: this.success,
      error: this.error,
    })
    // }
  }

  parse(response) {
    console.log('AccountStatusModel parse')
    console.log(response)
    if (!_.isEmpty(response)) {
      console.log('AccountStatusModel parse noEmpty')
      const { data } = response // _.pick(response, 'data')
      console.log(data)
      this.set({
        plansAvailable: data,
      })
      // this.getMonthlyToAnnualUpgrade()

      // this.sync('create', this)
    }
    console.log(this)
    return response
  }

  success(model, resp, options) {
    console.log('AccountStatusModel success')
    console.log(model, resp, options)
    // debugger
    model.set({
      plansAvailableSuccess: true,
    })
    // model.sync('read', model)
    // console.log(model)
  }

  error(model, resp, options) {
    console.log('AccountStatusModel error')
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
          plansAvailableSuccess: false,
          message,
        })
      })
  }

  // checkStorages() {
  //   console.log('AccountStatusModel checkStorages')
  //   _.each(this.get('localStorageIDs'), (val, key, list) => {
  //     // console.log(val, key, list)
  //     this.localStorage = new LocalStorage(val)
  //     const store = getLocalStorage(this)
  //     // console.log(store.records)
  //     if (!_.isEmpty(store.records)) {
  //       console.log('AccountStatusModel checkStorages NOT isEmpty')
  //       const data = this.getStorageContent(val)
  //       // console.log(data)
  //       this.set(data)
  //     } else {
  //       // go back to signin
  //     }
  //   })
  //   console.log(this)
  // }

  // getStorageContent(localStorageID) {
  //   console.log('AccountStatusModel getStorageContent')
  //   const id = this.localStorage._getItem(localStorageID)
  //   // console.log(id)
  //   const name = this.localStorage._itemName(id)
  //   // console.log(name)
  //   const item = this.localStorage._getItem(name)
  //   // console.log(item)
  //   const storage = this.localStorage.serializer.deserialize(item)
  //   // console.log(storage)

  //   return storage
  // }
}

export default AccountStatusModel
