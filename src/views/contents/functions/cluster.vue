<template>
  <div class="">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
export default {
  name: 'cluster',
  components: { Tabs },
  data() {
    return {
      firstMenu: '功能',
      secondMenu: '聚类'
    }
  },
  computed: {},
  methods: {},
  mounted() {}
}
</script>
<style lang="less" scoped></style>
