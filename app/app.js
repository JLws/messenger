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
      if ( request.query.people ) {
        if ( request.query.people === user.username ) {
          response.redirect('/profile')
        } else if ( request.query.addfriend ) {
          user.friends.push(request.query.people)
          this.userUpdate(user.username, user)
          response.redirect('/profile')
        } else if ( request.query.rmfriend ) {
          user.friends = user.friends.filter(friend => friend !== request.query.people)
          this.userUpdate(user.username, user)
          response.redirect('/profile')
        } else {
          this.showUser(request, response, request.body.people)
        }
      } else {
        response.render('profile', {
          username: user.username,
          name: user.name,
          surname: user.surname,
          userList: user.friends
        })
      }
    })

    app.post('/profile', this.isAuthenticated, this.loadUser, (request, response) => {
      if ( request.query.people === undefined ) {
        var user = request.currentUser
        if ( request.body.searchName != '' ) {
          this.findUsers(request, response)
        } else {
          response.render('profile', {
            username: user.username,
            name: user.name,
            surname: user.surname
          })
        }
      }
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

    app.get('/chat', this.isAuthenticated, this.loadUser, (request, response) => {
      if ( request.query.name !== undefined ) {
        this.startChat(request, response)
      } else {
        response.redirect('/profile')
      }
    })
  }
}

module.exports = App
