const Application = require('./app')

let app = new Application()

app.expressApp.listen(3000, () => {
  console.log('[Server] running on 3000 port')
})
