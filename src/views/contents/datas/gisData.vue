<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <!-- <el-card class="box-card"> -->
      <div id="mapView" class="map_view" />
      <!-- </el-card> -->
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import Tabs from '../components/Tabs.vue'
export default {
  name: 'gisData',
  components: { Tabs },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '煤层气井地理位置'
    }
  },
  computed: {},
  methods: {
    buildMap() {
      let myMap = echarts.init(document.getElementById('mapView'))
      // 绘制图表
      myMap.setOption({
        title: {
          text: 'ECharts 入门示例'
        },
        tooltip: {},
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      })
    }
  },
  mounted() {
    this.buildMap()
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
  .map_view {
    width: 600px;
    height: 400px;
  }
}
</style>
