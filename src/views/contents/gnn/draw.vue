<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <el-card class="card-box" v-show="fromDisplay">
        <el-row :gutter="12">
          <el-col :span="3">
            <el-button type="primary" @click="uploadDialog = true" size="small">上传文件</el-button>
          </el-col>
          <el-col :span="16">
            <p>使用说明：需要先上传文件(文件名不要用中文)，再进行功能操作！</p>
          </el-col>
        </el-row>
        <!-- 显示井 -->
        <el-form :model="displayWell" ref="displayWell" label-width="120px" class="well_scope" :rules="rules">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-form-item label="上传文件名：" prop="fileName" style="margin-bottom: 0">
                <el-input
                  v-model="displayWell.fileName"
                  placeholder="请输入上传文件名"
                  clearable
                  size="small"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item style="margin-bottom: 0">
                <el-button type="primary" @click="getWell" size="small">获取井位置</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-radio-group v-model="well" size="small" @change="changeWell" :disabled="disabledWell">
                <el-radio label="displayWell">显示井</el-radio>
                <el-radio label="hideWell">不显示井</el-radio>
              </el-radio-group>
            </el-col>
          </el-row>
        </el-form>
        <!-- 该范围内构图 -->
        <el-form :model="wellScope" ref="wellScope" label-width="120px" class="well_scope" :rules="rules">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-form-item label="范围：" prop="scopeVal" style="margin-bottom: 0">
                <el-input
                  v-model.number="wellScope.scopeVal"
                  placeholder="请输入井的范围值"
                  clearable
                  size="small"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="上传文件名：" prop="fileName" style="margin-bottom: 0">
                <el-input v-model="wellScope.fileName" placeholder="请输入上传文件名" clearable size="small"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item style="margin-bottom: 0">
                <el-button type="primary" @click="getConnect" size="small"> 该范围内构图 </el-button>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-radio-group v-model="connect" size="small" @change="changeConnect" :disabled="disabledConnect">
                <el-radio label="displayConnect">显示连接</el-radio>
                <el-radio label="hideConnect">隐藏连接</el-radio>
              </el-radio-group>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <baidu-map class="map" :scroll-wheel-zoom="true" :center="center" :zoom="zoom" @ready="handler">
        <el-radio-group v-model="fromDisplay" class="radio" size="small">
          <el-radio-button :label="true">展开</el-radio-button>
          <el-radio-button :label="false">收起</el-radio-button>
        </el-radio-group>
        <bm-scale anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-scale>
        <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
        <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_SATELLITE_MAP']" anchor="BMAP_ANCHOR_TOP_LEFT"></bm-map-type>
        <bm-boundary name="山西省沁水县" :strokeWeight="3" strokeColor="blue" :fillOpacity="0.1"></bm-boundary>
        <bml-marker-clusterer :averageCenter="true">
          <bm-marker
            v-for="point of points"
            :key="point.well_name"
            :position="{ lng: point.baidu_lng, lat: point.baidu_lat }"
            @click="lookDetail(point)"
          >
            <bm-label :content="point.well_name" :labelStyle="labelStyle" :offset="{ width: -10, height: 27 }" />
          </bm-marker>
        </bml-marker-clusterer>

        <bm-polyline
          v-for="(line, i) in lineList"
          :key="i"
          :path="line"
          stroke-color="red"
          :stroke-opacity="0.5"
          :stroke-weight="10"
        >
        </bm-polyline>
      </baidu-map>
    </div>
    <el-dialog title="上传文件" :visible.sync="uploadDialog" center append-to-body>
      <uploadFile :path="path"></uploadFile>
      <div class="explain">
        <p>上传文件格式示例:</p>
        <img src="@/assets/images/scope_format.png" alt="文件上传格式" width="70%" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import Tabs from '../components/Tabs.vue'
import uploadFile from '../components/uploadFile.vue'
import { BmlMarkerClusterer } from 'vue-baidu-map'
export default {
  name: 'draw',
  components: { Tabs, uploadFile, BmlMarkerClusterer },
  data() {
    return {
      firstMenu: '图神经网络',
      secondMenu: '构图',
      path: './public/', // 设置文件上传到服务器的位置，比如服务器下有 public 目录， 你可以在这里写 ./public/
      uploadDialog: false,
      fromDisplay: false,
      well: 'hideWell',
      connect: 'hideConnect',
      disabledWell: true,
      disabledConnect: true,
      displayWell: {
        fileName: 'scope'
      },
      wellScope: {
        scopeVal: 300,
        fileName: 'scope'
      },
      rules: {
        scopeVal: [
          { required: true, message: '请输入井的范围值', trigger: 'blur' },
          { type: 'number', message: '范围必须为数字值' },
          { pattern: /^([1-9]\d\d|1000)$/, message: '范围要在100-1000', trigger: 'blur' }
        ],
        fileName: [{ required: true, message: '请输入上传文件名', trigger: 'blur' }]
      },
      BMap: null,
      map: null,
      center: {
        lng: 112.4,
        lat: 35.74
      },
      zoom: 11,
      points: [],
      pointsTotal: null,
      pointsResults: [], // 接口返回 井
      pointsTotalResults: null, // 接口返回 井数
      labelStyle: {
        padding: '0 3px',
        height: '20px',
        lineHeight: '20px',
        color: '#fff',
        fontSize: '12px',
        background: '#676768',
        border: "1px solid '#ff8355'",
        borderRadius: '3px',
        textAlgin: 'center'
      },
      lineList: []
    }
  },
  methods: {
    //百度地图初始化
    handler({ BMap, map }) {
      this.BMap = BMap // 百度地图
      this.map = map // 当前地图
    },
    // 获取井位置
    getWell() {
      const params = {
        fileName: this.displayWell.fileName
      }
      axios
        .post('http://localhost:3000/gnn/displaywell', params)
        .then(res => {
          if (res.data.status) {
            this.pointsResults = res.data.results
            this.pointsTotalResults = res.data.resultsCount
            this.$message.success(res.data.message)
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
      this.disabledWell = false
    },
    // 切换井的显示
    changeWell(label) {
      if (label === 'displayWell') {
        this.points = this.pointsResults
        this.pointsTotal = this.pointsTotalResults
      } else {
        this.points = []
        this.pointsTotal = 0
      }
    },
    // 该范围内构图
    getConnect() {
      const params = {
        scopeVal: this.wellScope.scopeVal,
        fileName: this.wellScope.fileName
      }
      axios
        .post('http://localhost:3000/gnn/getConnect', params)
        .then(res => {
          if (res.data.status) {
            this.lineListResults = res.data.results
            this.$message.success(res.data.message)
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
      this.disabledConnect = false
    },
    // 切换 连接
    changeConnect(label) {
      label === 'displayConnect' ? (this.lineList = this.lineListResults) : (this.lineList = [])
    }
  },
  mounted() {}
}
</script>
<style lang="less" scoped>
.containter_main {
  position: relative;
  // top: 60px;
  // left: 18px;
  width: 89%;
  height: 92vh;
  .card-box {
    position: absolute;
    top: 13%;
    left: 2%;
    z-index: 2;
  }
  /deep/.el-row {
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
  .map {
    width: 100%;
    height: 100%;
    /deep/.BMap_bubble_title {
      color: #d86513;
      font-weight: 600;
    }
    /deep/.BMap_bubble_content {
      color: #475074;
      font-weight: 500;
    }
    /deep/.anchorBL {
      display: none; // 删除 百度地图自带的版权
    }
    .radio {
      position: absolute;
      top: 6%;
      left: 2%;
      // z-index: 2;
    }
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
