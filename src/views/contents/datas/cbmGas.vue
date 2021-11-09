<template>
  <div class="containter">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <el-card class="box-card">
        <el-button type="primary" size="medium" @click="onExport" class="btn">导出</el-button>
        <el-table
          ref="tableRef"
          stripe
          border
          :data="frontEndPageChange"
          style="width: 100%"
          height="100px"
          v-tableHeight="{ bottomOffset: 60 }"
          :header-cell-style="{ color: '#fff', fontWeight: 'bold', backgroundColor: '#7896b0', textAlign: 'center' }"
        >
          <el-table-column prop="id" width="80" label="序号" fixed></el-table-column>
          <el-table-column prop="date" label="排采日期" width="100" fixed></el-table-column>
          <el-table-column prop="huajia1" label="华加1" width="100"></el-table-column>
          <el-table-column prop="huajia10_1" label="华加10-1" width="100"></el-table-column>
          <el-table-column prop="huajia10_2" label="华加10-2" width="100"></el-table-column>
          <el-table-column prop="huajia10" label="华加10"></el-table-column>
          <el-table-column prop="huajia11_1" label="华加11-1" width="100"></el-table-column>
          <el-table-column prop="huajia11_2" label="华加11-2" width="100"></el-table-column>
          <el-table-column prop="huajia11_3" label="华加11-3" width="100"></el-table-column>
          <el-table-column prop="huajia11" label="华加11"></el-table-column>
          <el-table-column prop="huajia12" label="华加12"></el-table-column>
          <el-table-column prop="huajia13" label="华加13"></el-table-column>
          <el-table-column prop="huajia14" label="华加14"></el-table-column>
          <el-table-column prop="huajia15" label="华加15"></el-table-column>
          <el-table-column prop="huajia16" label="华加16"></el-table-column>
          <el-table-column prop="huajia17" label="华加17"></el-table-column>
          <el-table-column prop="huajia19" label="华加19"></el-table-column>
          <el-table-column prop="huajia2_2" label="华加2-2" width="100"></el-table-column>
          <el-table-column prop="huajia2" label="华加2"></el-table-column>
          <el-table-column prop="huajia20" label="华加20"></el-table-column>
          <el-table-column prop="huajia21" label="华加21"></el-table-column>
          <el-table-column prop="huajia23" label="华加23"></el-table-column>
          <el-table-column prop="huajia24" label="华加24"></el-table-column>
          <el-table-column prop="huajia25" label="华加25"></el-table-column>
          <el-table-column prop="huajia26" label="华加26"></el-table-column>
          <el-table-column prop="huajia27" label="华加27"></el-table-column>
          <el-table-column prop="huajia28" label="华加28"></el-table-column>
          <el-table-column prop="huajia29" label="华加29"></el-table-column>
          <el-table-column prop="huajia3_1" label="华加3-1" width="100"></el-table-column>
          <el-table-column prop="huajia3_2" label="华加3-2" width="100"></el-table-column>
          <el-table-column prop="huajia3" label="华加3"></el-table-column>
          <el-table-column prop="huajia30" label="华加30"></el-table-column>
          <el-table-column prop="huajia32" label="华加32"></el-table-column>
          <el-table-column prop="huajia33" label="华加33"></el-table-column>
          <el-table-column prop="huajia34" label="华加34"></el-table-column>
          <el-table-column prop="huajia35" label="华加35"></el-table-column>
          <el-table-column prop="huajia36" label="华加36"></el-table-column>
          <el-table-column prop="huajia37" label="华加37"></el-table-column>
          <el-table-column prop="huajia38" label="华加38"></el-table-column>
          <el-table-column prop="huajia39" label="华加39"></el-table-column>
          <el-table-column prop="huajia4" label="华加4"></el-table-column>
          <el-table-column prop="huajia40" label="华加40"></el-table-column>
          <el-table-column prop="huajia41" label="华加41"></el-table-column>
          <el-table-column prop="huajia42" label="华加42"></el-table-column>
          <el-table-column prop="huajia43" label="华加43"></el-table-column>
          <el-table-column prop="huajia44" label="华加44"></el-table-column>
          <el-table-column prop="huajia5" label="华加5"></el-table-column>
          <el-table-column prop="huajia6" label="华加6"></el-table-column>
          <el-table-column prop="huajia7" label="华加7"></el-table-column>
          <el-table-column prop="huajia8" label="华加8"></el-table-column>
          <el-table-column prop="huajia9" label="华加9"></el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="z-pagination"
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
import axios from 'axios'
import Tabs from '../components/Tabs.vue'
import { EXPORT_ALL } from '@/utils/index'
export default {
  name: 'cbmGas',
  components: { Tabs },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '煤层气产气时间序列',
      currentPage1: 1,
      tableData: [],
      total: null,
      paginationOptions: {
        currentPage: 1, // 当前页
        pageSize: 20, // 展示页数
        pageSizes: [20, 30, 40, 50] // 可选择展示页数 数组
      },
      tableTitleData: [
        { prop: 'id', label: '序号', width: '100' },
        { prop: 'date', label: '排采日期', width: '100' },
        { prop: 'huajia1', label: '华加1', width: '100' },
        { prop: 'huajia10_1', label: '华加10-1', width: '100' },
        { prop: 'huajia10_2', label: '华加10-2', width: '100' },
        { prop: 'huajia10', label: '华加10', width: '100' },
        { prop: 'huajia11_1', label: '华加11-1', width: '100' },
        { prop: 'huajia11_2', label: '华加11-2', width: '100' },
        { prop: 'huajia11_3', label: '华加11-3', width: '100' },
        { prop: 'huajia11', label: '华加11', width: '100' },
        { prop: 'huajia12', label: '华加12', width: '100' },
        { prop: 'huajia13', label: '华加13', width: '100' },
        { prop: 'huajia14', label: '华加14', width: '100' },
        { prop: 'huajia15', label: '华加15', width: '100' },
        { prop: 'huajia16', label: '华加16', width: '100' },
        { prop: 'huajia17', label: '华加17', width: '100' },
        { prop: 'huajia19', label: '华加19', width: '100' },
        { prop: 'huajia2_2', label: '华加2-2', width: '100' },
        { prop: 'huajia2', label: '华加2', width: '100' },
        { prop: 'huajia20', label: '华加20', width: '100' },
        { prop: 'huajia21', label: '华加21', width: '100' },
        { prop: 'huajia23', label: '华加23', width: '100' },
        { prop: 'huajia24', label: '华加24', width: '100' },
        { prop: 'huajia25', label: '华加25', width: '100' },
        { prop: 'huajia26', label: '华加26', width: '100' },
        { prop: 'huajia27', label: '华加27', width: '100' },
        { prop: 'huajia28', label: '华加28', width: '100' },
        { prop: 'huajia29', label: '华加29', width: '100' },
        { prop: 'huajia3_1', label: '华加3-1', width: '100' },
        { prop: 'huajia3_2', label: '华加3-2', width: '100' },
        { prop: 'huajia3', label: '华加3', width: '100' },
        { prop: 'huajia30', label: '华加30', width: '100' },
        { prop: 'huajia32', label: '华加32', width: '100' },
        { prop: 'huajia33', label: '华加33', width: '100' },
        { prop: 'huajia34', label: '华加34', width: '100' },
        { prop: 'huajia35', label: '华加35', width: '100' },
        { prop: 'huajia36', label: '华加36', width: '100' },
        { prop: 'huajia37', label: '华加37', width: '100' },
        { prop: 'huajia38', label: '华加38', width: '100' },
        { prop: 'huajia39', label: '华加39', width: '100' },
        { prop: 'huajia4', label: '华加4', width: '100' },
        { prop: 'huajia40', label: '华加40', width: '100' },
        { prop: 'huajia41', label: '华加41', width: '100' },
        { prop: 'huajia42', label: '华加42', width: '100' },
        { prop: 'huajia43', label: '华加43', width: '100' },
        { prop: 'huajia44', label: '华加44', width: '100' },
        { prop: 'huajia5', label: '华加5', width: '100' },
        { prop: 'huajia6', label: '华加6', width: '100' },
        { prop: 'huajia7', label: '华加7', width: '100' },
        { prop: 'huajia8', label: '华加8', width: '100' },
        { prop: 'huajia9', label: '华加9', width: '100' }
      ]
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
  mounted() {
    this.getList()
  },
  methods: {
    onExport() {
      EXPORT_ALL(this.tableTitleData, this.tableData, '煤层气日产气量时间序列')
    },
    handleSizeChange(val) {
      this.paginationOptions.pageSize = val
    },
    handleCurrentChange(val) {
      this.paginationOptions.currentPage = val
    },
    getList() {
      axios
        .post('http://localhost:3000/data/cbmgas')
        .then(res => {
          if (res.data.status) {
            this.tableData = res.data.results
            this.total = res.data.resultsCount
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(err => {
          this.$message.error(err.message)
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
  .btn {
    margin: 0px 0 15px 0px;
    background-color: #3a699a;
    border-color: #3a699a;
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
