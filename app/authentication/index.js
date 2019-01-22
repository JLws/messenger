const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const login = require('./login')
const signup = require('./signup')
const bcrypt = require('bcrypt-node')
const User = require('../models/user')
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

  // init strategy
  login(passport)
  signup(passport)
}
