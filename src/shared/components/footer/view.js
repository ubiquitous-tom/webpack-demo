import { View } from 'backbone'
// https://github.com/handlebars-lang/handlebars.js/issues/1553
import * as Handlebars from 'handlebars/runtime'

import docCookies from 'doc-cookies'
import { Fancybox } from '@fancyapps/ui'
import BackBoneContext from 'core/contexts/backbone-context'

import '@fancyapps/ui/dist/fancybox.css'
import './stylesheet.scss'
import template from './index.hbs'
import FooterModel from './model'

class Footer extends View {
  get el() {
    return 'footer'
  }

  get events() {
    return {
      'change #atvLocale': 'updateLanguage',
      'click .open-dialog': 'openDialog',
    }
  }

  get template() {
    return template
  }

  initialize(options) {
    console.log('Footer initialize')
    // this.context = new BackBoneContext()
    this.i18n = options.i18n
    this.model = new FooterModel(this.model.attributes)
    this.context = new BackBoneContext()
    this.mp = this.context.getContext('mp')

    // Initialize footer popup
    Fancybox.bind('[data-fancybox]')

    // render for sync
    this.listenTo(this.model, 'change:footerNavSuccess', this.render)

    // render for localStorage
    // console.log('context', this.context)
    // debugger
    // this.render()
  }

  render() {
    console.log('Footer render')
    this.isSelected()
    console.log(this.model.attributes)
    const html = this.template(this.model.attributes)
    // console.log(html)
    this.$el.html(html)

    this.$el
      .find('ul li a')
      .on('click', (e) => this.logClickEvent(e))

    return this
  }

  updateLanguage(e) {
    console.log(e)
    console.log(this.model.attributes, e.target.value)
    const currentLocale = e.target.value
    docCookies.setItem('ATVLocale', currentLocale)
    this.model.set('currentLanguage', currentLocale || 'en')
    window.location.reload()
  }

  openDialog(e) {
    e.preventDefault()
    console.log(e.currentTarget)
    console.log($(e.currentTarget))
    $(e.currentTarget).on('shown.bs.modal', () => {
      const link = $(e.currentTarget).attr('href')
      console.log(link)
      // correct here use 'shown.bs.modal' event which comes in bootstrap3
      // $(e.currentTarget).find('iframe').attr('src', 'http://www.google.com')
      const iframe = $('<iframe>').attr({ src: link })
      $('body').append(iframe)
    })
    $('.open-dialog').on('shown.bs.modal', () => {
      $('.open-dialog').find('iframe').attr('src', 'http://www.google.com')
    })
  }

  isSelected() {
    Handlebars.registerHelper('option', (value, currentSelection, context) => {
      // console.log(value, currentSelection, context.toString(), context)
      const selected = value.toLowerCase() === currentSelection ? 'selected' : ''
      return `<option value="${value}" ${selected}>${context}</option>`
    })
  }

  logClickEvent(e) {
    console.log('Footer logClickEvent')
    debugger
    this.mp.logClickEvent(e)
  }
}

export default Footer
