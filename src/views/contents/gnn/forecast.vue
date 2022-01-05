<template>
  <div class="">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main" v-loading="loading" element-loading-text="结果马上就好啦！请耐心等待一下~">
      <!-- 上传文件 + 模型预测form -->
      <el-card class="mb15">
        <el-row :gutter="12" class="el_row_first mb15">
          <el-col :span="3">
            <el-button type="primary" @click="uploadDialog = true">上传文件</el-button>
          </el-col>
          <el-col :span="16">
            <p>使用说明：需要先上传文件(文件名不要用中文)，再进行功能操作！</p>
          </el-col>
        </el-row>
        <!-- 模型预测 -->
        <el-form :model="modelPrediction" label-width="130px" :rules="rules" ref="modelPrediction">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-form-item label="邻接矩阵文件：" prop="adjFile">
                <el-input v-model="modelPrediction.adjFile" placeholder="请输入上传文件名" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="时间序列文件：" prop="timeFile">
                <el-input v-model="modelPrediction.timeFile" placeholder="请输入上传文件名" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="训练次数：" prop="trainTime">
                <el-input v-model.number="modelPrediction.trainTime" placeholder="请输入训练次数" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="primary" @click="onPrediction">模型预测</el-button>
                <el-button type="primary" @click="onVisual" plain>结果可视化</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <!-- 模型预测 结果 -->
      <el-card class="mb15">
        <el-row>
          <el-button @click="exportPredict" class="mb15" type="primary" plain>下载预测结果</el-button>
        </el-row>
        <el-row>
          <el-input
            type="textarea"
            :autosize="{ minRows: 15, maxRows: 20 }"
            placeholder="等待预测结果评价..."
            v-model="preResultEvaluate"
            readonly
            resize="none"
          ></el-input>
        </el-row>
      </el-card>
      <!-- 预测结果 可视化 -->
      <el-row :gutter="11">
        <el-col :span="12">
          <el-card class="mb15">
            <div v-show="allImgShow" class="imgDiv">
              <span>其中一口井的预测结果展示:</span>
              <img :src="allImgSrc" alt="其中一口井的预测结果展示" />
            </div>
            <el-empty description="暂无结果" class="empty" v-show="!allImgShow"></el-empty>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="mb15">
            <div v-show="partImgShow" class="imgDiv">
              <span>其中一口井的部分预测结果展示:</span>
              <img :src="partImgSrc" alt="其中一口井的部分预测结果展示" />
            </div>
            <el-empty description="暂无结果" class="empty" v-show="!partImgShow"></el-empty>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <el-dialog title="上传文件" :visible.sync="uploadDialog" center append-to-body>
      <uploadFile :path="path"></uploadFile>
      <div class="explain">
        <p>上传文件格式示例（左图：邻接矩阵，右图：时间序列）:</p>
        <div class="explain_img">
          <img src="@/assets/images/adj_format.png" alt="文件上传格式" style="margin-right: 15px" />
          <img src="@/assets/images/gas_format.png" alt="文件上传格式" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import uploadFile from '../components/uploadFile.vue'
import Tabs from '../components/Tabs.vue'
import { EXPORT_CSV } from '@/utils/index'
import { getPrediction, getTestAllImg, getTest90DayImg } from '@/request/api'
export default {
  name: 'forecast',
  components: { Tabs, uploadFile },
  data() {
    return {
      firstMenu: '图神经网络',
      secondMenu: '预测',
      path: './public/', // 设置文件上传到服务器的位置，比如服务器下有 public 目录， 你可以在这里写 ./public/
      uploadDialog: false,
      loading: false,
      modelPrediction: {
        adjFile: 'adj',
        timeFile: 'gasOutput',
        trainTime: 2
      },
      rules: {
        adjFile: [{ required: true, message: '请输入上传文件名', trigger: 'blur' }],
        timeFile: [{ required: true, message: '请输入上传文件名', trigger: 'blur' }],
        trainTime: [
          { required: true, message: '请输入训练次数', trigger: 'blur' },
          { type: 'number', message: '范围必须为数字值' }
          // { pattern: /^([1-9]\d\d|1000)$/, message: '范围要在100-1000', trigger: 'blur' }
        ]
      },
      preResultEvaluate: '',
      allImgShow: false,
      partImgShow: false,
      allImgBase64: null,
      partImgBase64: null,
      allImgSrc: null,
      partImgSrc: null,
      preExport: null
    }
  },
  computed: {},
  methods: {
    // 模型预测 btn
    onPrediction() {
      this.getPreResult()
    },
    // 模型预测 接口
    getPreResult() {
      this.$refs.modelPrediction.validate(valid => {
        if (valid) {
          this.loading = true
          const params = {
            adjFile: this.modelPrediction.adjFile,
            timeFile: this.modelPrediction.timeFile,
            trainTime: this.modelPrediction.trainTime
          }
          getPrediction(params)
            .then(res => {
              this.loading = false
              if (res.status) {
                this.preResultEvaluate = res.preEvaluate
                this.preExport = res.preExport
                this.$message.success(res.message)
              } else {
                this.$message.error(res.message)
              }
            })
            .catch(() => {
              this.loading = false
            })
        }
      })
    },
    // 下载预测结果
    exportPredict() {
      if (!this.preExport) {
        this.$message.error('暂无数据，请先模型预测！')
        return
      }
      EXPORT_CSV(this.preExport, '预测结果')
    },
    // 结果可视化 btn
    onVisual() {
      if (!this.preResultEvaluate) {
        this.$message.error('请先进行模型预测，再可视化！')
        return
      }
      this.getPredictionPic()
    },
    // 获取 预测结果图片
    getPredictionPic() {
      this.loading = true
      // 获取 全部
      getTestAllImg()
        .then(res => {
          this.loading = false
          if (res.status) {
            this.allImgBase64 = res.imgBase64
            this.allImgSrc = 'data:image/jpge;base64,' + this.allImgBase64
            this.allImgShow = true
          } else {
            this.allImgShow = false
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.allImgShow = false
          this.loading = false
        })
      // 获取 部分
      // this.loading = true
      getTest90DayImg()
        .then(res => {
          if (res.status) {
            this.loading = false
            this.partImgBase64 = res.imgBase64
            this.partImgSrc = 'data:image/jpge;base64,' + this.partImgBase64
            this.partImgShow = true
          } else {
            this.partImgShow = false
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.partImgShow = false
          this.loading = false
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
  .imgDiv {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
  }
}
/deep/.el-dialog--center .el-dialog__body {
  display: flex;
  justify-content: center;
  flex-direction: column;
  .explain {
    display: flex;
    flex-direction: column;
    align-items: center;
    p {
      color: red;
      padding: 8px 0;
    }
    .explain_img {
      display: flex;
    }
  }
}
</style>
