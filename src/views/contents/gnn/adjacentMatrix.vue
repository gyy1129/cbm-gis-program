<template>
  <div class="content">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <el-card class="box-card mb22">
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
      <el-row :gutter="10">
        <!-- 邻接矩阵 结果 -->
        <el-col :span="10">
          <el-card class="box_card mb22">
            <el-button @click="exportAdjacent" class="mb22" type="primary" plain>下载生成结果</el-button>
            <el-input
              type="textarea"
              :autosize="{ minRows: 20, maxRows: 20 }"
              placeholder="等待生成结果..."
              v-model="adjExport"
              readonly
              resize="none"
            ></el-input>
          </el-card>
        </el-col>
        <!-- 图谱 可视化 -->
        <el-col :span="14">
          <el-card class="box_card mb22">
            <div id="graph" v-show="picShow"></div>
            <el-empty description="暂无结果" class="empty" v-show="!picShow"></el-empty>
          </el-card>
        </el-col>
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
export default {
  name: 'adjacentMatrix',
  components: { Tabs, uploadFile },
  data() {
    return {
      firstMenu: '图神经网络',
      secondMenu: '邻接矩阵',
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
      picShow: true,
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
      // 绘制图表
      this.myGraph.setOption(option)
    },
    // 生成邻接矩阵
    getAdjacent() {
      const params = {
        scopeVal: this.wellScope.scopeVal,
        fileName: this.wellScope.fileName
      }
      axios
        .post('http://localhost:3000/gnn/getAdjacent', params)
        .then(res => {
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
          this.$message.error(err.message)
        })
    },
    exportAdjacent() {
      if (!this.adjacentMatrix) {
        this.$message.error('当前没有可下载文件，请先生成邻接矩阵')
        return
      }
      try {
        if (this.MyBrowserIsIE()) {
          // IE10以及Edge浏览器
          var BOM = '\uFEFF'
          // 文件转Blob格式
          var csvData = new Blob([BOM + this.adjExport], { type: 'text/csv' })
          navigator.msSaveBlob(csvData)
        } else {
          let csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + this.adjExport
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
  .box_card {
    #graph {
      width: 600px;
      height: 500px;
      margin: 0 auto;
    }
    .empty {
      width: 600px;
      height: 500px;
      margin: 0 auto;
    }
    /deep/.el-card__body {
      width: 100%;
      .el-textarea {
        width: 90%;
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
