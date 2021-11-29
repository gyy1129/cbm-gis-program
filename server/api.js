const pool = require('./db.js')
const fs = require('fs')
// const path = require('path')
const multiparty = require('multiparty')
const exec = require('child_process').exec
// const execSync = require('child_process').execSync
const { readFileList, repeat } = require('./tools')
const JwtUtil = require('./jwt') // 引入jwt token工具

// 登录
const login = async (request, response) => {
  const q1 = `SELECT * FROM userinfo WHERE name = $1`
  const q2 = `SELECT * FROM userinfo WHERE name = $1 AND password = $2`
  try {
    let values = [request.body.username, request.body.password]
    let res1 = await pool.query(q1, [values[0]])
    let res2 = await pool.query(q2, values)
    if (res1.rowCount !== 0) {
      if (res2.rowCount !== 0 && res2.rows[0].password === values[1]) {
        // 登陆成功，添加token验证
        let user = { id: res2.rows[0].id, name: res2.rows[0].name }
        // 将用户传入并生成token
        let jwt = new JwtUtil(user)
        let token = jwt.generateToken()
        response.status(200).json({
          status: true,
          message: '登录成功！',
          token: token,
          results: { id: res2.rows[0].id, username: res2.rows[0].name }
        })
      } else {
        response.status(400).json({ status: false, message: '账号密码错误！' })
      }
    } else {
      response.status(404).json({ status: false, message: '账号不存在！' })
    }
  } catch (err) {
    console.log(err.stack)
    response.status(500).json({ status: false, message: '账号密码错误！' })
  }
}

// 注册
const register = async (request, response) => {
  const q1 = `SELECT * FROM userinfo WHERE name = $1`
  const q2 = `INSERT INTO userinfo (name, password) VALUES($1,$2) `
  try {
    let res1 = await pool.query(q1, [request.body.username])
    if (res1.rowCount !== 0) {
      response.status(400).json({ status: false, message: '用户名已注册，请重新输入' })
      return
    }
    await pool.query(q2, [request.body.username, request.body.password])
    response.status(200).json({ status: true, message: '注册成功！' })
  } catch (err) {
    console.log(err.stack)
  }
}

// 获取 用户信息
const getUserInfo = async (request, response) => {
  const q = `SELECT * FROM userinfo WHERE id = $1`
  try {
    let values = [request.body.id]
    let res = await pool.query(q, values)
    response.status(200).json({ status: true, username: res.rows[0].name })
  } catch (err) {
    console.log(err.stack)
  }
}

//  获取 煤层气属性数据
const cbmProperty = async (request, response) => {
  const q = `SELECT * FROM cbmproperty`
  try {
    let res = await pool.query(q)
    if (res.rowCount !== 0) {
      response.status(200).json({ status: true, results: res.rows, resultsCount: res.rowCount })
    } else {
      response.status(404).json({ status: false, message: '暂无数据', results: res.rows })
    }
  } catch (err) {
    console.log(err.stack)
  }
}

//  获取 煤层气属性数据
const cbmGas = async (request, response) => {
  const q = `SELECT * FROM cbmgas`
  try {
    let res = await pool.query(q)
    if (res.rowCount !== 0) {
      response.status(200).json({ status: true, results: res.rows, resultsCount: res.rowCount })
    } else {
      response.status(404).json({ status: false, message: '暂无数据', results: res.rows })
    }
  } catch (err) {
    console.log(err.stack)
  }
}

//  获取 煤层气井 位置
const wellPosition = async (request, response) => {
  const q = `SELECT * FROM cbmproperty`
  try {
    let res = await pool.query(q)
    if (res.rowCount !== 0) {
      let results = []
      res.rows.map(row =>
        results.push({
          id: row.id,
          well_name: row.well_name,
          baidu_lng: row.baidu_lng,
          baidu_lat: row.baidu_lat,
          showFlag: false
        })
      )
      response.status(200).json({ status: true, results: results, resultsCount: res.rowCount })
    } else {
      response.status(404).json({ status: false, message: '暂无数据', results: res.rows })
    }
  } catch (err) {
    console.log(err.stack)
  }
}
//  python 测试
// eslint-disable-next-line no-unused-vars
const python = async (request, response) => {
  const exec = require('child_process').exec
  const execSync = require('child_process').execSync
  // 异步执行
  exec('python test.py', function (error, stdout, stderr) {
    if (error) {
      console.info('stderr : ' + stderr)
    }
    // console.log('exec: ' + stdout)
    // response.status(404).json({ exec: stdout })
  })
  // 同步执行
  const output = execSync('python test.py')
  // console.log('sync: ' + output.toString())
  // console.log('over')
  response.status(200).json({ sync: output.toString() })
}

//  上传文件
const uploadKmeans = async (req, res) => {
  //利用multiparty中间件获取文件数据
  let uploadDir = './' //这个不用改，因为并不是保存在这个目录下，这只是作为中间目录，待会要重命名文件到指定目录的
  let form = new multiparty.Form()

  form.uploadDir = uploadDir
  form.keepExtensions = true //是否保留后缀
  form.parse(req, async (err, fields, files) => {
    //其中fields表示你提交的表单数据对象，files表示你提交的文件对象
    //这里是save_path 就是前端传回来的 path 字段，这个字段会被 multiparty 中间件解析到 fields 里面 ，这里的 fields 相当于 req.body 的意思
    let save_path = fields.path

    if (err) {
      res.status(500).json({ status: false, message: '上传出现错误，上传失败！' })
    } else {
      if (!files.file) {
        res.status(500).json({ status: false, message: '上传失败' })
      } else {
        //所有文件重命名，（因为不重名的话是随机文件名）
        files.file.forEach(file => {
          //  file.path 文件路径
          //  save_path+originalFilename   指定上传的路径 + 原来的名字
          fs.rename(file.path, save_path + file.originalFilename, function (err) {
            err ? console.log('重命名失败') : console.log('重命名成功')
          })
        })
        //返回所有上传的文件信息
        // err ? res.send({ code: 0, message: '上传失败' }) : res.send({ code: 1, message: '上传成功' })
      }
    }
    // 读取public中所有的文件 判断是否有重复的文件名
    let allFiles = readFileList('./public')
    let exists = false
    exists = await repeat(exists, files, allFiles)
    if (exists) {
      res.status(500).json({ status: false, message: '该文件名已经存在，请重新上传！' })
    } else {
      res.status(200).json({ status: true, message: '上传成功' })
    }
  })
}

// 执行KmeansElbow.py文件
const getElbowResult = async (request, response) => {
  let maxK = request.body.maxK
  let fileNameMax = request.body.fileNameMax
  console.log(request.body)
  // 读取public中所有的文件 判断是否有重复的文件名
  let allFiles = readFileList('./public')
  let exists = false
  allFiles.find(item => {
    let name = item.split('\\')[1]
    if (name === fileNameMax + '.csv') exists = true
  })
  if (!exists) {
    response.status(404).json({ status: false, message: '该文件没有上传' })
    return
  }

  // 异步执行
  exec('python ./python/KmeansElbow.py' + ' ' + maxK + ' ' + fileNameMax + ' ', function (error, stdout, stderr) {
    if (error) {
      console.info('stderr : ' + stderr)
      response.status(404).json({ status: false, results: stderr })
    }
    console.log('exec: ' + stdout)
    let value = stdout.split('[')[1].split(']')[0].split(',')
    let result = value.map(item => Number(item))
    response.status(200).json({ status: true, results: result })
  })
  // 同步执行
  // const output = execSync('python test.py')
  // // console.log('sync: ' + output.toString())
  // // console.log('over')
  // response.status(200).json({ sync: output.toString() })
}
// 执行KmeansElbow.py文件
const getClusterResult = async (request, response) => {
  let bestK = request.body.bestK
  let fileNameBest = request.body.fileNameBest
  console.log(request.body)
  // 读取public中所有的文件 判断是否有重复的文件名
  let allFiles = readFileList('./public')
  let exists = false
  allFiles.find(item => {
    let name = item.split('\\')[1]
    if (name === fileNameBest + '.csv') exists = true
  })
  if (!exists) {
    response.status(404).json({ status: false, message: '该文件没有上传' })
    return
  }

  // 异步执行
  exec('python ./python/Kmeans.py' + ' ' + bestK + ' ' + fileNameBest + ' ', function (error, stdout, stderr) {
    if (error) {
      console.info('stderr : ' + stderr)
      response.status(404).json({ status: false, results: stderr })
    }
    console.log('exec: ' + stdout)
    let value = stdout.split('[')[1].split(']')[0].split(',')
    let result = value.map(item => Number(item))
    console.log(result)
    response.status(200).json({ status: true, results: result })
  })
}

// 读取上传文件 百度坐标 展示
const displaywell = async (request, response) => {
  let fileName = request.body.fileName
  // 读取public中所有的文件 判断是否有重复的文件名
  let allFiles = readFileList('./public')
  let exists = false
  allFiles.find(item => {
    let name = item.split('\\')[1]
    if (name === fileName + '.csv') exists = true
  })
  if (!exists) {
    response.status(404).json({ status: false, message: '该文件没有上传' })
    return
  }
  fs.readFile('public/' + fileName + '.csv', 'UTF-8', (err, data) => {
    if (err) {
      console.log(err)
      response.status(404).json({ status: false, message: err.message })
    }
    data = data.toString()
    let table = []
    let rows = []
    rows = data.split('\r\n')
    for (let i = 1; i < rows.length; i++) {
      table.push(rows[i].split(','))
    }
    let points = []
    table.map(item => {
      let point = {}
      point.well_name = item[0]
      point.baidu_lng = item[3]
      point.baidu_lat = item[4]
      points.push(point)
    })
    // console.log(points)
    response.status(200).json({ status: true, results: points, resultsCount: points.length, message: '读取文件成功！' })
  })
}

// 执行scope.py文件
const getConnect = async (request, response) => {
  let scopeVal = request.body.scopeVal
  let fileName = request.body.fileName
  console.log(request.body)
  // 读取public中所有的文件 判断是否有重复的文件名
  let allFiles = readFileList('./public')
  let exists = false
  allFiles.find(item => {
    let name = item.split('\\')[1]
    if (name === fileName + '.csv') exists = true
  })
  if (!exists) {
    response.status(404).json({ status: false, message: '该文件没有上传' })
    return
  }

  // 异步执行
  exec('python ./python/scope.py' + ' ' + scopeVal + ' ' + fileName + ' ', function (error, stdout, stderr) {
    if (error) {
      console.info('stderr : ' + stderr)
      response.status(404).json({ status: false, results: stderr })
    }
    // console.log('exec: ' + stdout)
    let value = stdout.split('[').slice(2)
    let valueArr = value.map(str => {
      let val = str.split(']')[0].split(',')
      return val
    })
    // console.log(valueArr)
    let list = []
    valueArr.map(val => {
      let obj1 = {}
      let obj2 = {}
      let listArr = []
      obj1.lng = Number(val[0])
      obj1.lat = Number(val[1])
      obj2.lng = Number(val[2])
      obj2.lat = Number(val[3])
      listArr.push(obj1)
      listArr.push(obj2)
      list.push(listArr)
    })
    console.log(list)
    response.status(200).json({ status: true, results: list, message: '井对获取成功！' })
  })
}

// 执行adjacentMatrix.py文件
const getAdjacent = async (request, response) => {
  let scopeVal = request.body.scopeVal
  let fileName = request.body.fileName
  console.log(request.body)
  // 读取public中所有的文件 判断是否有重复的文件名
  let allFiles = readFileList('./public')
  let exists = false
  allFiles.find(item => {
    let name = item.split('\\')[1]
    if (name === fileName + '.csv') exists = true
  })
  if (!exists) {
    response.status(404).json({ status: false, message: '该文件没有上传' })
    return
  }

  // 异步执行
  exec('python ./python/adjacentMatrix.py' + ' ' + scopeVal + ' ' + fileName + ' ', function (error, stdout, stderr) {
    if (error) {
      console.info('stderr : ' + stderr)
      response.status(404).json({ status: false, results: stderr })
    }
    // console.log('exec: ' + stdout)
    let value = stdout.split('\r\n')
    // 处理 井名
    let wellName = value[0].split('[')[1].split(']')[0].split(',')
    let wellName1 = []
    wellName.map(str => {
      let val = str.split("'")[1]
      let obj = {}
      obj.name = val
      wellName1.push(obj)
    })
    // console.log(wellName1)
    // 处理 井对
    let wellPair = value[1].split('[[')[1].split(']]')[0].split('], [')
    let wellPair1 = []
    wellPair.map(str => {
      let val = str.split("'")
      let obj = {}
      obj.source = val[1]
      obj.target = val[3]
      obj.name = 1
      wellPair1.push(obj)
    })
    // console.log(wellPair1)
    // 处理 邻接矩阵
    let value1 = value.slice(2)
    let allStr = ''
    value1.map(str => {
      allStr = allStr + str
    })
    let str = allStr.split('[array([')[1].split('])]')[0].split(']), array([')
    let adj = []
    str.map(val => {
      let val1 = val.split('., ')
      let val2 = val1.map(str => Number(str))
      adj.push(val2)
    })
    response
      .status(200)
      .json({ status: true, adjMatrix: adj, wellPair: wellPair1, wellName: wellName1, message: '生成邻接矩阵成功！' })
  })
}

// 执行TGCN_min.py文件
const getPrediction = async (request, response) => {
  let adjFile = request.body.adjFile
  let timeFile = request.body.timeFile
  let trainTime = request.body.trainTime
  console.log(request.body)
  // 读取public中所有的文件 判断是否有重复的文件名
  let allFiles = readFileList('./public')
  let exists = false
  allFiles.find(item => {
    let name = item.split('\\')[1]
    if (name === adjFile + '.csv' || name === timeFile + '.csv') exists = true
  })
  if (!exists) {
    response.status(404).json({ status: false, message: '该文件没有上传' })
    return
  }

  // 异步执行
  exec(
    'python ./python/TGCN_min.py' + ' ' + adjFile + ' ' + timeFile + ' ' + trainTime + ' ',
    function (error, stdout, stderr) {
      if (error) {
        console.info('stderr : ' + stderr)
        response.status(404).json({ status: false, results: stderr })
      }
      // console.log('exec: ' + stdout)
      fs.readFile('output/tgcn/test_result.csv', 'UTF-8', (err, data) => {
        if (err) {
          console.log(err)
          response.status(404).json({ status: false, message: err.message })
        }
        // data = data.toString()
        response.status(200).json({ status: true, preEvaluate: stdout, preExport: data, message: '预测结果生成！' })
      })
    }
  )
}

// 获取test_all.jpg图片转为base64
const getTestAllImg = async (request, response) => {
  const path = __dirname + '/' + '/output/tgcn/test_all.jpg'
  let imgBuffer = fs.readFileSync(path)
  let imgBase64 = imgBuffer.toString('base64')
  if (imgBase64) {
    response.status(200).json({ status: true, imgBase64: imgBase64, message: '图片获取成功' })
  } else {
    response.status(404).json({ status: false, message: '图片获取失败' })
  }
}
// 获取test_90day.jpg图片转为base64
const getTest90DayImg = async (request, response) => {
  const path = __dirname + '/' + '/output/tgcn/test_90day.jpg'
  let imgBuffer = fs.readFileSync(path)
  let imgBase64 = imgBuffer.toString('base64')
  if (imgBase64) {
    response.status(200).json({ status: true, imgBase64: imgBase64, message: '图片获取成功' })
  } else {
    response.status(404).json({ status: false, message: '图片获取失败' })
  }
}

module.exports = {
  login,
  register,
  getUserInfo,
  cbmProperty,
  cbmGas,
  wellPosition,
  python,
  uploadKmeans,
  getElbowResult,
  getClusterResult,
  displaywell,
  getConnect,
  getAdjacent,
  getPrediction,
  getTestAllImg,
  getTest90DayImg
}
