const express = require('express')
const cors = require('cors')
const app = express()
const api = require('./api')
const JwtUtil = require('./jwt')

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
}
app.use(allowCrossDomain)

app.use(function (req, res, next) {
  // 我这里知识把登陆和注册请求去掉了，其他的多有请求都需要进行token校验
  if (req.url != '/login' && req.url != '/register') {
    let token = req.headers.authorization
    // let token = req.headers.authorization.replace('Bearer ', '') // postman token测试
    // console.log('token:', token)
    let jwt = new JwtUtil(token)
    let result = jwt.verifyToken()
    // 如果考验通过就next，否则就返回登陆信息不正确
    if (result == 'err') {
      res.status(403).send({ status: false, message: '登录已过期,请重新登录' })
    } else {
      next()
    }
  } else {
    next()
  }
})

app.post('/login', api.login)
app.post('/register', api.register)
app.post('/getUserInfo', api.getUserInfo)

app.get('/data/cbmProperty', api.cbmProperty)
app.get('/data/cbmGas', api.cbmGas)
app.get('/data/wellPosition', api.wellPosition)

app.post('/gnn/uploadCSV', api.uploadCSV)
app.post('/gnn/getElbowResult', api.getElbowResult)
app.post('/gnn/getClusterResult', api.getClusterResult)
app.post('/gnn/displaywell', api.displaywell)
app.post('/gnn/getConnect', api.getConnect)
app.post('/gnn/getAdjacent', api.getAdjacent)
app.post('/gnn/getPrediction', api.getPrediction)
app.get('/gnn/getTestAllImg', api.getTestAllImg)
app.get('/gnn/getTest90DayImg', api.getTest90DayImg)

app.post('/gis/uploadGeoJson', api.uploadGeoJson)
app.post('/gis/uploadDatabase', api.uploadDatabase)
app.post('/gis/layerProperty', api.layerProperty)
app.get('/gis/readOriginGeo', api.readOriginGeo)

app.listen(3000, err => {
  if (!err) {
    console.log('project running on port 3000...')
  } else {
    console.log(err)
  }
})
