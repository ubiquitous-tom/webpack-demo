import { Model, LocalStorage } from 'backbone'
import _ from 'underscore'
import { getLocalStorage } from 'backbone.localstorage/src/utils'

class PlansAvailable extends Model {
  get defaults() {
    return {
      data: [{
        country_code: 'US',
        from_id: 58,
        to_frequency: 'annual',
        from_frequency: 'monthly',
        to_name: 'price_1R9rY82hcBjtiCUZyIzVQhBG',
        from_stripe_plan_id: '4b7c3f49-a4a8-11e8-bf79-0a1697e042ca',
        to_id: 59,
        from_name: 'price_1R9rY52hcBjtiCUZrFuCAT03',
        type: 'upgrade',
        to_stripe_plan_id: '4b8cc7be-a4a8-11e8-bf79-0a1697e042ca',
      },
      {
        country_code: 'US',
        from_id: 59,
        to_frequency: 'monthly',
        from_frequency: 'annual',
        to_name: 'price_1R9rY52hcBjtiCUZrFuCAT03',
        from_stripe_plan_id: '4b8cc7be-a4a8-11e8-bf79-0a1697e042ca',
        to_id: 58,
        from_name: 'price_1R9rY82hcBjtiCUZyIzVQhBG',
        type: 'downgrade',
        to_stripe_plan_id: '4b7c3f49-a4a8-11e8-bf79-0a1697e042ca',
      }],
    }
  }

  get url() {
    console.log('PlansAvailable url')
    return '/acorn/plans/available?platform=stripe'
  }

  initialize() {
    console.log('PlansAvailable initialize')
    this.localStorageID = 'atv-plans-available'
    this.localStorage = new LocalStorage(this.localStorageID)
    // console.log(this.localStorage)
    const storage = getLocalStorage(this)
    // console.log(storage)
    if (_.isEmpty(storage.records)) {
      console.log('PlansAvailable initialize fetch')
      this.fetch({
        ajaxSync: true,
      })
    } else {
      console.log('PlansAvailable initialize updateModel')
      this.updateModel()
    }
    // this.getStorageContent()
    // this.getMonthlyToAnnualUpgrade()
    // console.log(this)
  }

  parse(response) {
    console.log('PlansAvailable parse')
    console.log(response)
    if (!_.isEmpty(response)) {
      console.log('PlansAvailable parse noEmpty')
      const { data } = response // _.pick(response, 'data')
      console.log(data)
      this.set({
        plansAvailable: data,
      })
      // this.getMonthlyToAnnualUpgrade()

      this.sync('create', this)
    }
    console.log(this)
    return response
  }

  // getMonthlyToAnnualUpgrade() {
  //   console.log('PlansAvailable getMonthlyToAnnualUpgrade')
  //   const type = 'upgrade'
  //   const from_frequency = 'monthly'
  //   const to_frequency = 'annual'
  //   const data = this.get('plansAvailable')
  //   console.log(data)
  //   _.each(data, (plan, key, collection) => {
  //     console.log(plan.type)
  //     if (plan.type === type) {
  //       console.log(plan.from_frequency, plan.to_frequency)
  //       if (plan.from_frequency === from_frequency && plan.to_frequency === to_frequency) {
  //         console.log(plan)
  //         this.set('monthlyToAnnual', plan)
  //         return plan
  //       }
  //     }
  //   })
  //   return []
  // }

  getStorageContent() {
    console.log('PlansAvailable getStorageContent')
    const id = this.localStorage._getItem(this.localStorageID)
    // console.log(id)
    if (_.isEmpty(id)) {
      console.log('PlansAvailable getStorageContent isEmpty')
      return false
    }
    const name = this.localStorage._itemName(id)
    // console.log(name)
    const item = this.localStorage._getItem(name)
    // console.log(item)
    const storage = this.localStorage.serializer.deserialize(item)
    // console.log(storage)

    return storage
  }

  updateModel() {
    console.log('PlansAvailable updateModel')
    const storage = this.getStorageContent()
    // console.log(storage)
    this.set(storage)
  }
}

export default PlansAvailable
