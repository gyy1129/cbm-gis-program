<template>
  <div class="home">
    <div class="container">
      <h1 class="title">基于GIS和图神经网络的煤层气时空特征产出序列研究系统</h1>
      <p class="lead">专注于 煤层气数据管理 地图可视化 地理信息实用功能 以及 图神经网络~</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {},
  data() {
    return {}
  },
  computed: {},
  methods: {},
  mounted() {}
}
</script>
<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
  background: url(../../assets/images/home2.jpg) no-repeat;
  background-size: 100% 100%;
  text-align: center;
  color: white;
  .container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding-top: 150px;
    background-color: rgba(0, 0, 0, 0.3);
    text-align: center;
    color: white;
    .title {
      font-size: 30px;
    }
    .lead {
      margin-top: 50px;
      font-size: 22px;
    }
  }
}
</style>
