const pool = require('./db.js')

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
          baidu_lat: row.baidu_lat
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

module.exports = {
  login,
  register,
  getUserInfo,
  cbmProperty,
  cbmGas,
  wellPosition
}
