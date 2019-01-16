const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const login = require('./login')
const signup = require('./signup')
const bcrypt = require('bcrypt-node')
const User = require('../models/user')
const flash = require('connect-flash')

module.exports = (expressApp, passport) => {
  expressApp.use(flash())
  expressApp.use(session({
    store: new MongoStore({
      url: "mongodb://localhost:27017/passport"
    }),
    secret: bcrypt.genSaltSync(10),
    resave: false,
    saveUninitialized: false
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

  login(passport)
  signup(passport)
}
