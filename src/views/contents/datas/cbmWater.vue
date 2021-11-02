<template>
  <div class="containter">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">123</div>
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
  top: 32px;
}
</style>
