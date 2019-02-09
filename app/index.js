const Application = require('./app')

let app = new Application()

app.server.listen(3000, () => {
  console.log('[Server] running on 3000 port')
})

app.socketApp.on('connection', (socket) => {
  var logged = false
  socket.on('accept', (data) => {
    if ( logged )
      return
    var checkUser = () => {
      let i = 0
      while ( app.onlines.length > i) {
        if ( app.onlines[i].name === data.name ) {
          return app.onlines[i]
        }
        i++
      }
    }
    var user = checkUser()
    if ( user !== undefined ) {
      if ( user.logged === true ) return socket.emit('login', { connected: false })
      console.log(data.name + ' connected.')
      socket.username = user.name
      socket.friend = user.friendname
      user.logged = logged = true
      user.id = socket.id
      socket.emit('login', { connected: true, user: user.salt })
      socket.emit(user.salt, { sender: 'Server', message: 'Welcome!'})
    } else {
      socket.emit('login', { connected: false })
    }
  socket.on('message', (data) => {
    if ( logged ) {
      app.onlines.map(user => {
        if ( user.name === data.toUser ) {
          app.socketApp.sockets.sockets[user.id].emit(user.salt, {
            sender: data.name,
            message: data.message
          })
        }
      })
    }
  })

  socket.on('disconnect', () => {
    if ( logged ) {
      app.onlines = app.onlines.filter(user => user.name !== socket.username)
      console.log(socket.username + ' disconnected.')
    }
  })
})
