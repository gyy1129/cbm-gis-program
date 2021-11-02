<template>
  <div class="">
    <Header />
    <Sidebar />
    <div class="main">
      <router-view class="content"> </router-view>
    </div>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'

export default {
  name: 'Layout',
  components: {
    Header,
    Sidebar
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
.main {
  position: fixed;
  top: 32px;
  left: 209px;
  height: 100%;
  width: 100%;
  background-color: #eeeeee;
  .content {
    position: relative;
    top: 0;
  }
}
</style>
