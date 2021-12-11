<template>
  <div class="">
    <!-- 缓冲区 -->
    <div v-show="analysisForm.bufferForm">
      <el-form :model="spatialAnalysis" ref="spatialAnalysisRef" label-width="150px">
        <el-form-item label="图层：" prop="analysisLayer1">
          <el-select v-model="spatialAnalysis.analysisLayer1" placeholder="请选择图层" style="width: 100%">
            <el-option v-for="item in layerOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缓冲区半径(米)：" prop="radius">
          <el-input v-model.number="spatialAnalysis.radius" placeholder="请输入缓冲区半径" clearable></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog_footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="bufferFormSure">确 定</el-button>
      </div>
    </div>
    <!-- 几何中心 + 几何边界 -->
    <div v-show="analysisForm.convexHullForm">
      <el-form :model="spatialAnalysis" ref="spatialAnalysisRef" label-width="150px">
        <el-form-item label="图层：" prop="analysisLayer1">
          <el-select v-model="spatialAnalysis.analysisLayer1" placeholder="请选择图层" style="width: 100%">
            <el-option v-for="item in layerOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog_footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="convexHullFormSure">确 定</el-button>
      </div>
    </div>
    <!-- 叠置分析 -->
    <div v-show="analysisForm.overlayForm">
      <el-form :model="spatialAnalysis" ref="spatialAnalysisRef" label-width="150px">
        <el-form-item label="图层1：" prop="analysisLayer1">
          <el-select v-model="spatialAnalysis.analysisLayer1" placeholder="请选择图层" style="width: 100%">
            <el-option v-for="item in layerOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图层2：" prop="analysisLayer2">
          <el-select v-model="spatialAnalysis.analysisLayer2" placeholder="请选择图层" style="width: 100%">
            <el-option v-for="item in layerOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog_footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="overlayFormSure">确 定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
// import { Feature } from 'ol'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom'
import LinearRing from 'ol/geom/LinearRing'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'

import * as jsts from '@/utils/jsts.js' // 单独引入 jsts

import moment from 'moment'
export default {
  name: 'SpatialAnalysis',
  components: {},
  props: {
    geojsonObj: {
      type: Array,
      required: true
    },
    layerOptions: {
      type: Array,
      required: true
    },
    analysisForm: {
      type: Object,
      required: true
    },
    methodName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      originGeoJSON1: null,
      originGeoJSON2: null,
      options: [
        {
          value: 'buffer',
          label: '缓冲区分析'
        },
        {
          value: 'overlay',
          label: '叠置分析',
          children: [
            {
              value: 'union',
              label: '联合'
            },
            {
              value: 'intersection',
              label: '相交'
            },
            {
              value: 'difference',
              label: '异同'
            },
            {
              value: 'symDifference',
              label: '对称异同'
            }
          ]
        }
      ],
      spatialAnalysis: {
        analysisLayer1: null,
        analysisLayer2: null,
        radius: 500
      },
      fileName: ''
    }
  },
  computed: {},
  methods: {
    cancel() {
      this.$emit('closeMethodDisplay')
    },
    addFeatures(originGeoJSON) {
      let format = new GeoJSON()
      let features = format.readFeatures(originGeoJSON, {
        featureProjection: 'EPSG:3857'
      })
      return features
    },
    addParser() {
      let parser = new jsts.io.OL3Parser()
      parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon)
      return parser
    },
    addVectorLayer(features) {
      this.source = new VectorSource()
      this.source.addFeatures(features)
      this.vectorLayer = new VectorLayer({
        source: this.source,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.4)'
          }),
          stroke: new Stroke({
            color: '#ffcc33',
            width: 3
          }),
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: '#ffcc33'
            })
          })
        })
      })
    },
    convexHullFormSure() {
      const time = moment(new Date().getTime()).format('YYYY_MM_DD_HH_mm_ss')
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
      if (this.methodName === 'convexHull') {
        this.convexHullAnalyse()
        this.fileName = 'convexHull_' + analysisLayer1 + '_' + time
      } else {
        this.centroidAnalyse()
        this.fileName = 'centroid_' + analysisLayer1 + '_' + time
      }

      this.$emit('onAnalysis', { vectorLayer: this.vectorLayer, fileName: this.fileName })
    },
    convexHullAnalyse() {
      console.log('几何凸面')
      let features = this.addFeatures(this.originGeoJSON1)
      let parser = this.addParser()

      for (let i = 0; i < features.length; i++) {
        let feature = features[i]
        let jstsGeom = parser.read(feature.getGeometry())
        let convexHulled = jstsGeom.convexHull()
        feature.setGeometry(parser.write(convexHulled))
      }
      this.addVectorLayer(features)
    },
    centroidAnalyse() {
      console.log('几何质心')
      let features = this.addFeatures(this.originGeoJSON1)
      let parser = this.addParser()

      for (let i = 0; i < features.length; i++) {
        let feature = features[i]
        let jstsGeom = parser.read(feature.getGeometry())
        let centerpoint = jstsGeom.getCentroid()
        feature.setGeometry(parser.write(centerpoint))
      }
      this.addVectorLayer(features)
    },

    bufferFormSure() {
      const time = moment(new Date().getTime()).format('YYYY_MM_DD_HH_mm_ss')
      const { analysisLayer1, radius } = this.spatialAnalysis
      if (!analysisLayer1) {
        this.$message.error('请选择图层1')
        return
      }
      if (!radius) {
        this.$message.error('请输入缓冲区半径')
        return
      }
      this.geojsonObj.map(item => {
        if (analysisLayer1 === item.layer) {
          this.originGeoJSON1 = item.originGeoJSON
        }
      })
      this.bufferAnalyse(radius)
      this.$emit('onAnalysis', {
        vectorLayer: this.vectorLayer,
        fileName: 'buffer_' + radius + '_' + analysisLayer1 + '_' + time
      })
    },
    bufferAnalyse(radius) {
      console.log('缓冲区分析')
      let features = this.addFeatures(this.originGeoJSON1)
      let parser = this.addParser()

      for (let i = 0; i < features.length; i++) {
        let feature = features[i]
        let jstsGeom = parser.read(feature.getGeometry())
        let buffered = jstsGeom.buffer(radius)
        feature.setGeometry(parser.write(buffered))
      }
      this.addVectorLayer(features)
    },
    // 叠置分析 确定btn
    overlayFormSure() {
      const time = moment(new Date().getTime()).format('YYYY_MM_DD_HH_mm_ss')
      const { analysisLayer1, analysisLayer2 } = this.spatialAnalysis
      if (!analysisLayer1) {
        this.$message.error('请选择图层1')
        return
      }
      if (!analysisLayer2) {
        this.$message.error('请选择图层2')
        return
      }
      this.geojsonObj.map(item => {
        if (analysisLayer1 === item.layer) {
          this.originGeoJSON1 = item.originGeoJSON
        }
        if (analysisLayer2 === item.layer) {
          this.originGeoJSON2 = item.originGeoJSON
        }
      })
      this.overlayAnalyse()
      this.$emit('onAnalysis', {
        vectorLayer: this.vectorLayer,
        fileName: this.methodName + '_' + analysisLayer1 + '_' + time
      })
    },
    overlayAnalyse() {
      console.log(this.methodName)
      let features1 = this.addFeatures(this.originGeoJSON1)
      let features2 = this.addFeatures(this.originGeoJSON2)
      let parser = this.addParser()
      switch (this.methodName) {
        case 'union':
          this.union(features1, features2, parser)
          break
        case 'intersection':
          this.intersection(features1, features2, parser)
          break
        case 'difference':
          this.difference(features1, features2, parser)
          break
        case 'symDifference':
          this.symDifference(features1, features2, parser)
          break
      }
    },
    union(features1, features2, parser) {
      for (let i = 0; i < features1.length; i++) {
        let feature1 = features1[i]
        let jstsGeom1 = parser.read(feature1.getGeometry())
        let buffered1 = jstsGeom1.buffer(0)
        for (let i = 0; i < features2.length; i++) {
          let feature2 = features2[i]
          let jstsGeom2 = parser.read(feature2.getGeometry())
          let buffered2 = jstsGeom2.buffer(0)
          // let unioned = jstsGeom1.union(jstsGeom2)
          let unioned = buffered1.union(buffered2)
          feature2.setGeometry(parser.write(unioned))
        }
      }
      this.addVectorLayer(features2)
    },
    intersection(features1, features2, parser) {
      for (let i = 0; i < features1.length; i++) {
        let feature1 = features1[i]
        let jstsGeom1 = parser.read(feature1.getGeometry())
        let buffered1 = jstsGeom1.buffer(0)
        for (let i = 0; i < features2.length; i++) {
          let feature2 = features2[i]
          let jstsGeom2 = parser.read(feature2.getGeometry())
          let buffered2 = jstsGeom2.buffer(0)
          // let unioned = jstsGeom1.union(jstsGeom2)
          let unioned = buffered1.intersection(buffered2)
          feature2.setGeometry(parser.write(unioned))
        }
      }
      this.addVectorLayer(features2)
    },
    difference(features1, features2, parser) {
      for (let i = 0; i < features1.length; i++) {
        let feature1 = features1[i]
        let jstsGeom1 = parser.read(feature1.getGeometry())
        let buffered1 = jstsGeom1.buffer(0)
        for (let i = 0; i < features2.length; i++) {
          let feature2 = features2[i]
          let jstsGeom2 = parser.read(feature2.getGeometry())
          let buffered2 = jstsGeom2.buffer(0)
          // let unioned = jstsGeom1.union(jstsGeom2)
          let unioned = buffered1.difference(buffered2)
          feature2.setGeometry(parser.write(unioned))
        }
      }
      this.addVectorLayer(features2)
    },
    symDifference(features1, features2, parser) {
      for (let i = 0; i < features1.length; i++) {
        let feature1 = features1[i]
        let jstsGeom1 = parser.read(feature1.getGeometry())
        let buffered1 = jstsGeom1.buffer(0)
        for (let i = 0; i < features2.length; i++) {
          let feature2 = features2[i]
          let jstsGeom2 = parser.read(feature2.getGeometry())
          let buffered2 = jstsGeom2.buffer(0)
          // let unioned = jstsGeom1.union(jstsGeom2)
          let unioned = buffered1.symDifference(buffered2)
          feature2.setGeometry(parser.write(unioned))
        }
      }
      this.addVectorLayer(features2)
    }
  },
  mounted() {}
}
</script>
<style lang="less" scoped>
.dialog_footer {
  padding: 10px 20px 5px;
  text-align: right;
}
</style>
