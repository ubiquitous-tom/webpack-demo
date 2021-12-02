import { View } from 'backbone'
import _ from 'underscore'

import './stylesheet.scss'
import template from './index.hbs'
import GuestPlanModel from './model'
import FlashMessage from 'shared/elements/flash-message'

class GuestPlan extends View {

  get el() {
    return 'section'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'click button.start-free-trial': 'startFreeTrial',
    }
  }

  initialize() {
    console.log('GuestPlan initialize')
    console.log(this)
    this.flashMessage = new FlashMessage()
    this.model = new GuestPlanModel(this.model.attributes)
    // console.log(this.model)
    // console.log(this.model.attributes)
    this.render()
  }

  render() {
    console.log('GuestPlan render')
    // console.log(template)
    console.log(this.model.attributes)
    const data = {
      currSymbol: this.model.get('monthlyStripePlan').CurrSymbol,
      monthlySubscriptionAmount: this.model.get('monthlyStripePlan').SubscriptionAmount,
      trialDays: this.model.get('monthlyStripePlan').TrialDays,
    }
    const html = this.template(data)
    this.$el.find('.current-plan').html(html)

    this.startFreeTrialBanner()

    return this
  }

  startFreeTrialBanner() {
    const message = `Start streaming now! Try 7 Days Free`
    const type = `success`
    this.flashMessage.onFlashMessageShow(message, type)
  }

  startFreeTrial(e) {
    e.preventDefault()
    const startFreeTrialURL = `${this.model.get('signinEnv')}/trialsignup.jsp?OperationalScenario=STORE`
    console.log(startFreeTrialURL)
    window.location.assign(startFreeTrialURL)
  }
}

export default GuestPlan
