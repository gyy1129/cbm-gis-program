<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <el-row>
        <el-card class="box-card mb22">
          <!-- 上传文件 btn-->
          <el-row :gutter="12" class="el_row_first">
            <el-col :span="3">
              <el-button type="primary" @click="uploadDialog = true">上传文件</el-button>
            </el-col>
            <el-col :span="12">
              <p>使用说明：需要先上传文件(文件名不要用中文)，再进行聚类功能操作！</p>
            </el-col>
          </el-row>
          <!-- 聚类方法 form-->
          <el-form :model="cluster" ref="cluster" label-width="100px" class="cluster_layout">
            <el-row :gutter="12">
              <el-col :span="6">
                <el-form-item label="最大k值：" prop="maxK">
                  <el-input v-model.trim="cluster.maxK" placeholder="请输入最大k值" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="上传文件名：" prop="fileName">
                  <el-input v-model="cluster.fileName" placeholder="请输入上传文件名" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <el-button type="primary" @click="drawGraph">生成肘部法则图</el-button>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="12">
              <el-col :span="6">
                <el-form-item label="最佳k值：" prop="bestK">
                  <el-input v-model.trim="cluster.bestK" placeholder="请输入最佳k值" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <el-button type="primary" @click="onCluster">k-means聚类</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-row>
      <el-row :gutter="10">
        <!-- 肘部法则图 -->
        <el-col :span="12">
          <el-card class="box_card mb22">
            <div id="Elbow" v-show="picShow"></div>
            <el-empty description="暂无结果" class="empty" v-show="!picShow"></el-empty>
          </el-card>
        </el-col>
        <!-- 聚类结果 -->
        <el-col :span="12">
          <el-card class="box_card mb22">
            <el-empty description="暂无结果" class="empty"></el-empty>
          </el-card>
        </el-col>
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
import * as echarts from 'echarts'
import axios from 'axios'
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
      uploadDialog: false,
      cluster: {
        maxK: null,
        bestK: null,
        fileName: null
      },
      kValue: [],
      picShow: false,
      ElbowValue: []
    }
  },
  computed: {},
  methods: {
    // uploadStatus(val) {
    //   if (val) {
    //     this.uploadDialog = false
    //   }
    //   console.log('uploadStatus', val)
    // },
    onCluster() {
      console.log(this.cluster)
      if (!this.cluster.bestK) {
        this.$message.error('请输入最佳k值!')
        return
      }
      if (!this.cluster.fileName) {
        this.$message.error('请输入上传文件名!')
        return
      }
    },
    drawGraph() {
      if (!this.cluster.maxK) {
        this.$message.error('请输入最大k值!')
        return
      }
      if (!this.cluster.fileName) {
        this.$message.error('请输入上传文件名!')
        return
      }

      console.log(this.ElbowValue)
      this.picShow = true
      this.getElbowResult()
      // debugger
      console.log(this.ElbowValue)
      this.getElbow()
    },
    getElbow() {
      // 初始化echarts实例
      let myElbow = echarts.init(document.getElementById('Elbow'))
      this.kValue = Array.from(Array(Number(this.cluster.maxK)), (v, k) => k + 1)
      // 配置图表中的数据和样式
      const option = {
        title: {
          left: 'center',
          text: '用肘部法则来确定最佳的K值'
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          name: 'k值',
          type: 'category',
          boundaryGap: false,
          data: this.kValue
        },
        yAxis: {
          type: 'value',
          name: '平均畸变程度'
        },
        series: [
          {
            data: this.ElbowValue,
            type: 'line',
            symbol: 'triangle',
            symbolSize: 20,
            lineStyle: {
              color: '#5470C6',
              width: 4,
              type: 'dashed'
            },
            itemStyle: {
              borderWidth: 3,
              borderColor: '#EE6666',
              color: 'yellow'
            }
          }
        ]
      }
      // 绘制图表
      myElbow.setOption(option)
    },
    getElbowResult() {
      const params = {
        maxK: this.cluster.maxK,
        fileName: this.cluster.fileName
      }
      axios
        .post('http://localhost:3000/gnn/getElbowResult', params)
        .then(res => {
          if (res.data.status) {
            this.ElbowValue = res.data.results
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(err => {
          console.log(err)
        })
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
  .box_card {
    display: flex;
    justify-content: center;
    #Elbow {
      width: 600px;
      height: 400px;
    }
    .empty {
      width: 600px;
      height: 400px;
    }
  }
  .cluster_layout {
    margin: 20px 0 0 0;
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
      color: red;
      padding-bottom: 8px;
    }
  }
}
</style>
