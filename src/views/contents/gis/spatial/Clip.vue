<template>
  <div id="map">
    <el-card class="layers_card">
      <el-button type="primary" @click="uploadDialog = true" size="medium" style="width: 100%">
        <i class="el-icon-plus" /> 添加图层
      </el-button>
      <div class="layers_div">
        <el-tag type="info" class="layers_div_tag">底层OSM地图</el-tag>
        <el-button size="mini" @click="onMapVisual()" :type="mapVisual ? 'primary' : 'info'" round>
          {{ mapVisual ? '显示' : '隐藏' }}
        </el-button>
      </div>
      <el-table :data="layerData" style="width: 100%" :header-cell-style="setRowStyle">
        <el-table-column fixed prop="layer" label="图层" min-width="120" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" min-width="170">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="openProperty(row)" icon="el-icon-tickets" circle></el-button>
            <el-button size="mini" @click="downloadLayer(row)" icon="el-icon-download" circle></el-button>
            <el-button size="mini" @click="delLayer(row)" type="danger" icon="el-icon-delete" circle></el-button>
            <el-button size="mini" @click="onVisual(row)" type="primary" circle>
              {{ row.layerVisual ? '显' : '隐' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card class="tools_card">
      <el-cascader
        v-model="method"
        :options="options"
        @change="handleChange"
        placeholder="请选择分析功能"
      ></el-cascader>
      <el-button @click="cancelClip()" type="primary" round>清除裁剪</el-button>
    </el-card>
    <el-dialog
      :title="titleDialog"
      :visible.sync="methodDisplay"
      append-to-body
      width="40%"
      @close="closeMethodDisplay"
    >
      <div v-show="analysisForm.clipForm">
        <p style="color: red; text-align: center; margin-bottom: 8px">
          注意：如果裁剪过图层，请先"清除裁剪"或"刷新"，再进行其他图层的裁剪！
        </p>
        <el-form :model="spatialAnalysis" ref="spatialAnalysisRef" label-width="150px">
          <el-form-item label="图层：" prop="analysisLayer1">
            <el-select v-model="spatialAnalysis.analysisLayer1" placeholder="请选择图层" style="width: 100%">
              <el-option v-for="item in layerOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div style="text-align: right">
          <el-button @click="closeMethodDisplay">取 消</el-button>
          <el-button type="primary" @click="clipFormSure">确 定</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      title="属性表"
      :visible.sync="propertyDispaly"
      v-if="propertyDispaly"
      append-to-body
      :fullscreen="dialogFull"
      @close="closePropertyDispaly"
    >
      <Property
        @downloadPro="downloadPro"
        @onDialogFull="onDialogFull"
        :originProCol="originProCol"
        :propertyData="propertyData"
        :propertyColumns="propertyColumns"
        :dialogFull="dialogFull"
        :curOriginGeoJSON="curOriginGeoJSON"
      ></Property>
    </el-dialog>
    <el-dialog title="上传文件" :visible.sync="uploadDialog" center append-to-body>
      <GeojsonUpload :path="path" @onUploadGeoJson="onUploadGeoJson"></GeojsonUpload>
    </el-dialog>
    <Attributes></Attributes>
  </div>
</template>

<script>
import 'ol/ol.css'
import { Map, View } from 'ol'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style'
import { click } from 'ol/events/condition.js'
import { Select, DragPan } from 'ol/interaction'
import GeoJSON from 'ol/format/GeoJSON'

import { cloneDeep } from 'lodash'
import shpwrite from 'shp-write'

import { EXPORT_CSV } from '@/utils/index'
import { uploadGeoJson, uploadDatabase, readOriginGeo, layerProperty, delLayers } from '@/request/api'

import Property from '@/views/contents/components/Property.vue'
import GeojsonUpload from '@/views/contents/components/GeojsonUpload.vue'
import Attributes from '@/views/contents/components/Attributes.vue'

export default {
  name: 'Clip',
  components: { GeojsonUpload, Attributes, Property },
  data() {
    return {
      path: './public/', // 设置文件上传到服务器的位置，比如服务器下有 public 目录， 你可以在这里写 ./public/
      uploadDialog: false, // 添加图层 弹框控制
      fileName: '', // 上传文件名
      layerData: [], // layer + layerVisual
      propertyDispaly: false, // 属性表 弹框控制
      propertyData: [], // 数据库中存储的 属性数据
      dialogFull: false, // 属性表 全屏展示控制
      originGeoJSON: null, // 读取的 geojson
      map: null,
      mapLayer: null, // 底层 地图图层
      mapVisual: true,
      source: null,
      vector: null,
      select: null,
      geojsonObj: [], // 存放 layer名 + originGeoJSON + vector层
      currentVector: null, // 当前的 矢量图层
      curOriginGeoJSON: null, // 当前的 geojson
      attrTable: null, // attributes 的container
      attributesDiv: null, // attributes 整个div
      propertyColumns: [], // 属性表中的 展示列 会变化
      originProCol: [], // 属性表中的 展示列 不会变化 是初始列
      downloadProTb: [], // 下载属性表 处理了csv文件

      method: null, // el-cascader级联选择器 绑定值
      methodDisplay: false, // 空间分析 弹框控制
      options: [
        {
          value: 'clip',
          label: '裁剪'
        }
      ],
      spatialAnalysis: {
        analysisLayer: null,
        radius: 500
      },
      titleDialog: null, // 空间分析 弹框名称
      layerOptions: [], //空间分析 图层选项
      analysisForm: {
        clipForm: false
      },
      methodName: '',
      highlight: null, // 裁剪 feature
      center: null, // 裁剪 中心
      rotation: null, // 裁剪 分辨率
      offsetX: null,
      offsetY: null,
      pixelScale: null // 裁剪 像素
    }
  },
  created() {
    this.readOriginGeo()
  },
  mounted() {
    this.initMap()
    this.map.on('click', this.addSelectInteraction)
    this.attributesDiv = document.getElementById('main-attributes')
    this.attrTable = document.getElementById('main-attributes-container')
  },
  methods: {
    // 取消裁剪
    cancelClip() {
      this.$router.go(0) // 刷新
    },
    // 确认 裁剪
    clipFormSure() {
      const { analysisLayer1 } = this.spatialAnalysis
      if (!analysisLayer1) {
        this.$message.error('请选择图层')
        return
      }

      this.geojsonObj.map(item => {
        if (analysisLayer1 === item.layer) {
          this.originGeoJSON1 = item.originGeoJSON
        }
      })
      this.clipAnalyse()
    },
    clipAnalyse() {
      let clipSource = new VectorSource({
        features: new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(this.originGeoJSON1)
      })
      const clipLayer = new VectorLayer({
        style: null,
        source: clipSource
      })
      let features = clipLayer.getSource().getFeatures()
      if (features.length > 1) {
        this.$message.error('请选择只有一个要素特征的图层')
        return
      }
      features.forEach(feature => {
        this.highlight = feature
        let _coord = feature.getGeometry().getCoordinates()
        console.log(_coord)
        this.map.render()
        this.map.on('precompose', this.clip)
      })

      this.map.getView().setMinZoom(9.5) // zoom  设置一致 禁用放大缩小
      this.map.getView().setMaxZoom(9.5)
      // 禁止拖拽
      this.map.getInteractions().forEach(function (element) {
        if (element instanceof DragPan) {
          let pan = element
          pan.setActive(false)
        }
      })
      this.map.getView().fit(clipSource.getExtent(), this.map.getSize())
      this.closeMethodDisplay()
    },
    clip(evt) {
      this.canvas = evt.context
      this.canvas.save()
      let coords = this.highlight.getGeometry().getCoordinates()
      let frameState = evt.frameState
      let pixelRatio = frameState.pixelRatio
      let viewState = frameState.viewState
      this.center = viewState.center
      let resolution = viewState.resolution
      this.rotation = viewState.rotation
      let size = frameState.size
      this.offsetX = Math.round((pixelRatio * size[0]) / 2)
      this.offsetY = Math.round((pixelRatio * size[1]) / 2)
      this.pixelScale = pixelRatio / resolution

      this.canvas.beginPath()
      if (this.highlight.getGeometry().getType() == 'MultiPolygon') {
        for (let i = 0; i < coords.length; i++) {
          this.createClip(coords[i][0], this.canvas)
        }
      } else if (this.highlight.getGeometry().getType() == 'Polygon') {
        this.createClip(coords[0], this.canvas)
      }
      this.canvas.clip()
    },
    createClip(coords, canvas) {
      for (let i = 0, cout = coords.length; i < cout; i++) {
        let xLen = Math.round((coords[i][0] - this.center[0]) * this.pixelScale)
        let yLen = Math.round((this.center[1] - coords[i][1]) * this.pixelScale)
        let x = this.offsetX
        let y = this.offsetY
        if (this.rotation) {
          x = xLen * Math.cos(this.rotation) - yLen * Math.sin(this.rotation) + this.offsetX
          y = xLen * Math.sin(this.rotation) + yLen * Math.cos(this.rotation) + this.offsetY
        } else {
          x = xLen + this.offsetX
          y = yLen + this.offsetY
        }
        if (i == 0) {
          canvas.moveTo(x, y)
        } else {
          canvas.lineTo(x, y)
        }
      }
      canvas.closePath()
    },

    // 空间分析 取消 + 关闭
    closeMethodDisplay() {
      this.analysisForm.clipForm = false
      this.method = null
      this.methodDisplay = false
    },
    // 级联选择器 切换
    handleChange(value) {
      if (value[value.length - 1] === 'clip') {
        this.titleDialog = '裁剪'
        this.analysisForm.clipForm = true
        this.methodName = 'clip'
      }

      this.layerOptions = []
      this.geojsonObj.map(item => {
        this.layerOptions.push({ label: item.layer, value: item.layer })
      })
      this.methodDisplay = true
    },

    // Property组件 触发函数
    onDialogFull(dialogFullProp) {
      this.dialogFull = dialogFullProp
    },
    // Property组件 触发导出 属性表
    downloadPro() {
      this.downloadProTb = []
      let key = Object.keys(this.propertyData[0])
      this.downloadProTb.push(key)
      this.propertyData.map(item => {
        let value = Object.values(item)
        let firstval = '\r\n' + value[0]
        value.splice(0, 1, firstval)
        this.downloadProTb.push(value)
      })
      EXPORT_CSV(this.downloadProTb, '属性表')
    },

    // 关闭 属性弹框
    closePropertyDispaly() {
      this.dialogFull = false
    },

    // 读取已有 geojson文件
    readOriginGeo() {
      readOriginGeo()
        .then(res => {
          this.loading = false
          if (res.status) {
            res.results.map(item => {
              this.originGeoJSON = item.originGeoJSON
              this.layerData.push(item.layerData)
              this.addLayer(this.originGeoJSON)
              this.geojsonObj.push({
                layer: item.layerData.layer,
                originGeoJSON: this.originGeoJSON,
                vector: this.vector
              })
            })
            res.results.length !== 0 && this.$message.success('已获取文件，并展示')
          }
        })
        .catch(() => {
          this.loading = false
        })
    },

    // 选中 图层
    addSelectInteraction(event) {
      this.select && this.select.getFeatures().clear() // 清空已选要素
      this.select = new Select({
        condition: click,
        style: new Style({
          fill: new Fill({
            color: 'rgba(100, 197, 103, 0.3)'
          }),
          stroke: new Stroke({
            color: '#64c567',
            width: 2
          }),
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: '#64c567'
            })
          })
        })
      })
      this.map.addInteraction(this.select)
      this.seleceFeatureAndShowProperties(event)
    },
    // 点选查看属性
    seleceFeatureAndShowProperties(event) {
      let that = this
      let pixel = this.map.getEventPixel(event.originalEvent)
      let attrTable = that.attrTable
      attrTable.innerHTML = '' // 清空子元素
      this.map.forEachFeatureAtPixel(pixel, function (feature) {
        if (feature != undefined) {
          // 选中要素的情况
          that.attributesDiv.style.top = '20%' // 消失
          that.attributesDiv.style.opacity = '0'
          setTimeout(() => {
            that.attributesDiv.style.top = '15%' // 出现
            that.attributesDiv.style.opacity = '1'
          }, 100)
          that.attributes = feature.getProperties() // 填充要素属性
          for (let item in that.attributes) {
            if (item === 'geometry') {
              continue
            }
            let div = document.createElement('div')
            div.className = 'attrLine'
            let spanChildLeft = document.createElement('span')
            spanChildLeft.className = 'attrLineLeft'
            spanChildLeft.innerHTML = '&nbsp;' + item
            let spanChildRight = document.createElement('span')
            spanChildRight.className = 'attrLineRight'
            spanChildRight.innerHTML = that.attributes[item]
            div.appendChild(spanChildLeft)
            div.appendChild(spanChildRight)
            attrTable.appendChild(div)
          }
        }
      })
      if (attrTable.innerHTML === '') {
        // 没有选中要素的情况
        that.attributesDiv.style.top = '20%' // 出现
        that.attributesDiv.style.opacity = '0'
      }
    },
    // 上传 btn
    onUploadGeoJson(fileList, formData) {
      this.fileName = fileList[0].name.split('.')[0]
      let geojson = fileList[0].name.split('.')[1]
      if (geojson !== 'geojson') {
        this.$message.error('注意上传文件格式，需要上传geojson文件！')
        return
      } else {
        this.uploadGeoJson(formData)
      }
    },
    // 上传 geojson文件
    uploadGeoJson(formData) {
      this.loading = true
      uploadGeoJson(formData)
        .then(res => {
          this.loading = false
          if (res.status) {
            this.uploadStatus = true
            this.uploadDatabase()
            this.$message.success(res.message)
            this.uploadDialog = false
          } else {
            this.uploadStatus = false
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 上传到数据库中
    uploadDatabase() {
      const params = { fileName: this.fileName }
      uploadDatabase(params)
        .then(res => {
          this.loading = false
          if (res.status) {
            this.originGeoJSON = res.result
            this.layerData.push(res.layerData)
            this.$message.success(res.message)
            this.addLayer(this.originGeoJSON)
            this.geojsonObj.push({ layer: this.fileName, originGeoJSON: this.originGeoJSON, vector: this.vector })
          } else {
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    setRowStyle() {
      return 'fontWeight: bold;textAlign: center;'
    },

    // 打开 属性
    openProperty(row) {
      this.currentObj(row)
      const params = { layer: row.layer }
      layerProperty(params)
        .then(res => {
          this.loading = false
          if (res.status) {
            this.propertyColumns = res.results.propertyColumns
            this.originProCol = cloneDeep(this.propertyColumns)
            this.propertyData = res.results.propertyData
            this.propertyDispaly = true
          }
        })
        .catch(() => {
          this.loading = false
        })
    },

    // 切换 当前geojsonObj
    currentObj(row) {
      this.geojsonObj.map(item => {
        if (item.layer === row.layer) {
          this.currentVector = item.vector
          this.curOriginGeoJSON = item.originGeoJSON
        }
      })
    },
    // 下载该图层 转化为 shapefile格式
    downloadLayer(row) {
      const options = {
        folder: row.layer,
        types: {
          point: row.layer,
          polygon: row.layer,
          line: row.layer
        }
      }
      this.currentObj(row)
      console.log(this.curOriginGeoJSON)
      shpwrite.download(this.curOriginGeoJSON, options)
    },
    // 删除图层
    delLayer(row) {
      this.currentObj(row)
      this.map.removeLayer(this.currentVector)
      this.layerData = this.layerData.filter(item => item.layer !== row.layer)
      this.geojsonObj = this.geojsonObj.filter(item => item.layer !== row.layer)
      const params = { layer: row.layer }
      delLayers(params)
        .then(res => {
          this.loading = false
          if (res.status) {
            this.$message.success(res.message)
          } else {
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 图层 显示与隐藏
    onVisual(row) {
      row.layerVisual = !row.layerVisual
      this.currentObj(row)
      row.layerVisual ? this.map.addLayer(this.currentVector) : this.map.removeLayer(this.currentVector)
    },
    // 底层地图 显示与隐藏
    onMapVisual() {
      this.mapVisual = !this.mapVisual
      this.mapVisual ? this.map.addLayer(this.mapLayer) : this.map.removeLayer(this.mapLayer)
    },
    // 添加图层
    addLayer(originGeoJSON) {
      this.source = new VectorSource({
        features: new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(originGeoJSON)
        // url: '/anhui_xianjitongjishuju_WGS84.geojson',
        // format: new GeoJSON()
      })

      this.vector = new VectorLayer({
        style: new Style({
          stroke: new Stroke({
            color: 'rgba(30,144,255)',
            width: 3
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)'
          }),
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: '#1E90FF'
            })
          })
        }),
        source: this.source,
        visible: true
      })

      this.map.addLayer(this.vector)
      this.map.getView().fit(this.source.getExtent(), this.map.getSize())
    },
    initMap() {
      this.mapLayer = new TileLayer({ source: new OSM() })
      this.map = new Map({
        target: 'map',
        layers: [this.mapLayer],
        view: new View({
          center: [110.46912, 36.24274],
          zoom: 5
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
#map {
  width: 100%;
  height: 100%;
  .layers_card {
    position: absolute;
    top: 1%;
    left: 0.5%;
    z-index: 2;
    /deep/.el-table--enable-row-transition .el-table__body td.el-table__cell {
      text-align: center;
    }
    .layers_div {
      margin: 10px 0 2px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      .layers_div_tag {
        width: 70%;
        text-align: center;
        margin-right: 10px;
      }
    }
  }
  .tools_card {
    position: absolute;
    top: 1%;
    left: 20%;
    z-index: 2;
  }
}
</style>
