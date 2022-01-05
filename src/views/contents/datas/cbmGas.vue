<template>
  <div class="containter">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main" v-loading="loading" element-loading-text="结果马上就好啦！请耐心等待一下~">
      <el-card class="box-card">
        <el-button type="primary" size="medium" @click="onSearch" class="mb10">查询</el-button>
        <el-button type="primary" size="medium" @click="onExport" plain class="mb10">导出Excel</el-button>
        <el-table
          ref="tableRef"
          stripe
          border
          :data="frontEndPageChange"
          style="width: 100%"
          height="100px"
          v-tableHeight="{ bottomOffset: 60 }"
          :header-cell-style="{
            color: '#fff',
            fontWeight: 'bold',
            backgroundColor: '#687689',
            textAlign: 'center'
          }"
        >
          <template v-for="item in tableHead">
            <el-table-column
              :key="item.prop"
              :prop="item.prop"
              :label="item.label"
              :min-width="item.width"
              align="center"
              show-overflow-tooltip
              :resizable="false"
            ></el-table-column>
          </template>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="paginationOptions.currentPage"
          :page-size="paginationOptions.pageSize"
          :page-sizes="paginationOptions.pageSizes"
          layout="sizes, prev, pager, next, total"
          :total="tableData.length"
        >
        </el-pagination>
      </el-card>
    </div>
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
import { EXPORT_ALL } from '@/utils/index'
import { cbmGas } from '@/request/api'
export default {
  name: 'cbmGas',
  components: { Tabs },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '煤层气产气时间序列',
      loading: false,
      currentPage1: 1,
      tableData: [],
      tableHead: [],
      total: null,
      paginationOptions: {
        currentPage: 1, // 当前页
        pageSize: 20, // 展示页数
        pageSizes: [20, 30, 40, 50] // 可选择展示页数 数组
      }
    }
  },
  computed: {
    // 前端分页
    frontEndPageChange() {
      let start = (this.paginationOptions.currentPage - 1) * this.paginationOptions.pageSize
      if (start >= this.tableData.length) start = 0
      let end = this.paginationOptions.currentPage * this.paginationOptions.pageSize
      if (end >= this.tableData.length) end = this.tableData.length
      return this.tableData.slice(start, end)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 查询
    onSearch() {
      this.getList()
    },
    // 导出
    onExport() {
      EXPORT_ALL(this.tableHead, this.tableData, '煤层气日产气量时间序列')
    },
    handleSizeChange(val) {
      this.paginationOptions.pageSize = val
    },
    handleCurrentChange(val) {
      this.paginationOptions.currentPage = val
    },
    // 处理 tablehead
    getTableHead() {
      let keys = Object.keys(this.tableData[0])
      let objs = []
      keys.map(key => {
        let obj = {}
        if (key === 'id') obj = { prop: key, label: '序号', width: '100' }
        if (key === 'date') obj = { prop: key, label: '排采日期', width: '100' }
        if (key !== 'id' && key !== 'date') obj = { prop: key, label: key, width: '100' }
        objs.push(obj)
      })
      this.tableHead = objs
    },
    getList() {
      this.loading = true
      cbmGas()
        .then(res => {
          if (res.status) {
            this.loading = false
            this.tableData = res.results
            this.getTableHead()
            this.total = res.resultsCount
          } else {
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>
<style lang="less" scoped>
.containter_main {
  position: absolute;
  top: 60px;
  left: 18px;
  width: 87%;
  background-color: #fff;
  .mb10 {
    margin-bottom: 10px;
  }
  /deep/.el-table--enable-row-transition .el-table__body td.el-table__cell {
    text-align: center;
  }
  .el-pagination {
    text-align: center;
    margin-top: 15px;
  }
}
</style>
