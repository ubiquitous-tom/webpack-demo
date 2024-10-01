import { Model } from 'backbone'
// import { LocalStorage } from 'backbone'
import _ from 'underscore'
// import { getLocalStorage } from 'backbone.localstorage/src/utils'

class StripePlans extends Model {
  get defaults() {
    return {
      localStorageID: 'atv-stripeplans',
      stripePlans: [{
        VatAmount: 0,
        CurrSymbol: '$',
        PlanID: 'ATV-MONTHLY-US-799',
        Vat: false,
        StripePlanID: '4b7c3f49-a4a8-11e8-bf79-0a1697e042ca',
        StripeSettingsID: 'c8461883-90e7-11e8-a3d2-122f31084d08',
        Term: 30,
        TrialDays: 7,
        CurrencyDesc: 'USD',
        TermType: 'DAY',
        CurrencyName: 'Dollars',
        OrgID: 'ACORN',
        SubscriptionAmount: 7.99,
        DefaultPlan: true,
        TaxInclusive: false,
        CurrHtmlSymbol: '&#36;',
      },
      {
        VatAmount: 0,
        CurrSymbol: '$',
        PlanID: 'ATV-ANNUAL-US-7999',
        Vat: false,
        StripePlanID: '4b8cc7be-a4a8-11e8-bf79-0a1697e042ca',
        StripeSettingsID: 'c8461883-90e7-11e8-a3d2-122f31084d08',
        Term: 12,
        TrialDays: 7,
        CurrencyDesc: 'USD',
        TermType: 'MONTH',
        CurrencyName: 'Dollars',
        OrgID: 'ACORN',
        SubscriptionAmount: 79.99,
        DefaultPlan: true,
        TaxInclusive: false,
        CurrHtmlSymbol: '&#36;',
      }],
      stripePlansCountry: 'US',
      stripePlansLang: 'en',
    }
  }

  get url() {
    console.log('StripePlans url')
    const env = this.environment()
    console.log(env)
    return `https://${env}api.rlje.net/acorn/countrystripeplans`
  }

  initialize() {
    console.log('StripePlans initialize')
    // this.localStorage = new LocalStorage(this.get('localStorageID'))
    // // console.log(this.localStorage)
    // const storage = getLocalStorage(this)
    // // console.log(storage)
    // if (_.isEmpty(storage.records)) {
    console.log('StripePlans initialize fetch')
    this.fetch({
      ajaxSync: true,
    })
    // } else {
    //   console.log('StripePlans initialize updateModel')
    //   this.updateModel()
    // }
    // this.getStorageContent()

    // this.listenTo(this, 'change', this.getAnnualStripePlan)
    // this.listenTo(this, 'change', this.getMonthlyStripePlan)
  }

  parse(response) {
    console.log('StripePlans parse')
    console.log(response)
    if (!_.isEmpty(response)) {
      console.log('StripePlans parse noEmpty')
      const stripePlansObj = _.pick(response, 'StripePlans')
      const countryObj = _.pick(response, 'Country')
      const langObj = _.pick(response, 'Lang')
      console.log(stripePlansObj, countryObj, langObj)
      this.set(response)
      this.set({
        stripePlans: stripePlansObj.StripePlans,
        stripePlansCountry: countryObj.Country,
        stripePlansLang: langObj.Lang,
      })
      // console.log(this.get('langs'))
      // console.log(this.get('translation'))
      // _.each(this.get('langs'), (value, key, list) => {
      //   console.log(value, key)
      // })

      this.getAnnualStripePlan()
      this.getMonthlyStripePlan()

      // this.sync('create', this)
    }
    console.log(this)
    // return response
  }

  getAnnualStripePlan() {
    console.log('StripePlans getAnnualStripePlan')
    const type = {
      Term: 12,
      TermType: 'MONTH',
    }
    // console.log(this.attributes)
    const stripePlan = _.result(this.attributes, 'StripePlans')
    // console.log(stripePlan)
    const annualStripePlan = _.findWhere(stripePlan, type)
    // console.log(annualStripePlan)
    this.set('annualStripePlan', annualStripePlan)
  }

  getMonthlyStripePlan() {
    console.log('StripePlans getMonthlyStripePlan')
    const type = {
      Term: 30,
      TermType: 'DAY',
    }
    // console.log(this.attributes)
    const stripePlan = _.result(this.attributes, 'StripePlans')
    // console.log(stripePlan)
    const monthlyStripePlan = _.findWhere(stripePlan, type)
    // console.log(monthlyStripePlan)
    this.set('monthlyStripePlan', monthlyStripePlan)
  }

  environment() {
    let env = ''
    if (window.location.hostname.indexOf('dev') > -1) {
      env = 'dev-'
    }
    if (window.location.hostname.indexOf('qa') > -1) {
      env = 'qa-'
    }
    if (process.env.NODE_ENV === 'development') {
      env = process.env.RLJE_API_ENVIRONMENT
    }
    // console.log(env)
    return env
  }

  getStorageContent() {
    console.log('StripePlans getStorageContent')
    const id = this.localStorage._getItem(this.get('localStorageID'))
    // console.log(id)
    if (_.isEmpty(id)) {
      console.log('StripePlans getStorageContent isEmpty')
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
    console.log('StripePlans updateModel')
    const storage = this.getStorageContent()
    // console.log(storage)
    this.set(storage)
  }
}

export default StripePlans
