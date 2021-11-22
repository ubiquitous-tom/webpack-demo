import Backbone from 'backbone'
// import $ from 'jquery'
import 'bootstrap'
// import 'fancybox'
import 'bootstrap/dist/css/bootstrap.css'
// import 'fancybox/dist/css/jquery.fancybox.css'

import './app.css'

// import 'common/template'
import 'common/handlebars'
// import { tagName, template, on } from 'common/decorators'

import InitializeApp from 'common/models/initializedapp'
import Workspace from 'routers/router'
import ATVModel from 'common/model'

import Header from 'shared/header'
import Footer from 'shared/footer'
import Navigation from 'shared/navigation'
import Dispatcher from 'common/dispatcher'
import ATVView from './components/common/view'

$(function () {
  let dispatcher = new Dispatcher()
  const initializeApp = new InitializeApp({ dispatcher: dispatcher })
  initializeApp.on('sync', (model) => {
    console.log('dispatcher', dispatcher)
    // console.log(model)
    // console.log(model.attributes)
    const atvModel = new ATVModel(model.attributes, { dispatcher: dispatcher })
    // console.log(atvModel, atvModel.model)
    // const atvView = new ATVView({ model: atvModel, dispatcher: dispatcher })
    const atvView = new ATVView({ dispatcher: dispatcher })
    new Workspace({ model: model, dispatcher: dispatcher })

    console.log('main entry')
    const navigation = new Navigation({ model: model })
    const header = new Header({ model: model })
    const footer = new Footer()

    Backbone.history.start()
  })
})

