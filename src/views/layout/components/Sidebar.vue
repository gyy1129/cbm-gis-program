<template>
  <div class="sidebar">
    <el-menu
      :default-active="$route.path"
      :router="true"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      background-color="#394f62"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-submenu index="/data">
        <template slot="title"><i class="el-icon-document" /><span>数据报表</span></template>
        <el-menu-item-group>
          <el-menu-item index="/data/cbmproperty">煤层气属性数据</el-menu-item>
          <el-menu-item index="/data/cbmgas">煤层气产气时间序列</el-menu-item>
          <el-menu-item index="/data/cbmwater">煤层气产水时间序列</el-menu-item>
          <el-menu-item index="/data/gisdata">煤层气井地理位置</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="/function">
        <template slot="title"><i class="el-icon-menu" /><span>功能</span></template>
        <el-submenu index="/function/gnn">
          <template slot="title">图神经网络</template>
          <el-menu-item-group>
            <el-menu-item index="/function/gnn/cluster">聚类</el-menu-item>
            <el-menu-item index="/function/gnn/draw">构图</el-menu-item>
            <el-menu-item index="/function/gnn/forecast">预测</el-menu-item>
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
