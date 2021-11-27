<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main" v-loading="loading" element-loading-text="结果马上就好啦！请耐心等待一下~">
      <!-- 上传文件 + 构图 form -->
      <el-card class="mb15">
        <el-row :gutter="12" class="el_row_first">
          <el-col :span="3">
            <el-button type="primary" @click="uploadDialog = true">上传文件</el-button>
          </el-col>
          <el-col :span="12">
            <p>使用说明：需要先上传文件(文件名不要用中文)，再进行功能操作！</p>
          </el-col>
        </el-row>
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
                <el-button type="primary" @click="getAdjacent">生成邻接矩阵</el-button>
                <el-button type="primary" @click="displayGraph" plain>图谱可视化</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <!-- 邻接矩阵 结果 -->
      <el-card class="mb15">
        <el-row>
          <el-button @click="exportAdjacent" class="mb15" type="primary" plain>下载生成结果</el-button>
        </el-row>
        <el-row>
          <el-input
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 15 }"
            placeholder="等待生成结果..."
            v-model="adjExport"
            readonly
            resize="none"
          ></el-input>
        </el-row>
      </el-card>
      <!-- 图谱 可视化 -->
      <el-row style="padding-bottom: 25px; margin-bottom: 25px">
        <el-card>
          <div id="graph" v-show="picShow"></div>
          <el-empty description="暂无结果" class="empty" v-show="!picShow"></el-empty>
        </el-card>
      </el-row>
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
import * as echarts from 'echarts'
import axios from 'axios'
import Tabs from '../components/Tabs.vue'
import uploadFile from '../components/uploadFile.vue'
import { EXPORT_CSV } from '@/utils/index'
export default {
  name: 'adjacentMatrix',
  components: { Tabs, uploadFile },
  data() {
    return {
      firstMenu: '图神经网络',
      secondMenu: '邻接矩阵',
      loading: false,
      path: './public/', // 设置文件上传到服务器的位置，比如服务器下有 public 目录， 你可以在这里写 ./public/
      uploadDialog: false,
      adjacentMatrix: null,
      adjExport: '',
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
      lineList: [],
      picShow: false,
      myGraph: null,
      graphData: [],
      graphLink: []
    }
  },
  methods: {
    // 图谱可视化
    displayGraph() {
      if (this.graphData.length === 0) {
        this.$message.error('请先生成邻接矩阵，再图谱可视化')
        return
      }
      this.picShow = true
      if (this.myGraph) this.myGraph.dispose()
      this.myGraph = echarts.init(document.getElementById('graph'))
      const option = {
        title: {
          left: 'center',
          text: '井间关系图'
        },
        toolbox: {
          feature: {
            restore: { show: true }, //restore，还原，复位原始图表
            saveAsImage: {}
          }
        },
        series: [
          {
            type: 'graph', // 类型:关系图
            layout: 'force', //图的布局，类型为力导图
            symbolSize: 30, // 调整节点的大小
            roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
            draggable: true, //指示节点是否可以拖动
            focusNodeAdjacency: true, //当鼠标移动到节点上，突出显示节点以及节点的边和邻接节点
            // focus: 'adjacency',
            label: {
              show: true
            },
            lineStyle: {
              width: 2,
              color: '#4b565b'
            },
            force: {
              repulsion: 100
            },
            // 数据
            data: this.graphData,
            links: this.graphLink
          }
        ]
      }
      this.myGraph.setOption(option)
    },
    // 生成邻接矩阵
    getAdjacent() {
      this.$refs.wellScope.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {
            scopeVal: this.wellScope.scopeVal,
            fileName: this.wellScope.fileName
          }
          axios
            .post('http://localhost:3000/gnn/getAdjacent', params)
            .then(res => {
              this.loading = false
              if (res.data.status) {
                this.adjacentMatrix = res.data.adjMatrix
                this.graphData = res.data.wellName
                this.graphLink = res.data.wellPair
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
              this.loading = false
              this.$message.error(err.response.data.message)
            })
        }
      })
    },
    // 下载生成结果
    exportAdjacent() {
      if (!this.adjacentMatrix) {
        this.$message.error('当前没有可下载文件，请先生成邻接矩阵')
        return
      }
      EXPORT_CSV(this.adjExport, '邻接矩阵')
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
  .mb15 {
    margin-bottom: 15px;
  }
  .well_scope {
    margin: 20px 0 0 0;
  }
  #graph {
    width: 1000px;
    height: 700px;
    margin: 0 auto;
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
