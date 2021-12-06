<template>
  <div id="map">
    <el-card class="layers_card">
      <el-button type="primary" @click="uploadDialog = true" size="medium" style="width: 100%">
        <i class="el-icon-plus" /> 添加图层
      </el-button>
      <el-table :data="layerData" style="width: 100%" :header-cell-style="setRowStyle">
        <el-table-column fixed prop="layer" label="图层" min-width="120" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" min-width="170">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="openProperty(row)" icon="el-icon-tickets" circle></el-button>
            <el-button size="mini" @click="downloadLayer(row)" icon="el-icon-download" circle></el-button>
            <el-button size="mini" @click="delLayer(row)" type="danger" icon="el-icon-delete" circle></el-button>
            <el-button size="mini" @click="onVisual(row)" type="primary" circle>
              {{ row.layerVisual ? '显' : '隐' }}
              <!-- <i class="el-icon-view" v-show="layerVisual" />
              <img src="@/assets/images/biyan.png" v-show="!layerVisual width="80%" /> -->
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="属性表"
      :visible.sync="propertyDispaly"
      v-if="propertyDispaly"
      append-to-body
      :fullscreen="dialogFull"
      @close="closePropertyDispaly"
    >
      <FilterColumn :columns="originProCol" @model="getColumns"></FilterColumn>
      <el-button size="medium" type="primary" @click="downloadPro" icon="el-icon-download">导出属性</el-button>
      <el-button size="medium" @click="onDialogFull" icon="el-icon-full-screen">
        {{ dialogFull ? '关闭全屏' : '全屏显示' }}
      </el-button>
      <el-table :data="frontEndPageChange">
        <el-table-column type="index" width="60" label="序号" fixed align="center"></el-table-column>
        <template v-for="(item, index) in propertyColumns">
          <el-table-column
            v-if="item.visible"
            :key="index"
            :label="item.name"
            :prop="item.name"
            min-width="120"
            align="center"
          >
          </el-table-column>
        </template>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="paginationOptions.currentPage"
        :page-size="paginationOptions.pageSize"
        :page-sizes="paginationOptions.pageSizes"
        layout="sizes, prev, pager, next, total"
        :total="propertyData.length"
        style="text-align: center; margin-top: 10px"
      >
      </el-pagination>
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
import GeoJSON from 'ol/format/GeoJSON'
import GeojsonUpload from '@/views/contents/components/GeojsonUpload.vue'
import { uploadGeoJson, uploadDatabase, readOriginGeo } from '@/request/api'

import shpwrite from 'shp-write'
import { click } from 'ol/events/condition.js'
import { Select } from 'ol/interaction'
import Attributes from '@/views/contents/gis/components/Attributes.vue'
import FilterColumn from '@/views/contents/gis/components/FilterColumn.vue'
import { layerProperty } from '@/request/api'
import { EXPORT_CSV } from '@/utils/index'
import { cloneDeep } from 'lodash'

export default {
  name: 'Browse',
  components: { GeojsonUpload, Attributes, FilterColumn },
  data() {
    return {
      path: './public/', // 设置文件上传到服务器的位置，比如服务器下有 public 目录， 你可以在这里写 ./public/
      uploadDialog: false,
      flagGeoJson: true,
      fileName: '',
      map: null,
      layerData: [],
      propertyDispaly: false,
      propertyData: [],
      dialogFull: false,
      originGeoJSON: null,
      source: null,
      vector: null,
      geojsonObj: [], // 存放 文件名 geojson vector层

      currentVector: null,
      curOriginGeoJSON: null,
      select: null,
      attrTable: null,
      attributesDiv: null,
      propertyColumns: [],
      originProCol: [],
      paginationOptions: {
        currentPage: 1, // 当前页
        pageSize: 10, // 展示页数
        pageSizes: [10, 20, 30] // 可选择展示页数 数组
      },
      downloadProTb: []
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
  computed: {
    // 前端分页
    frontEndPageChange() {
      let start = (this.paginationOptions.currentPage - 1) * this.paginationOptions.pageSize
      if (start >= this.propertyData.length) start = 0
      let end = this.paginationOptions.currentPage * this.paginationOptions.pageSize
      if (end >= this.propertyData.length) end = this.propertyData.length
      return this.propertyData.slice(start, end)
    }
  },
  methods: {
    // 读取已有 geojson文件
    readOriginGeo() {
      readOriginGeo()
        .then(res => {
          this.loading = false
          if (res.status) {
            res.results.map(item => {
              this.originGeoJSON = item.originGeoJSON
              this.layerData.push(item.layerData)
              this.$message.success(res.message)
              this.addLayer(this.originGeoJSON)
              this.geojsonObj.push({
                layer: item.layerData.layer,
                originGeoJSON: this.originGeoJSON,
                vector: this.vector
              })
            })
            this.$message.success(res.message)
          } else {
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    getColumns(cell) {
      console.log('cell', cell)
      this.propertyColumns = cell
    },
    // 选中 图层
    addSelectInteraction(event) {
      this.select && this.select.getFeatures().clear() // 清空已选要素
      this.select = new Select({
        condition: click,
        style: new Style({
          fill: new Fill({
            color: 'rgba(30, 144, 255, 0.3)'
          }),
          stroke: new Stroke({
            color: '#1E90FF',
            width: 2
          }),
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: '#1E90FF'
            })
          })
        })
      })
      this.map.addInteraction(this.select)
      console.log(1111)
      // console.log(this.select.getSource().getFeatures())
      this.seleceFeatureAndShowProperties(event)
    },
    seleceFeatureAndShowProperties(event) {
      // 点选查看属性
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
    // 关闭 属性弹框
    closePropertyDispaly() {
      this.dialogFull = false
    },
    // 全屏展示
    onDialogFull() {
      this.dialogFull = !this.dialogFull
    },
    // 显示列 设置
    displaycolumn() {},
    // 导出 属性表
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

    // 打开 属性
    openProperty(row) {
      const params = { layer: row.layer }
      layerProperty(params)
        .then(res => {
          this.loading = false
          if (res.status) {
            this.propertyColumns = res.results.propertyColumns
            this.originProCol = cloneDeep(this.propertyColumns)
            console.log(this.originProCol, '--------')
            this.propertyData = res.results.propertyData
            this.propertyDispaly = true
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    handleSizeChange(val) {
      this.paginationOptions.pageSize = val
    },
    handleCurrentChange(val) {
      this.paginationOptions.currentPage = val
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
    },
    // 图层 显示与隐藏
    onVisual(row) {
      row.layerVisual = !row.layerVisual
      this.currentObj(row)
      row.layerVisual ? this.map.addLayer(this.currentVector) : this.map.removeLayer(this.currentVector)
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
          })
        }),
        source: this.source,
        visible: true
      })

      this.map.addLayer(this.vector)
      this.map.getView().fit(this.source.getExtent(), this.map.getSize())
    },
    initMap() {
      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
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
    /*  dialog*/
    /deep/.el-dialog__header {
      padding: 15px 20px 15px;
    }
    /deep/.el-dialog__headerbtn {
      top: 15px;
    }

    /*dialog header*/
    /deep/.el-dialog__header {
      background: #e3eaed;
    }
    /deep/.avue-crud__dialog__header {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      justify-content: space-between;
    }
    /deep/.el-dialog__title {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      word-wrap: break-word;
    }
    /deep/ .avue-crud__dialog__menu {
      padding-right: 20px;
      float: left;
    }
    /deep/.avue-crud__dialog__menu i {
      color: #909399;
      font-size: 15px;
    }
    /deep/.el-icon-full-screen {
      cursor: pointer;
    }
    /deep/.el-icon-full-screen:before {
      content: '\e719';
    }
  }
}
</style>

<style>
/*隐藏ol的一些自带元素*/
.ol-attribution,
.ol-zoom {
  display: none;
}

.ol-popup {
  position: absolute;
  background-color: #fff;
  -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: ' ';
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: #fff;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}
.ol-popup-closer:after {
  content: '✖';
}
</style>
