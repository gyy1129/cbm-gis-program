<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <el-card class="box-card">
        <el-button type="primary" @click="uploadDialog = true">上传文件</el-button>
      </el-card>
    </div>
    <el-dialog title="上传文件" :visible.sync="uploadDialog" center append-to-body>
      <uploadFile :path="path"></uploadFile>
      <div class="explain">
        <p>上传文件格式示例:</p>
        <img src="@/assets/images/kmeans_format.png" alt="文件上传格式" width="70%" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
import uploadFile from '../components/uploadFile.vue'
export default {
  name: 'gisData',
  components: { Tabs, uploadFile },
  data() {
    return {
      firstMenu: '图神经网络',
      secondMenu: '聚类',
      path: './public/', // 设置文件上传到服务器的位置，比如服务器下有 public 目录， 你可以在这里写 ./public/
      uploadDialog: false
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
  background-color: #fff;
  /deep/.el-dialog--center .el-dialog__body {
    display: flex !important;
    justify-content: center !important;
  }
}
</style>
<style lang="less">
.el-dialog--center .el-dialog__body {
  display: flex;
  justify-content: center;
  .explain {
    display: flex;
    flex-direction: column;
    align-items: center;
    p {
      padding-bottom: 8px;
    }
  }
}
</style>
