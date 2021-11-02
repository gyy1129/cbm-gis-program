<template>
  <div class="tabs">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- <el-breadcrumb-item :to="{ path: '/home' }">数据报表</el-breadcrumb-item> -->
      <el-breadcrumb-item>{{ firstMenu }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ secondMenu }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'Tabs',
  components: {},
  props: {
    firstMenu: {
      type: String,
      require: true
    },
    secondMenu: {
      type: String,
      require: true
    }
  },
  data() {
    return {}
  },
  computed: {},
  methods: {},
  mounted() {}
}
</script>
<style lang="less" scoped>
.tabs {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 32px;
  width: 100%;
  background-color: #fff;
  .el-breadcrumb {
    font-size: 15px;
    font-weight: 600;
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 22px;
  }
}
</style>
