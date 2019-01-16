const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const Authentication = require('./authentication')
const Database = require('./db')
const mongoose = require('mongoose')

class App {
  constructor () {
    this.expressApp = express()

    this.expressApp.set('view engine', 'hbs')
    this.expressApp.set('views', 'templates')
    this.expressApp.use(express.static('templates'))

    this.expressApp.use(bodyParser.json())
    this.expressApp.use(bodyParser.urlencoded({ extended: true }))
    this.expressApp.use(cookieParser())

    Database(mongoose) // load db
    Authentication(this.expressApp, passport) // implement authentication
    this.loadRoutes() // init routes
  }

  loadRoutes () {
    let app = this.expressApp

    app.get('/', (request, response) => {
      response.render('index')
    })

    app.get('/signup', (request, response) => {
      response.render('signup', { message: request.flash('message') })
    })

    app.post('/signup', passport.authenticate('signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup'
      })
    )

    app.get('/signin', (request, response) => {
      response.render('signin', { message: request.flash('message') })
    })

    app.post('/signin', passport.authenticate('login', {
      successRedirect: '/profile',
      failureRedirect: '/signin'
    }))
  }
}

module.exports = App
