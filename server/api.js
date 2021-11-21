const pool = require('./db.js')
const fs = require('fs')
// const path = require('path')
const multiparty = require('multiparty')
const exec = require('child_process').exec
// const execSync = require('child_process').execSync
const { readFileList, repeat } = require('./tools')

// 登录
const login = async (request, response) => {
  const q = `SELECT * FROM userinfo WHERE name = $1 AND password = $2`
  try {
    let values = [request.body.username, request.body.password]
    let res = await pool.query(q, values)
    if (res.rowCount !== 0) {
      response
        .status(200)
        .json({ status: true, message: '登录成功！', results: { id: res.rows[0].id, username: res.rows[0].name } })
    } else {
      response.status(200).json({ status: false, message: '用户名或者密码出错！' })
    }
  } catch (err) {
    console.log(err.stack)
  }
}

// 注册
const register = async (request, response) => {
  const q1 = `SELECT * FROM userinfo WHERE name = $1`
  const q2 = `INSERT INTO userinfo (name, password) VALUES($1,$2) `
  try {
    let res1 = await pool.query(q1, [request.body.username])
    if (res1.rowCount !== 0) {
      response.status(200).json({ status: false, message: '用户名已注册，请重新输入' })
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
      response.status(200).json({ status: false, message: '暂无数据', results: res.rows })
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
      response.status(200).json({ status: false, message: '暂无数据', results: res.rows })
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
      response.status(200).json({ status: false, message: '暂无数据', results: res.rows })
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
    // response.status(200).json({ exec: stdout })
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
      res.send({ status: false, message: '上传出现错误，上传失败！' })
    } else {
      if (!files.file) {
        res.send({ status: false, message: '上传失败' })
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
      res.send({ status: false, message: '该文件名已经存在，请重新上传！' })
    } else {
      res.send({ status: true, message: '上传成功' })
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
  if (!exists) response.status(200).json({ status: false, message: '该文件没有上传' })

  // 异步执行
  exec('python ./python/KmeansElbow.py' + ' ' + maxK + ' ' + fileNameMax + ' ', function (error, stdout, stderr) {
    if (error) {
      console.info('stderr : ' + stderr)
      response.status(200).json({ status: false, results: stderr })
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
  if (!exists) response.status(200).json({ status: false, message: '该文件没有上传' })

  // 异步执行
  exec('python ./python/Kmeans.py' + ' ' + bestK + ' ' + fileNameBest + ' ', function (error, stdout, stderr) {
    if (error) {
      console.info('stderr : ' + stderr)
      response.status(200).json({ status: false, results: stderr })
    }
    console.log('exec: ' + stdout)
    let value = stdout.split('[')[1].split(']')[0].split(',')
    let result = value.map(item => Number(item))
    console.log(result)
    response.status(200).json({ status: true, results: result })
  })
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
  getClusterResult
}
