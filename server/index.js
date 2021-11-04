const express = require('express')
const cors = require('cors')
const app = express()
const api = require('./api')

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.post('/login', api.login)
app.post('/register', api.register)
app.post('/data/cbmproperty', api.cbmProperty)
app.get('/download/exportpro', api.exportpro)

app.listen(3000, err => {
  if (!err) {
    console.log('project running on port 3000...')
  } else {
    console.log(err)
  }
})
