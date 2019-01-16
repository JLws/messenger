const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt-node')

module.exports = (passport) => {
  passport.use('signup', new LocalStrategy({
      passReqToCallback: true
    },
    (req, username, password, done) => {
      let findOrCreateUser = () => {
        User.findOne({'username': username}, (err, user) => {
          if (err) {
            console.log('Error signup '+err)
            return done(err, false)
          }

          if ( username.length < 4 || username.length > 24 ) {
            return done(err, false, req.flash('message', 'Login must contain 4-24 characters.'))
          }
          var confPass = req.body.confirmPassword
          if ( (password.length < 6 || password.length > 24) || (confPass.length < 6 || confPass.length > 24) ) {
            return done(err, false, req.flash('message', 'Password must contain 6-24 characters.'))
          }

          if ( user ) {
            return done(err, false, req.flash('message', 'User already exists.'))
          } else {
            if( confPass !== password ) {
              return done(err, false, req.flash('message', 'Passwords don\'t match.'))
            }
            var newUser = new User()
            newUser.username = username;
            newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
            newUser.save( (err) => {
              if (err) {
                console.log('Error ' + err)
                throw err;
              }
              console.log('Add user: ' + username)
              return done(false, newUser)
              }
            )
          }
        })
      }
      process.nextTick(findOrCreateUser)
    }
  ))
}
