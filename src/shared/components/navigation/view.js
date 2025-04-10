import { Router, View } from 'backbone'
// import _ from 'underscore'
// import Handlebars from 'handlebars'

import BackBoneContext from 'core/contexts/backbone-context'

import './stylesheet.scss'
import template from './index.hbs'
// import NavigationModel from './model'

class Navigation extends View {
  get el() {
    return 'nav'
  }

  get template() {
    return template
  }

  get events() {
    return {
      'click a': 'navigate',
    }
  }

  initialize() {
    console.log('Navigation initialize')
    // this.activeNav = 'applyPromoCode'
    this.resetActive()
    this.router = new Router()
    // this.model = new NavigationModel()

    this.context = new BackBoneContext()
    this.mp = this.context.getContext('mp')

    const isWebPaymentEdit = this.model.get('Customer').webPaymentEdit
    const isTigo = this.model.get('Membership').Store === 'Tigo'
    this.model.set({
      navigation: {
        emailSection: isWebPaymentEdit || isTigo,
      },
    })

    // this.listenTo(this.model, 'change', this.setActive)
    this.render()
  }

  render() {
    console.log('Navigation render')
    // const template = Handlebars.compile(this.template())

    const html = this.template(this.model.attributes)
    this.$el.html(html)

    this.$el
      .find('ul li a')
      .on('click', (e) => this.logClickEvent(e))

    return this
  }

  navigate(e) {
    console.log('Navigation Click navigate')
    console.log(e, e.target)
    // router.navigate('/');

    this.resetActive()
    this.setActive(e.target)
  }

  resetActive() {
    console.log('Navigation resetActive')
    $('.nav-tabs li').removeClass('active')
  }

  setActive(el) {
    console.log('Navigation setActive', el)
    // console.l0g($(el), $(el).parent())
    // $('.nav-tabs li').addClass('active')
    $(el).parent().addClass('active')
    // this.$el.find(el).add('active')
  }

  logClickEvent(e) {
    console.log('Navigation logClickEvent')
    // debugger
    this.mp.logClickEvent(e)
  }
}

export default Navigation
