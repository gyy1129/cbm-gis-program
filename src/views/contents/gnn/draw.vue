<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <el-row>
        <el-card class="box-card">
          <el-row :gutter="12" class="el_row_first">
            <el-col :span="3">
              <el-button type="primary" @click="uploadDialog = true">上传文件</el-button>
            </el-col>
            <el-col :span="12">
              <p>使用说明：需要先上传文件(文件名不要用中文)，再进行聚类功能操作！</p>
            </el-col>
          </el-row>
          <el-form :model="wellScope" ref="wellScope" label-width="120px" class="well_scope" :rules="rules">
            <el-row :gutter="12">
              <el-col :span="6">
                <el-form-item label="范围：" prop="scopeVal">
                  <el-input v-model.number="wellScope.scopeVal" placeholder="请输入井的范围值" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="上传文件名：" prop="fileName">
                  <el-input v-model="wellScope.fileName" placeholder="请输入上传文件名" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <el-button type="primary" @click="getWellPair">计算范围内的井对</el-button>
                  <el-button type="primary" @click="getConnect" plain>构图</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-row>
      <el-row :gutter="10">
        <baidu-map class="map" :scroll-wheel-zoom="true" :center="center" :zoom="zoom" @ready="handler"> </baidu-map>
      </el-row>
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
  name: 'draw',
  components: { Tabs, uploadFile },
  data() {
    return {
      firstMenu: '图神经网络',
      secondMenu: '构图',
      path: './public/', // 设置文件上传到服务器的位置，比如服务器下有 public 目录， 你可以在这里写 ./public/
      uploadDialog: false,
      wellScope: {
        scopeVal: 300,
        fileName: null
      },
      rules: {
        scopeVal: [
          { required: true, message: '请输入井的范围值', trigger: 'blur' },
          { type: 'number', message: '范围必须为数字值' },
          { pattern: /^(1\d\d|1000)$/, message: '范围要在100-1000', trigger: 'blur' }
        ],
        fileName: [{ required: true, message: '请输入上传文件名', trigger: 'blur' }]
      },
      BMap: null,
      map: null,
      center: {
        lng: 112.4,
        lat: 35.74
      },
      zoom: 11
    }
  },
  computed: {},
  methods: {
    //百度地图初始化
    handler({ BMap, map }) {
      this.BMap = BMap // 百度地图
      this.map = map // 当前地图
    },
    getWellPair() {
      console.log('计算范围')
    },
    getConnect() {
      console.log('构图')
    }
  },
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
  .el_row_first {
    display: flex;
    align-items: center;
    color: red;
  }
  .mb22 {
    margin-bottom: 22px;
  }
  .well_scope {
    margin: 20px 0 0 0;
  }
}
.explain {
  display: flex;
  flex-direction: column;
  align-items: center;
  p {
    color: red;
    padding-bottom: 8px;
  }
}
</style>
<style lang="less">
.el-dialog--center .el-dialog__body {
  display: flex;
  justify-content: center;
}
</style>
