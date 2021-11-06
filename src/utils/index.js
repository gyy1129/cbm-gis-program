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
