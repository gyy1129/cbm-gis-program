<template>
  <div class="containter" v-loading="loading" element-loading-text="结果马上就好啦！请耐心等待一下~">
    <el-upload
      :action="'none'"
      :auto-upload="false"
      drag
      ref="upload"
      :on-change="onChange"
      :on-remove="onRemove"
      multiple
      show-file-list
      class="uploadFile"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">只能上传csv文件(utf-8)，且不超过500kb</div>
    </el-upload>
    <el-button icon="el-icon-upload" type="primary" style="margin-top: 20px" @click="submitUpload">上传</el-button>
  </div>
</template>

<script>
import { uploadKmeans } from '@/request/api'
export default {
  props: {
    //设置文件保存的路径，作为参数传递进来
    path: String
  },
  data() {
    return {
      fileList: [],
      flagCSV: true,
      loading: false
    }
  },
  methods: {
    //文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
    onChange(file) {
      //file.raw 才是真实的 file 对象
      this.fileList.push(file.raw)
    },
    //文件列表移除文件时的钩子
    onRemove(file) {
      //file.raw 才是真实的 file 对象
      this.fileList.splice(this.fileList.indexOf(file.raw), 1)
    },
    //上传文件
    submitUpload() {
      let formData = new FormData()
      // 向 formData 对象中添加文件
      this.fileList.forEach(file => {
        formData.append('file', file)
      })
      //设置文件保存路径
      formData.append('path', this.path)
      // 判断是否为 空文件
      if (this.fileList.length === 0) {
        this.$message.error('请上传文件！')
        return
      }
      // 判断是否为csv文件
      this.judgeCSV()
      if (this.flagCSV) {
        this.onUploadKmeans(formData)
      }
    },
    judgeCSV() {
      this.fileList.map(file => {
        if (file.name.split('.')[1] !== 'csv') {
          this.$message.error('注意上传文件格式，需要上传cvs文件！')
          this.flagCSV = false
          return
        }
      })
    },
    onUploadKmeans(formData) {
      this.loading = true
      uploadKmeans(formData)
        .then(res => {
          this.loading = false
          if (res.status) {
            this.uploadStatus = true
            this.$message.success(res.message)
          } else {
            this.uploadStatus = false
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.loading = false
        })
    }
  },
  mounted() {}
}
</script>

<style lang="less" scoped>
.containter {
  display: flex;
  align-items: center;
  flex-direction: column;
  .uploadFile {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
}
</style>
