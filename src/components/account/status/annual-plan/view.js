import { View } from 'backbone'
import _ from 'underscore'
import Handlebars from 'handlebars'

import './stylesheet.css'
import template from './index.html'
import AnnualPlanModel from './model'
import AccountStatusModel from '../model'

class AnnualPlan extends View {

  get template() {
    // return template
    return _.template(template)
  }

  initialize() {
    console.log('AnnualPlan initialize')
    // console.log(this)
    // this.model = this.attributes
    this.setElement('section')
    // this.model = new AnnualPlanModel()
    // this.model = new AccountStatusModel()
    // console.log(this.model)
    // console.log(this.model.attributes)
    // this.render()
    this.model.set({
      renewalDate: this.getRenewalDate(),
      annualPerMonthPricing: this.annualPerMonthPricing(),
    })
  }

  render() {
    console.log('AnnualPlan render')
    const template = Handlebars.compile(this.template())
    // console.log(template)
    const html = template(this.model.attributes)
    // console.log(html)
    // console.log(this.$el.find('.current-plan'))
    this.$el.find('.current-plan').html(html)

    // this.$el.html(html)
    // this.$el.html(this.template(this.model.attributes))
    return this
  }

  getRenewalDate() {
    console.log('AnnualPlan getRenewal')
    let date = new Date(this.model.get('Membership').NextBillingDateAsLong)
    let renewalDate = this.formatDate(date)
    // console.log(renewalDate)
    // this.model.set('renewalDate', renewalDate)
    return renewalDate
  }

  annualPerMonthPricing() {
    console.log('AnnualPlan getMonthlyPricing')
    const pricing = (Math.floor((this.model.get('Membership').SubscriptionAmount / 12) * 100) / 100).toFixed(2)
    // console.log(pricing)
    // this.model.set('annualPerMonthPricing', pricing)
    return pricing
  }

  formatDate(d) {
    //get the month
    let month = d.getMonth()
    //get the day
    //convert day to string
    let day = d.getDate().toString()
    //get the year
    let year = d.getFullYear()

    //pull the last two digits of the year
    year = year.toString().substr(-2)

    //increment month by 1 since it is 0 indexed
    //converts month to a string
    month = (month + 1).toString()

    //if month is 1-9 pad right with a 0 for two digits
    if (month.length === 1) {
      month = "0" + month
    }

    //if day is between 1-9 pad right with a 0 for two digits
    if (day.length === 1) {
      day = "0" + day
    }

    //return the string "MMddyy"
    return [month, day, year].join('/')
  }
}

export default AnnualPlan
