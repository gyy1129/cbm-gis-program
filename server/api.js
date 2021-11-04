const nodeExcel = require('excel-export')
const pool = require('./db.js')

const login = async (request, response) => {
  const q = `SELECT * FROM userinfo WHERE name = $1 AND password = $2`
  try {
    let values = [request.body.username, request.body.password]
    let res = await pool.query(q, values)
    if (res.rowCount !== 0) {
      response.status(200).json({ status: true, message: '登录成功！' })
    } else {
      response.status(200).json({ status: false, message: '用户名或者密码出错！' })
    }
  } catch (err) {
    console.log(err.stack)
  }
}

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

const exportpro = async (request, response) => {
  let conf = {} //创建一个写入格式map，其中cols(表头)，rows(每一行的数据)
  //手动创建表头中的内容
  const cols = [
    '井名',
    '井型',
    '井底坐标X',
    '井底坐标Y',
    '渗透率',
    '孔隙度（%）',
    '粘土（%）',
    '挥发分（%）',
    '煤埋深',
    '含气量',
    '含气饱和度（%）',
    '顶板砂岩厚度',
    '底板砂岩厚度',
    '煤层厚度',
    '灰分（%）',
    '总压裂液量',
    '停泵压力',
    '加砂量',
    '储层压力',
    '解吸压力',
    '降液速度',
    '排采天数'
  ]
  conf.cols = [] //在conf中添加cols
  for (let i = 0; i < cols.length; i++) {
    let tits = {} //创建表头数据所对应的类型,其中包括 caption内容 type类型
    tits.caption = cols[i] // 添加内容
    tits.type = 'string' //添加对应类型，这类型对应数据库中的类型，入number，data但一般导出的都是转换为string类型的
    conf.cols.push(tits) //将每一个表头加入cols中
  }
  const q = `SELECT * FROM cbmproperty`
  try {
    let res = await pool.query(q)
    //创建一个和表头对应且名称与数据库字段对应数据，便于循环取出数据
    let rows = [
      'well_name',
      'well_type',
      'coordinate_x',
      'coordinate_y',
      'permeability',
      'porosity',
      'clay',
      'volatiles',
      'burial_depth',
      'gas_content',
      'gas_saturation',
      'roof_sandstone',
      'floor_sandstone',
      'coal_thickness',
      'ash',
      'total_fracturing',
      'stop_pump_pressure',
      'sand',
      'reservoir_pressure',
      'desorption_pressure',
      'drop_speed',
      'production_days'
    ]
    let datas = [] //用于承载数据库中的数据
    //循环数据库得到的数据
    for (let i = 0; i < res.rows.length; i++) {
      let row = [] //用来装载每次得到的数据
      //内循环取出每个字段的数据
      for (let j = 0; j < rows.length; j++) {
        row.push(res.rows[i][rows[j]].toString())
      }
      //将每一个{ }中的数据添加到承载中
      datas.push(row)
    }
    conf.rows = datas
    //将所有数据写入nodeExcel中
    let result = nodeExcel.execute(conf)
    //设置响应头，在Content-Type中加入编码格式为utf-8即可实现文件内容支持中文
    response.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8')
    //设置下载文件命名，中文文件名可以通过编码转化写入到header中。
    response.setHeader('Content-Disposition', 'attachment; filename=' + encodeURI('煤层气属性表') + '.xlsx')
    //将文件内容传入
    response.end(result, 'binary')
  } catch (err) {
    console.log(err.stack)
  }
}
module.exports = {
  login,
  register,
  cbmProperty,
  exportpro
}
