<template>
  <div class="">
    <Header />
    <Sidebar />
    <div class="main">
      <keep-alive>
        <router-view class="content"> </router-view>
      </keep-alive>
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
  background-color: #f3f4fa;
  .content {
    position: relative;
    top: 0;
    height: calc(100% - 32px);
    overflow-y: auto;
  }
}
</style>
