<template>
  <div class="sidebar">
    <el-menu
      :default-active="$route.path"
      :router="true"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      background-color="#333649"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="/home">
        <i class="el-icon-s-home"></i>
        <span slot="title">首页</span>
      </el-menu-item>
      <el-submenu index="/data">
        <template slot="title"><i class="el-icon-document" /><span>数据报表</span></template>
        <el-menu-item-group>
          <el-menu-item index="/data/cbmproperty">煤层气属性数据</el-menu-item>
          <el-menu-item index="/data/cbmgas">煤层气产气时间序列</el-menu-item>
          <el-menu-item index="/data/cbmwater">煤层气产水时间序列</el-menu-item>
          <el-menu-item index="/data/gisdata">煤层气井地理位置可视化</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="/gnn">
        <template slot="title"><i class="el-icon-menu" /><span>图神经网络</span></template>
        <el-menu-item-group>
          <el-menu-item index="/gnn/cluster">聚类</el-menu-item>
          <el-menu-item index="/gnn/draw">构图</el-menu-item>
          <el-menu-item index="/gnn/forecast">预测</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="/gis">
        <template slot="title"><i class="el-icon-s-promotion" /><span>gis实用功能</span></template>
        <el-submenu index="/gis/draw">
          <template slot="title">绘图</template>
          <el-menu-item-group>
            <el-menu-item index="/gis/draw/cluster">绘制标准图形</el-menu-item>
            <el-menu-item index="/gis/draw/draw">自由绘制图形</el-menu-item>
            <el-menu-item index="/gis/draw/forecast">预测</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="/gis/edit">
          <template slot="title">编辑</template>
          <el-menu-item-group>
            <el-menu-item index="/gis/edit/cluster">聚类</el-menu-item>
            <el-menu-item index="/gis/edit/draw">构图</el-menu-item>
            <el-menu-item index="/gis/edit/forecast">预测</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="/gis/spatial">
          <template slot="title">空间分析</template>
          <el-menu-item-group>
            <el-menu-item index="/gis/spatial/cluster">缓冲区分析</el-menu-item>
            <el-menu-item index="/gis/spatial/draw">聚类</el-menu-item>
            <el-menu-item index="/gis/spatial/forecast">统计聚类</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  components: {},
  data() {
    return {}
  },
  computed: {},
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
    }
  },
  mounted() {}
}
</script>
<style lang="less" scoped>
.sidebar {
  position: fixed;
  width: 210px;
  height: calc(100% - 32px);
  .el-menu {
    height: 100%;
    /deep/.el-menu-item-group__title {
      padding: 0;
    }
  }
}
</style>
