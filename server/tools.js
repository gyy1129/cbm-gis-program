const fs = require('fs')
const path = require('path')

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
      } else {
        exists = false
      }
    })
  })
  return exists
}

module.exports = {
  readFileList,
  repeat
}
