<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main" v-loading="loading" element-loading-text="结果马上就好啦！请耐心等待一下~">
      <el-row>
        <el-card class="box-card mb15">
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
          <el-form :model="clusterMax" ref="clusterMax" label-width="120px" class="cluster_layout" :rules="rules">
            <el-row :gutter="12">
              <el-col :span="6">
                <el-form-item label="最大k值：" prop="maxK">
                  <el-input v-model.number="clusterMax.maxK" placeholder="请输入最大k值" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="上传文件名：" prop="fileNameMax">
                  <el-input v-model="clusterMax.fileNameMax" placeholder="请输入上传文件名" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <el-button type="primary" @click="drawGraph">生成肘部法则图</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <el-form :model="clusterBest" ref="clusterBest" label-width="120px" class="cluster_layout" :rules="rules">
            <el-row :gutter="12">
              <el-col :span="6">
                <el-form-item label="最佳k值：" prop="bestK">
                  <el-input v-model.number="clusterBest.bestK" placeholder="请输入最佳k值" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="上传文件名：" prop="fileNameBest">
                  <el-input v-model="clusterBest.fileNameBest" placeholder="请输入上传文件名" clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <el-button type="primary" @click="onCluster">k-means聚类</el-button>
                  <el-button @click="getClusterPic">生成聚类结果图</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-row>
      <el-row :gutter="10">
        <!-- 肘部法则图 -->
        <el-col :span="12">
          <el-card class="box_card mb15">
            <div id="Elbow" v-show="picShow1"></div>
            <el-empty description="暂无结果" class="empty" v-show="!picShow1"></el-empty>
          </el-card>
        </el-col>
        <!-- 聚类结果 -->
        <el-col :span="12">
          <el-card class="box_card mb15">
            <el-button @click="onExport" class="mb15" type="primary" plain>导出结果</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 16, maxRows: 16 }"
              placeholder="等待聚类结果..."
              v-model="clusterValueShow"
              readonly
              resize="none"
            ></el-input>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <!-- 聚类结果图 -->
        <el-col :span="12">
          <el-card class="box_card mb15">
            <div id="clusterResult" v-show="picShow2"></div>
            <el-empty description="暂无结果" class="empty" v-show="!picShow2"></el-empty>
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
import { EXPORT_ALL } from '@/utils/index'
import Tabs from '../components/Tabs.vue'
import uploadFile from '../components/uploadFile.vue'
import { getElbowResult, getClusterResult } from '@/request/api'
import { cloneDeep } from 'lodash'
export default {
  name: 'gisData',
  components: { Tabs, uploadFile },
  data() {
    return {
      firstMenu: '图神经网络',
      secondMenu: '聚类',
      loading: false,
      path: './public/', // 设置文件上传到服务器的位置，比如服务器下有 public 目录， 你可以在这里写 ./public/
      uploadDialog: false,
      clusterMax: {
        maxK: 7,
        fileNameMax: 'test'
      },
      clusterBest: {
        bestK: 3,
        fileNameBest: 'test'
      },
      kValue: [],
      picShow1: false,
      picShow2: false,
      ElbowValue: [],
      clusterValue: [],
      clusterValueShow: '',
      rules: {
        maxK: [
          { required: true, message: '请输入最大k值', trigger: 'blur' },
          { type: 'number', message: '最大k值必须为数字值' },
          { pattern: /^([2-9]|1[0-5])$/, message: 'k值范围要在2-15', trigger: 'blur' }
        ],
        bestK: [
          { required: true, message: '请输入最佳k值', trigger: 'blur' },
          { type: 'number', message: '最大k值必须为数字值' },
          { pattern: /^([2-9]|1[0-5])$/, message: 'k值范围要在2-15', trigger: 'blur' }
        ],
        fileNameMax: [{ required: true, message: '请输入上传文件名', trigger: 'blur' }],
        fileNameBest: [{ required: true, message: '请输入上传文件名', trigger: 'blur' }]
      },
      exportTitle: [{ label: '聚类结果', prop: 'clusterValue', width: '100' }],
      exportResult: []
    }
  },
  computed: {},
  methods: {
    // 生成肘部法则图 btn
    drawGraph() {
      this.$refs.clusterMax.validate(valid => {
        if (valid) {
          this.picShow1 = true
          this.getElbowResult()
        }
      })
    },
    // k-means聚类 btn
    onCluster() {
      this.$refs.clusterMax.validate(valid => {
        if (valid) {
          this.picShow1 = true
          this.getClusterResult()
        }
      })
    },
    // 画图--聚类结果图（柱状图）
    getClusterPic() {
      if (this.clusterValue.length === 0) {
        this.$message.error('聚类结果为空，不能生成聚类图')
        return
      }
      this.picShow2 = true
      const clusterValue = cloneDeep(this.clusterValue)
      const clusterClassify = clusterValue.reduce((prev, next) => {
        prev[next] = prev[next] + 1 || 1
        return prev
      }, {})
      let classificationKey = Object.keys(clusterClassify).map(key => '聚类' + key)
      let classificationValue = Object.values(clusterClassify)

      // 开始画图
      if (this.myClusterResult) this.myClusterResult.dispose()
      // 初始化echarts实例
      this.myClusterResult = echarts.init(document.getElementById('clusterResult'))
      // 配置图表中的数据和样式
      const option = {
        title: {
          left: 'center',
          text: '聚类结果图'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar'] },
            saveAsImage: { show: true }
          }
        },
        xAxis: {
          name: '类别',
          type: 'category',
          data: classificationKey,
          axisTick: {
            alignWithLabel: true // 刻度居中
          }
        },
        yAxis: {
          type: 'value',
          name: '井数'
        },
        series: [
          {
            name: '井数',
            data: classificationValue,
            type: 'bar',
            barWidth: '60%'
          }
        ]
      }
      // 绘制图表
      option && this.myClusterResult.setOption(option)
    },

    // 画图--肘部法则图
    getElbow() {
      if (this.myElbow) this.myElbow.dispose()
      // 初始化echarts实例
      this.myElbow = echarts.init(document.getElementById('Elbow'))
      this.kValue = Array.from(Array(Number(this.clusterMax.maxK)), (v, k) => k + 1)
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
      this.myElbow.setOption(option)
    },
    //  接口获取 ElbowValue 同时 画图
    getElbowResult() {
      this.loading = true
      const params = {
        maxK: this.clusterMax.maxK,
        fileNameMax: this.clusterMax.fileNameMax
      }
      getElbowResult(params)
        .then(res => {
          this.loading = false
          if (res.status) {
            this.ElbowValue = res.results
            this.getElbow()
          } else {
            this.picShow1 = false
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.picShow1 = false
          this.loading = false
        })
    },
    // 接口 聚类
    getClusterResult() {
      this.loading = true
      const params = {
        bestK: this.clusterBest.bestK,
        fileNameBest: this.clusterBest.fileNameBest
      }
      getClusterResult(params)
        .then(res => {
          this.loading = false
          if (res.status) {
            this.clusterValue = res.results
            this.clusterValueShow = res.results + ''
            console.log(this.clusterValue)
          } else {
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    //  导出结果
    onExport() {
      if (this.clusterValue.length === 0) {
        this.$message.error('聚类结果为空，不能导出文件')
        return
      }
      this.clusterValue.map(val => {
        let params = { clusterValue: val }
        this.exportResult.push(params)
      })
      EXPORT_ALL(this.exportTitle, this.exportResult, 'K-means聚类结果')
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
  // background-color: #fff;
  .el_row_first {
    display: flex;
    align-items: center;
    color: red;
  }
  .mb15 {
    margin-bottom: 15px;
  }
  .box_card {
    #Elbow {
      width: 600px;
      height: 400px;
      margin: 0 auto;
    }
    .empty {
      width: 600px;
      height: 400px;
      margin: 0 auto;
    }
    #clusterResult {
      width: 600px;
      height: 400px;
      margin: 0 auto;
    }
  }
  .cluster_layout {
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
