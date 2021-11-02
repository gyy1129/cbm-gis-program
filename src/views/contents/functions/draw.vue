<template>
  <div class="">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
export default {
  name: 'draw',
  components: { Tabs },
  data() {
    return {
      firstMenu: '功能',
      secondMenu: '构图'
    }
  },
  computed: {},
  methods: {},
  mounted() {}
}
</script>
<style lang="less" scoped></style>
