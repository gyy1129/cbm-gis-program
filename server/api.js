const pool = require('./db.js')
 
const login = async (request, response) => {
  const q = `SELECT * FROM userinfo WHERE name = $1 AND password = $2`
  try {
    values = [request.body.username,request.body.password]
    let res = await pool.query(q,values)
    if(res.rowCount!==0){
      response.status(200).json({status:true,message:'登录成功！'})
    }else{
      response.status(200).json({status:false,message:'用户名或者密码出错！'})
    }
  }
  catch (err) {
    console.log(err.stack)
  }
}

const register = async (request, response) => {
  const q1 = `SELECT * FROM userinfo WHERE name = $1`
  const q2 = `INSERT INTO userinfo (name, password) VALUES($1,$2) `
  try {
    let res1 = await pool.query(q1, [request.body.username])
    if(res1.rowCount!==0){
      response.status(200).json({status:false,message: '用户名已注册，请重新输入'})
      return
    }
    await pool.query(q2, [request.body.username,request.body.password])
    response.status(200).json({status:true,message: '注册成功！'})
  }
  catch (err) {
    console.log(err.stack)
  }
}
module.exports = {
  login,
  register,
}