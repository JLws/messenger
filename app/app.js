const express = require('express')
const path = require('path')

class App {
  constructor () {
    this.expressApp = express()
    this.expressApp.set('view engine', 'hbs')
    this.expressApp.set('views', 'templates')
    this.loadRoutes()
  }

  loadRoutes () {
    let app = this.expressApp

    this.expressApp.use(express.static('templates'))

    app.get('/', (request, response) => {
      response.render('index')
    })

    app.get('/signup', (request, response) => {
      response.render('signup')
    })

    app.get('/signin', (request, response) => {
      response.render('signin')
    })
  }
}

module.exports = App
