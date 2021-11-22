<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <el-card class="box-card">
        <el-row :gutter="12" class="el_row_first">
          <el-col :span="3">
            <el-button type="primary" @click="uploadDialog = true">上传文件</el-button>
          </el-col>
          <el-col :span="12">
            <p>使用说明：需要先上传文件(文件名不要用中文)，再进行功能操作！</p>
          </el-col>
        </el-row>
        <!-- 显示井 -->
        <el-form :model="displayWell" ref="displayWell" label-width="120px" class="well_scope" :rules="rules">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-form-item label="上传文件名：" prop="fileName">
                <el-input v-model="displayWell.fileName" placeholder="请输入上传文件名" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <el-button type="primary" @click="onDisplayWell">显示井</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <!-- 构图 + 邻接矩阵 -->
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
            <el-col :span="12">
              <el-form-item>
                <el-button type="primary" @click="getConnect">该范围内构图</el-button>
                <el-button type="primary" @click="openAdjacent" plain>生成邻接矩阵</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <baidu-map class="map" :scroll-wheel-zoom="true" :center="center" :zoom="zoom" @ready="handler">
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
      </baidu-map>
    </div>
    <el-dialog title="上传文件" :visible.sync="uploadDialog" center append-to-body>
      <uploadFile :path="path"></uploadFile>
      <div class="explain">
        <p>上传文件格式示例:</p>
        <img src="@/assets/images/scope_format.png" alt="文件上传格式" width="70%" />
      </div>
    </el-dialog>
    <el-dialog title="生成邻接矩阵" :visible.sync="adjacentDialog" width="30%" append-to-body>
      <el-input
        type="textarea"
        :autosize="{ minRows: 15, maxRows: 15 }"
        placeholder="等待生成结果..."
        v-model="adjExport"
        readonly
        resize="none"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adjacentDialog = false">取消</el-button>
        <el-button type="primary" @click="getAdjacent">确定生成邻接矩阵</el-button>
        <el-button @click="exportAdjacent" type="primary" plain>下载生成结果</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import Tabs from '../components/Tabs.vue'
import uploadFile from '../components/uploadFile.vue'
import { BmlMarkerClusterer } from 'vue-baidu-map'
// import { EXPORT_ALL } from '@/utils/index'
export default {
  name: 'draw',
  components: { Tabs, uploadFile, BmlMarkerClusterer },
  data() {
    return {
      firstMenu: '图神经网络',
      secondMenu: '构图',
      path: './public/', // 设置文件上传到服务器的位置，比如服务器下有 public 目录， 你可以在这里写 ./public/
      uploadDialog: false,
      adjacentDialog: false,
      adjacentMatrix: null,
      adjExport: '',
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
        // 'z-index': 999999
      }
    }
  },
  computed: {},
  methods: {
    //百度地图初始化
    handler({ BMap, map }) {
      this.BMap = BMap // 百度地图
      this.map = map // 当前地图
    },
    onDisplayWell() {
      console.log('显示井')
      const params = {
        fileName: this.displayWell.fileName
      }
      axios
        .post('http://localhost:3000/gnn/displaywell', params)
        .then(res => {
          if (res.data.status) {
            this.points = res.data.results
            this.pointsTotal = res.data.resultsCount
            this.$message.success(res.data.message)
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    },
    getConnect() {
      console.log('构图')
    },
    openAdjacent() {
      this.adjacentDialog = true
    },
    getAdjacent() {
      const params = {
        scopeVal: this.wellScope.scopeVal,
        fileName: this.wellScope.fileName
      }
      axios
        .post('http://localhost:3000/gnn/getAdjacent', params)
        .then(res => {
          if (res.data.status) {
            this.adjacentMatrix = res.data.results
            let rows = ''
            this.adjacentMatrix.map(arr => {
              rows = rows + arr + '\n'
            })
            this.adjExport = rows
            this.$message.success(res.data.message)
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    },
    exportAdjacent() {
      if (!this.adjacentMatrix) {
        this.$message.error('当前没有可下载文件，请先生成邻接矩阵')
        return
      }
      let rows = ''
      this.adjacentMatrix.map(arr => {
        rows = rows + arr + '\n'
      })
      try {
        if (this.MyBrowserIsIE()) {
          // IE10以及Edge浏览器
          var BOM = '\uFEFF'
          // 文件转Blob格式
          var csvData = new Blob([BOM + rows], { type: 'text/csv' })
          navigator.msSaveBlob(csvData)
        } else {
          let csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows
          // 非ie 浏览器
          this.createDownLoadClick(csvContent, '邻接矩阵.csv')
        }
      } catch (err) {
        alert(err)
      }
    },
    //创建a标签下载
    createDownLoadClick(content, fileName) {
      const link = document.createElement('a')
      link.href = encodeURI(content)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    // 判断是否IE浏览器
    MyBrowserIsIE() {
      let isIE = false
      if (navigator.userAgent.indexOf('compatible') > -1 && navigator.userAgent.indexOf('MSIE') > -1) {
        // ie浏览器
        isIE = true
      }
      if (navigator.userAgent.indexOf('Trident') > -1) {
        // edge 浏览器
        isIE = true
      }
      return isIE
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

  .map {
    width: 100%;
    height: 560px;
    margin-top: 15px;
    border: 2px solid #fff;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.1);
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
    .search_form {
      position: absolute;
      top: 5%;
      left: 2%;
      z-index: 2;
      .el-form-item {
        margin: 0 2px 0 0;
      }
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
