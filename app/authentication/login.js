const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt-node')

module.exports = (passport) => {
  passport.use('login', new LocalStrategy({
      passReqToCallback: true
    },
    (req, username, password, done) => {
      User.findOne({ 'username': username },
        (err, user) => {
          if ( err )
            return done(err)

          if ( !user ) {
            return done(null, false, req.flash('message','User not found.'))
          }

          if ( !bcrypt.compareSync(password, user.password) ) {
            return done(null, false, req.flash('message','Invalid password.'))
          }

          return done(null, user)
        }
      )
    }
  ))
}
