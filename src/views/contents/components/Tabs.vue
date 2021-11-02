<template>
  <div class="tabs">
    <el-breadcrumb separator-class="el-icon-arrow-right">
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
  height: 40px;
  width: 100%;
  background-color: #fff;
  box-shadow: 3px 2px 4px 2px #dcdcdc;
  .el-breadcrumb {
    font-size: 15px;
    font-weight: 600;
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 22px;
    /deep/.el-breadcrumb__inner {
      color: #17889a;
    }
  }
}
</style>
