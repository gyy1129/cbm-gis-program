<template>
  <div class="containter">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <baidu-map class="map" center="太原" :zoom="15" :scroll-wheel-zoom="true"> </baidu-map>
    </div>
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
export default {
  name: 'cbmWater',
  components: { Tabs },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '煤层气产水时间序列'
    }
  },
  computed: {},
  methods: {},
  mounted() {}
}
</script>
<style lang="less" scoped>
.containter_main {
  position: absolute;
  top: 60px;
  left: 18px;
  width: 87%;
  height: 820px;
  border: 3px solid #fff;
  box-shadow: 0 0 25px #a1a1a1;
  .map {
    width: 100%;
    height: 100%;
  }
}
</style>
