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
      <el-menu-item index="/home"><i class="el-icon-s-home" /><span slot="title">首页</span></el-menu-item>
      <el-menu-item index="/specification"> <i class="el-icon-info" /><span slot="title">系统说明</span> </el-menu-item>
      <el-submenu index="/data">
        <template slot="title"><i class="el-icon-document" /><span>数据管理</span></template>
        <el-menu-item-group>
          <el-menu-item index="/data/cbmproperty"><i class="el-icon-collection" />煤层气属性数据</el-menu-item>
          <el-menu-item index="/data/cbmgas"><i class="el-icon-reading" />煤层气产气时间序列</el-menu-item>
          <el-menu-item index="/data/gisdata"><i class="el-icon-place" />煤层气井地理位置</el-menu-item>
          <el-menu-item index="/data/timedata"><i class="el-icon-sunrise" />时间序列可视化</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="/gis">
        <template slot="title"><i class="el-icon-s-promotion" /><span>GIS功能</span></template>
        <el-menu-item index="/gis/map">
          <i class="el-icon-map-location" /><span slot="title">基础地图</span>
        </el-menu-item>
        <el-submenu index="/gis/draw">
          <template slot="title"><i class="el-icon-edit"></i>地图编辑</template>
          <el-menu-item-group>
            <el-menu-item index="/gis/draw/standard"><i class="el-icon-add-location" />标准图形编辑</el-menu-item>
            <el-menu-item index="/gis/draw/free"><i class="el-icon-brush" />自由图形编辑</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-menu-item index="/gis/layers"> <i class="el-icon-coin" /><span slot="title">图层</span> </el-menu-item>
        <el-submenu index="/gis/spatial">
          <template slot="title"><i class="el-icon-location-outline" />空间分析</template>
          <el-menu-item-group>
            <el-menu-item index="/gis/spatial/base">基础分析</el-menu-item>
            <el-menu-item index="/gis/spatial/buffer">缓冲区分析</el-menu-item>
            <el-menu-item index="/gis/spatial/overlay">叠置分析</el-menu-item>
            <el-menu-item index="/gis/spatial/projection">投影转换</el-menu-item>
            <el-menu-item index="/gis/spatial/clip">裁剪</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-submenu>
      <el-submenu index="/gnn">
        <template slot="title"><i class="el-icon-menu" /><span>图神经网络</span></template>
        <el-menu-item-group>
          <el-menu-item index="/gnn/cluster"><i class="el-icon-magic-stick" />聚类</el-menu-item>
          <el-menu-item index="/gnn/draw"><i class="el-icon-coordinate" />构图</el-menu-item>
          <el-menu-item index="/gnn/adjMatrix"><i class="el-icon-news" />邻接矩阵</el-menu-item>
          <el-menu-item index="/gnn/forecast"><i class="el-icon-files" />模型预测</el-menu-item>
        </el-menu-item-group>
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
  overflow-y: auto;
  .el-menu {
    height: 100%;
    /deep/.el-menu-item-group__title {
      padding: 0;
    }
  }
}
::-webkit-scrollbar {
  width: 5px; //滚动条的宽度
  background-color: #333649;
}
::-webkit-scrollbar-thumb {
  background-color: #89949e; //滚动条的颜色
  border-radius: 3px; //滚动条的边框倒角
}
</style>
