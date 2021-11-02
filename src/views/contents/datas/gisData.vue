<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
export default {
  name: 'gisData',
  components: { Tabs },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '煤层气gis数据'
    }
  },
  computed: {},
  methods: {},
  mounted() {}
}
</script>
<style lang="less" scoped></style>
