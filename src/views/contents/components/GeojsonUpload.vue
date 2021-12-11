<template>
  <div class="containter" v-loading="loading" element-loading-text="结果马上就好啦！请耐心等待一下~">
    <el-upload
      :action="'none'"
      :auto-upload="false"
      drag
      ref="upload"
      :on-change="onChange"
      :on-remove="onRemove"
      show-file-list
      class="uploadFile"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">只能上传geojson文件，文件名不能是纯数字或者中文！</div>
    </el-upload>
    <el-button icon="el-icon-upload" type="primary" style="margin-top: 20px" @click="submitUpload">上传</el-button>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'geojsonUpload',
  props: {
    //设置文件保存的路径，作为参数传递进来
    path: {
      type: String
    }
  },
  data() {
    return {
      fileList: [],
      copyFileList: [],
      flagGeoJson: true,
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
      const time = moment(new Date().getTime()).format('YYYY_MM_DD_HH_mm_ss')
      this.copyFileList = []
      // 向 formData 对象中添加文件
      this.fileList.forEach(file => {
        let name = file.name.split('.')[0] + '_' + time + '.geojson'
        let copyFile = new File([file], name)
        this.copyFileList.push(copyFile)
        formData.append('file', copyFile)
      })
      //设置文件保存路径
      formData.append('path', this.path)
      if (this.fileList.length === 0) {
        this.$message.error('请上传文件！')
        return
      }
      if (this.fileList.length >= 2) {
        this.$message.error('文件数量超出上限，每位用户最多上传1份文件')
        return
      }
      this.$emit('onUploadGeoJson', this.copyFileList, formData)
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
