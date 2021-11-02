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
          height="670"
          :data="tableData"
          style="width: 100%"
          :header-cell-style="{ color: '#fff', fontWeight: 'bold', backgroundColor: '#7896b0', textAlign: 'center' }"
        >
          <el-table-column prop="date" label="井名" width="120" fixed> </el-table-column>
          <el-table-column prop="name" label="井型"> </el-table-column>
          <el-table-column prop="address" label="井底坐标X" width="120"> </el-table-column>
          <el-table-column prop="date" label="井底坐标Y" width="120"> </el-table-column>
          <el-table-column prop="name" label="渗透率"> </el-table-column>
          <el-table-column prop="address" label="孔隙度（%）" width="120"> </el-table-column>
          <el-table-column prop="date" label="粘土（%）" width="120"> </el-table-column>
          <el-table-column prop="name" label="挥发分（%）" width="120"> </el-table-column>
          <el-table-column prop="address" label="煤埋深"> </el-table-column>
          <el-table-column prop="date" label="含气量"> </el-table-column>
          <el-table-column prop="name" label="含气饱和度（%）" width="140"> </el-table-column>
          <el-table-column prop="address" label="顶板砂岩厚度" width="140"> </el-table-column>
          <el-table-column prop="date" label="底板砂岩厚度" width="140"> </el-table-column>
          <el-table-column prop="name" label="煤层厚度"> </el-table-column>
          <el-table-column prop="address" label="灰分（%）" width="120"> </el-table-column>
          <el-table-column prop="address" label="总压裂液量" width="120"> </el-table-column>
          <el-table-column prop="date" label="停泵压力"> </el-table-column>
          <el-table-column prop="name" label="加砂量"> </el-table-column>
          <el-table-column prop="address" label="储层压力"> </el-table-column>
          <el-table-column prop="date" label="解吸压力"> </el-table-column>
          <el-table-column prop="name" label="降液速度"> </el-table-column>
          <el-table-column prop="address" label="排采天数"> </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage1"
          :page-size="100"
          layout="total, prev, pager, next"
          :total="1000"
        >
        </el-pagination>
      </el-card>
    </div>
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
export default {
  name: 'cbmProperty',
  components: { Tabs },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '煤层气属性数据',
      currentPage1: 1,
      tableData: [
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }
      ]
    }
  },
  computed: {},
  methods: {
    onExport() {
      console.log('导出')
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
    }
  },
  mounted() {}
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
