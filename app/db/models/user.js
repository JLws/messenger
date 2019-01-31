const mongoose = require('mongoose')

module.exports = mongoose.model('User', {
  username: String,
  password: String,
  name: {
    type: String,
    default: ''
  },
  surname: {
    type: String,
    default: ''
  },
  friends: {
    type: [String],
    default: []
  }
})
