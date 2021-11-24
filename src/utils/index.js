import moment from 'moment'
// ================================================== 导出为Excel
export const EXPORT_ALL = function (tabelHeadArr, list, name) {
  const _ = require('lodash')
  const allColumns = []
  tabelHeadArr = _.cloneDeep(tabelHeadArr)
  for (const val of tabelHeadArr) {
    if (val.children) {
      val.children.push(val.children.shift()) // 表头数据的第一位移至最后一位
      for (const v of val.children) {
        const obj = Object.assign({}, v)
        obj.label = `${val.label}_${v.label}`
        allColumns.push(obj)
      }
    } else {
      allColumns.push(val)
    }
  }
  var currentTime = moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
  var columnNames = []
  var columnValues = []
  for (var i = 0; i < allColumns.length; i++) {
    columnNames[i] = allColumns[i].label
    columnValues[i] = allColumns[i].prop
  }
  require.ensure([], () => {
    const { export_json_to_excel } = require('@/vendor/Export2Excel')
    const eHeader = columnNames
    const filterVal = columnValues
    const data = formatJson(filterVal, list)
    export_json_to_excel(eHeader, data, `${name}_${currentTime}`)
  })
}
const formatJson = function (filterVal, list) {
  return list.map(v => filterVal.map(j => v[j]))
}

// ================================================== 导出为csv
export const EXPORT_CSV = function (exportData, fileName) {
  try {
    if (MyBrowserIsIE()) {
      // IE10以及Edge浏览器
      var BOM = '\uFEFF'
      // 文件转Blob格式
      var csvData = new Blob([BOM + exportData], { type: 'text/csv' })
      navigator.msSaveBlob(csvData)
    } else {
      let csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + exportData
      // 非ie 浏览器
      createDownLoadClick(csvContent, fileName + '.csv')
    }
  } catch (err) {
    alert(err)
  }
}
//创建a标签下载
const createDownLoadClick = function (content, fileName) {
  const link = document.createElement('a')
  link.href = encodeURI(content)
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
// 判断是否IE浏览器
const MyBrowserIsIE = function () {
  let isIE = false
  if (navigator.userAgent.indexOf('compatible') > -1 && navigator.userAgent.indexOf('MSIE') > -1) {
    // ie浏览器
    isIE = true
  }
  if (navigator.userAgent.indexOf('Trident') > -1) {
    // edge 浏览器
    isIE = true
  }
  return isIE
}
