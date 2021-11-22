const express = require('express')
const cors = require('cors')
const app = express()
const api = require('./api')

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.post('/login', api.login)
app.post('/register', api.register)
app.post('/getUserInfo', api.getUserInfo)
app.post('/data/cbmproperty', api.cbmProperty)
app.post('/data/cbmgas', api.cbmGas)
app.post('/data/wellposition', api.wellPosition)
// app.get('/download/exportpro', api.exportpro)
app.get('/python', api.python)
app.post('/uploadKmeans', api.uploadKmeans)
app.post('/gnn/getElbowResult', api.getElbowResult)
app.post('/gnn/getClusterResult', api.getClusterResult)
app.post('/gnn/displaywell', api.displaywell)
app.post('/gnn/getAdjacent', api.getAdjacent)

app.listen(3000, err => {
  if (!err) {
    console.log('project running on port 3000...')
  } else {
    console.log(err)
  }
})
