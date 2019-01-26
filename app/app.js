const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const Authentication = require('./authentication')
const Database = require('./db')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

class App {
  constructor () {
    this.expressApp = express()

    this.expressApp.set('view engine', 'hbs')
    this.expressApp.set('views', 'templates')
    this.expressApp.use(express.static('templates'))

    this.expressApp.use(bodyParser.json())
    this.expressApp.use(bodyParser.urlencoded({ extended: true }))

    Database(mongoose) // load db
    Authentication(this, passport) // implement authentication
    this.isAuthenticated = (request, response, next) => {
      console.log(request)
      if( request.isAuthenticated() )
        return next()
      response.redirect('signin')
    }
    this.expressApp.use(cookieParser())
    this.loadRoutes() // init routes
  }

  loadRoutes () {
    let app = this.expressApp

    app.get('/', (request, response) => {
      response.render('index')
    })

    app.get('/signup', (request, response) => {
      if ( request.isAuthenticated() ) {
        response.redirect('/profile')
      }
      response.render('signup', { message: request.flash('message') })
    })

    app.get('/profile', this.isAuthenticated, this.loadUser, (request, response) => {
      let user = request.currentUser
      response.render('profile', {
        username: user.username,
        name: user.name,
        surname: user.surname
      })
    })

    app.post('/signup', passport.authenticate('signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
      })
    )

    app.get('/signin', (request, response) => {
      if ( request.isAuthenticated() ) {
        response.redirect('/profile')
      }
      response.render('signin', { message: request.flash('message') })
    })

    app.post('/signin', passport.authenticate('login', {
      successRedirect: '/profile',
      failureRedirect: '/signin',
      failureFlash: true
    }))

    app.get('/signout', this.isAuthenticated, (request, response) => {
      request.logout()
      response.redirect('/')
    })

    app.get('/settings',this.isAuthenticated, this.loadUser, (request, response) => {
      let user = request.currentUser
      response.render('settings', {
        login: user.username,
        name: user.name,
        surname: user.surname
      })
    })

    app.post('/settings',this.isAuthenticated, this.loadUser, (request, response) => {
      this.changeUser(request, response)
    })
  }
}

module.exports = App
