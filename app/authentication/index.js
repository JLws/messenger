const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const login = require('./login')
const signup = require('./signup')
const bcrypt = require('bcrypt-node')
const User = require('../db/models/user')
const flash = require('connect-flash')

module.exports = (lexical, passport) => {
  expressApp = lexical.expressApp
  expressApp.use(flash())
  expressApp.use(session({
    store: new MongoStore({
      url: "mongodb://localhost:27017/passport",
      ttl: 60 * 60 * 2
    }),
    secret: bcrypt.genSaltSync(10),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 100 * 60 * 60 * 2,
    }
  }))
  expressApp.use(passport.initialize())
  expressApp.use(passport.session())

  passport.serializeUser( (user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser( (id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })

  lexical.loadUser = (request, response, next) => {
    if ( request.session.passport.user ) {
      User.findById(request.session.passport.user, (err, user) => {
        if ( err ) {
            console.log('Error load user: ' + err)
            response.redirect('/signin')
        }
        if ( user ) {
          request.currentUser = user
          next()
        } else {
          response.redirect('/signin')
        }
      })
    } else {
      response.redirect('/signin')
    }
  }

  lexical.changeUser = (request, response) => {
    let user = request.currentUser
    var message = ''
    if ( request.body.name.length < 24 ) {
      if ( request.body.surname.length < 24 ) {
        if ( request.body.password != '' || request.body.confirmPassword != '' ) {
          if ( (request.body.password.length >= 6 && request.body.password.length <= 24) ) {
            if ( request.body.password === request.body.confirmPassword ) {
              user.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10), null)
              user.name = request.body.name
              user.surname = request.body.surname
              User.updateOne({ username: user.username}, user, (err, result) => {
                if ( err ) return message = 'Error connecting.'
                message = 'Successful saved.'
              })
            } else {
              message = 'Passwords don\'t match.'
            }
          } else {
              message = 'Password must contain 6-24 characters.'
          }
        } else {
          user.name = request.body.name
          user.surname = request.body.surname
          User.updateOne({ username: user.username}, user, (err, result) => {
            if ( err ) return message = 'Error connecting.'
            message = 'Successful saved.'
          })
        }
      } else {
          message = 'Surname must contain 0-24 characters.'
      }
    } else {
      message = 'Name must contain 0-24 characters.'
    }
    response.render('settings', {
      login: user.username,
      name: user.name,
      surname: user.surname,
      error: message
    })
  }

  // init strategy
  login(passport)
  signup(passport)
}
