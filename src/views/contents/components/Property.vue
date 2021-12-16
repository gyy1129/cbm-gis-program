<template>
  <div class="">
    <FilterColumn :columns="originProCol" @model="getColumns"></FilterColumn>
    <el-button size="medium" type="primary" @click="downloadPro" icon="el-icon-download">导出属性</el-button>
    <el-button size="medium" type="primary" @click="downloadGeojson" icon="el-icon-download" plain
      >下载geojson文件</el-button
    >
    <el-button size="medium" @click="onDialogFull" icon="el-icon-full-screen">
      {{ dialogFullProp ? '关闭全屏' : '全屏显示' }}
    </el-button>
    <el-table :data="frontEndPageChange">
      <el-table-column type="index" width="60" label="序号" fixed align="center"></el-table-column>
      <template v-for="(item, index) in propertyColumnsProp">
        <el-table-column
          v-if="item.visible"
          :key="index"
          :label="item.name"
          :prop="item.name"
          min-width="120"
          align="center"
        >
        </el-table-column>
      </template>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="paginationOptions.currentPage"
      :page-size="paginationOptions.pageSize"
      :page-sizes="paginationOptions.pageSizes"
      layout="sizes, prev, pager, next, total"
      :total="propertyData.length"
      style="text-align: center; margin-top: 10px"
    >
    </el-pagination>
  </div>
</template>

<script>
import FilterColumn from '@/views/contents/components/FilterColumn.vue'
export default {
  name: 'Property',
  props: {
    originProCol: {
      type: Array
    },
    propertyData: {
      type: Array
    },
    propertyColumns: {
      type: Array
    },
    dialogFull: {
      type: Boolean
    },
    curOriginGeoJSON: {
      type: Object
    }
  },
  components: { FilterColumn },
  data() {
    return {
      propertyColumnsProp: [],
      dialogFullProp: false,
      paginationOptions: {
        currentPage: 1, // 当前页
        pageSize: 15, // 展示页数
        pageSizes: [15, 30, 45] // 可选择展示页数 数组
      }
    }
  },
  computed: {
    // 前端分页
    frontEndPageChange() {
      let start = (this.paginationOptions.currentPage - 1) * this.paginationOptions.pageSize
      if (start >= this.propertyData.length) start = 0
      let end = this.paginationOptions.currentPage * this.paginationOptions.pageSize
      if (end >= this.propertyData.length) end = this.propertyData.length
      return this.propertyData.slice(start, end)
    }
  },
  methods: {
    getColumns(cell) {
      this.propertyColumnsProp = cell
    },
    downloadPro() {
      this.$emit('downloadPro')
    },
    // 下载geojson文件 btn
    downloadGeojson() {
      let curOriginGeoJSON = JSON.stringify(this.curOriginGeoJSON)
      let blob = new Blob([curOriginGeoJSON], { type: 'text/json' })

      const link = document.createElement('a')
      link.download = 'geojson文件.geojson'
      link.href = window.URL.createObjectURL(blob)
      link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    onDialogFull() {
      this.dialogFullProp = !this.dialogFullProp
      this.$emit('onDialogFull', this.dialogFullProp)
    },
    handleSizeChange(val) {
      this.paginationOptions.pageSize = val
    },
    handleCurrentChange(val) {
      this.paginationOptions.currentPage = val
    }
  },
  mounted() {
    this.propertyColumnsProp = this.propertyColumns
  }
}
</script>
<style lang="less" scoped></style>
