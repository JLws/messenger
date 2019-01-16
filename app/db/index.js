module.exports = (db) => {
  db.connect("mongodb://localhost:27017/passport", { useNewUrlParser: true })

  db.connection.on('error', (err) => {
    console.error('[Mongo] Database connection error: ' + err)
    process.exit(2)
  })

  db.connection.on('connected', () => {
    console.info('[Mongo] Successfully connected')
  })
}
