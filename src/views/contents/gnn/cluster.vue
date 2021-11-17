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
      firstMenu: '图神经网络',
      secondMenu: '聚类'
    }
  },
  computed: {},
  methods: {},
  mounted() {}
}
</script>
<style lang="less" scoped></style>
