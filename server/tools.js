const fs = require('fs')
const path = require('path')
const pool = require('./db.js')

function readFileList(dir) {
  let filesList = []
  const files = fs.readdirSync(dir)

  files.forEach(item => {
    var fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList) //递归读取文件
    } else {
      filesList.push(fullPath)
    }
  })
  return filesList
}

function repeat(exists, files, allFiles) {
  files.file.forEach(file => {
    allFiles.find(item => {
      let name = item.split('\\')[1]
      if (name === file.originalFilename) {
        exists = true
        return exists
      } else {
        exists = false
        return exists
      }
    })
  })
  return exists
}

async function insertData(tablename, fields) {
  let header = []
  header.push('type')
  for (let k in fields[0]['properties']) {
    if (fields[0]['properties'][k] !== null) {
      header.push(k)
    }
  }
  // console.log(header)
  const q = `CREATE TABLE ` + tablename + `( ` + header.join(' VARCHAR(255) NOT NULL,') + ` VARCHAR(255) NOT NULL);`
  // console.log(q)
  await pool.query(q)

  for (let obj of fields) {
    let field = []
    let value = []
    let num = []
    let count = 0
    count++
    field.push('type')
    value.push(obj.geometry.type)
    num.push('$' + count)
    for (let k in obj['properties']) {
      if (obj['properties'][k] !== null) {
        count++
        field.push(k)
        value.push(obj['properties'][k])
        num.push('$' + count)
      }
    }
    // console.log('---------', field)
    let str = 'insert into ' + tablename + '(' + field.join(',') + ') values(' + num.join(',') + ')'
    // console.log(str)
    await pool.query(str, value, function (err, result) {
      if (err) {
        console.log(err)
      } else {
        if (result.rows != undefined) result.rows
      }
    })
  }
}
module.exports = {
  readFileList,
  repeat,
  insertData
}
