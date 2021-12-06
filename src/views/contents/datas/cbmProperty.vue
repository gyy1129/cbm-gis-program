<template>
  <div class="containter">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <el-card class="box-card">
        <el-button type="primary" size="medium" @click="onExport" class="btn">导出</el-button>
        <!-- 
          设置一下height, 高度随意设置 height="100px"
          v-tableHeight 指令设置偏移量 v-tableHeight="{ bottomOffset: 60 }"
         -->
        <el-table
          ref="tableRef"
          stripe
          border
          :data="frontEndPageChange"
          style="width: 100%"
          height="100px"
          v-tableHeight="{ bottomOffset: 60 }"
          :header-cell-style="{ color: '#fff', fontWeight: 'bold', backgroundColor: '#56677c', textAlign: 'center' }"
        >
          <el-table-column type="index" width="50" label="序号" fixed></el-table-column>
          <el-table-column prop="well_name" label="井名" width="100" fixed show-overflow-tooltip></el-table-column>
          <el-table-column prop="well_type" label="井型"></el-table-column>
          <el-table-column prop="coordinate_x" label="井底坐标X" width="120"></el-table-column>
          <el-table-column prop="coordinate_y" label="井底坐标Y" width="120"></el-table-column>
          <el-table-column prop="permeability" label="渗透率" width="120"></el-table-column>
          <el-table-column prop="porosity" label="孔隙度（%）" width="120"></el-table-column>
          <el-table-column prop="clay" label="粘土（%）" width="120"></el-table-column>
          <el-table-column prop="volatiles" label="挥发分（%）" width="120"></el-table-column>
          <el-table-column prop="burial_depth" label="煤埋深"></el-table-column>
          <el-table-column prop="gas_content" label="含气量"></el-table-column>
          <el-table-column prop="gas_saturation" label="含气饱和度（%）" width="140"></el-table-column>
          <el-table-column prop="roof_sandstone" label="顶板砂岩厚度" width="120"></el-table-column>
          <el-table-column prop="floor_sandstone" label="底板砂岩厚度" width="120"></el-table-column>
          <el-table-column prop="coal_thickness" label="煤层厚度"></el-table-column>
          <el-table-column prop="ash" label="灰分（%）" width="120"></el-table-column>
          <el-table-column prop="total_fracturing" label="总压裂液量" width="120"></el-table-column>
          <el-table-column prop="stop_pump_pressure" label="停泵压力"></el-table-column>
          <el-table-column prop="sand" label="加砂量"></el-table-column>
          <el-table-column prop="reservoir_pressure" label="储层压力"></el-table-column>
          <el-table-column prop="desorption_pressure" label="解吸压力"></el-table-column>
          <el-table-column prop="drop_speed" label="降液速度"></el-table-column>
          <el-table-column prop="production_days" label="排采天数"></el-table-column>
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
import { cbmProperty } from '@/request/api'
export default {
  name: 'cbmProperty',
  components: { Tabs },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '煤层气属性数据',
      currentPage1: 1,
      tableData: [],
      total: null,
      paginationOptions: {
        currentPage: 1, // 当前页
        pageSize: 20, // 展示页数
        pageSizes: [20, 30, 40, 50] // 可选择展示页数 数组
      },
      tableTitleData: [
        { label: '井名', prop: 'well_name', width: '100' },
        { label: '井型', prop: 'well_type', width: '100' },
        { label: '井底坐标X', prop: 'coordinate_x', width: '120' },
        { label: '井底坐标Y', prop: 'coordinate_y', width: '120' },
        { label: '渗透率', prop: 'permeability', width: '120' },
        { label: '孔隙度（%）', prop: 'porosity', width: '120' },
        { label: '粘土（%）', prop: 'clay', width: '120' },
        { label: '挥发分（%）', prop: 'volatiles', width: '120' },
        { label: '煤埋深', prop: 'burial_depth', width: '100' },
        { label: '含气量', prop: 'gas_content', width: '100' },
        { label: '含气饱和度（%）', prop: 'gas_saturation', width: '100' },
        { label: '顶板砂岩厚度', prop: 'roof_sandstone', width: '100' },
        { label: '底板砂岩厚度', prop: 'floor_sandstone', width: '100' },
        { label: '煤层厚度', prop: 'coal_thickness', width: '100' },
        { label: '灰分（%）', prop: 'ash', width: '100' },
        { label: '总压裂液量', prop: 'total_fracturing', width: '120' },
        { label: '停泵压力', prop: 'stop_pump_pressure', width: '120' },
        { label: '加砂量', prop: 'sand', width: '100' },
        { label: '储层压力', prop: 'reservoir_pressure', width: '100' },
        { label: '解吸压力', prop: 'desorption_pressure', width: '120' },
        { label: '降液速度', prop: 'drop_speed', width: '120' },
        { label: '排采天数', prop: 'production_days', width: '120' }
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
      /**
       * @tableTitleData 表头数据
       * @tableData 表格数据
       * @第三个 导出excel名称
       */
      EXPORT_ALL(this.tableTitleData, this.tableData, '煤层气属性数据')
      // const url = 'http://localhost:3000/download/exportpro'
      // window.location = url //这里不能使用get方法跳转，否则下载不成功
    },
    handleSizeChange(val) {
      this.paginationOptions.pageSize = val
    },
    handleCurrentChange(val) {
      this.paginationOptions.currentPage = val
    },
    getList() {
      cbmProperty()
        .then(res => {
          if (res.status) {
            this.tableData = res.results
            this.total = res.resultsCount
          } else {
            this.$message.error(res.message)
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
    background-color: #49506a;
    border-color: #49506a;
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
