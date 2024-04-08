import { Router, View } from 'backbone'
import _ from 'underscore'
import atvlogo from 'img/atvlogo.png'
import './stylesheet.scss'
import template from './index.hbs'
import HeaderModel from './model'

class Header extends View {
  get el() {
    return 'header'
  }

  get template() {
    // already passed Handlebars.compile() from `handlebars-loaer`
    // console.log(template)
    return template
    // return _.template(template)
  }

  get events() {
    return {
      'click a': 'navigate',
    }
  }

  initialize(options) {
    console.log('Header initialize')
    // this.router = new Router()
    this.i18n = options.i18n

    const attributes = {
      environment: this.model.get('environment'),
      isUK: this.model.get('isUK'),
      isAU: this.model.get('isAU'),
    }
    this.headerModel = new HeaderModel(attributes)

    this.listenTo(this.headerModel, 'change:headerNavSuccess', (model, value) => {
      console.log(model, value)
      // debugger
      if (value) {
        this.renderHeaderLinks()
      }
    })

    this.render()
  }

  render() {
    console.log('Header render')
    // https://gist.github.com/kyleondata/3440492
    // const template = Handlebars.compile(this.template)
    console.log(this.model.attributes, this.headerModel.attributes)
    // debugger

    const isLoggedIn = this.model.has('Session') ? this.model.get('Session').LoggedIn : false
    const isWebPaymentEdit = this.model.has('Customer') && this.model.get('Customer').webPaymentEdit
    const isTigo = this.model.get('Membership').Store === 'Tigo'

    const attributes = {
      isLoggedIn,
      isWebPaymentEdit,
      signupEnv: this.model.get('signupEnv'),
      environment: this.model.get('environment'),
      atvlogo,
      navigation: {
        emailSection: isWebPaymentEdit || isTigo,
      },
      navData: this.headerModel.has('navData') ? this.headerModel.get('navData') : null,
    }
    const html = this.template(attributes)
    // console.log(html)
    this.$el.html(html)

    // this.$el.html(this.template(this.model.attributes))

    this.activateNavigation()

    return this
  }

  renderHeaderLinks() {
    const navData = this.headerModel.get('navData')
    let html = ''
    _.each(navData, (element) => {
      html += `<li><a href="${element.headerNavURL}">${this.i18n.t(element.i18nKey)}</a></li>`
    })
    this.$('ul.nav').append(html)
  }

  navigate(e) {
    console.log('Header Click navigate')
    console.log(e, e.target, e.target.hash)
    // router.navigate('/');

    this.removeOverlay()
    this.resetActive(e.target.hash)
    this.setActive(e.target.hash)
  }

  removeOverlay() {
    console.log('removeOverlay')
    const article = $('article')
    const children = article.children('[role="dialog"]')
    console.log(article, children, children.length)
    if (children.length) {
      children.remove()
      this.showFooter()
    }
  }

  showFooter() {
    $('footer').show()
  }

  resetActive(hash) {
    console.log('resetActive')
    if (!_.isEmpty(hash)) {
      $('.nav-tabs li').removeClass('active')
    }
  }

  setActive(hash) {
    console.log('setActive', hash)
    // console.l0g($(el), $(el).parent())
    // $('.nav-tabs li').addClass('active')
    if (!_.isEmpty(hash)) {
      $(`li${hash}`).addClass('active')
    }
    // this.$el.find(el).add('active')
  }

  activateNavigation() {
    $(() => {
      const sideslider = $('[data-toggle=collapse-side]')
      const sel = sideslider.attr('data-target')
      const sel2 = sideslider.attr('data-target-2')
      /* eslint no-unused-vars: 0 */
      sideslider.on('click', (e) => {
        $(sel).toggleClass('in')
        $(sel2).toggleClass('out')
      })

      // dropdown menu
      $('.menuOptions').on('click', (e) => {
        const $dropSelect = $(e.currentTarget).parent().find('.drop-select')
        if ($dropSelect.hasClass('closed')) {
          $dropSelect.slideDown(300).show()
          $dropSelect.addClass('open')
          $dropSelect.removeClass('closed')
        } else {
          $dropSelect.slideUp(400).fadeOut()
          $dropSelect.addClass('closed')
          $dropSelect.removeClass('open')
        }
        return false
      })

      $('.navbar .container').on('click', (e) => {
        const $dropSelect = $(e.currentTarget).find('.navbar-right .drop-select')
        if ($dropSelect.hasClass('open')) {
          $dropSelect.slideUp(400).fadeOut()
          $dropSelect.addClass('closed')
          $dropSelect.removeClass('open')
        }
      })
    })
  }
}

export default Header
