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
    <!-- 基础分析 -->
    <div v-show="analysisForm.baseForm">
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
        <el-button type="primary" @click="baseFormSure">确 定</el-button>
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
    <!-- 投影转换 -->
    <div v-show="analysisForm.projectionForm">
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
        <el-button type="primary" @click="projectionFormSure">确 定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom'
import LinearRing from 'ol/geom/LinearRing'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { transform } from 'ol/proj'

import * as jsts from '@/utils/jsts.js' // 单独引入 jsts
import * as turf from '@turf/turf'

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
    },
    mapLayer: {
      type: Object
    }
  },
  data() {
    return {
      originGeoJSON1: null,
      originGeoJSON2: null,
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

    // 基础分析 确定btn
    baseFormSure() {
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
      switch (this.methodName) {
        case 'convexHull':
          if (this.convexHullAnalyse() === false) return
          this.convexHullAnalyse()
          this.fileName = 'convexHull_' + analysisLayer1 + '_' + time
          break
        case 'centroid':
          if (this.centroidAnalyse() === false) return
          this.centroidAnalyse()
          this.fileName = 'centroid_' + analysisLayer1 + '_' + time
          break
        case 'multiFeatureCombine':
          if (this.mulFeatureAnalyse() === false) return
          this.mulFeatureAnalyse()
          this.fileName = 'multiFeatureCombine_' + analysisLayer1 + '_' + time
          break
        case 'dissolve':
          if (this.dissolveAnalyse() === false) return
          this.dissolveAnalyse()
          this.fileName = 'dissolve_' + analysisLayer1 + '_' + time
          break
        case 'tesselate':
          if (this.tesselateAnalyse() === false) return
          this.tesselateAnalyse()
          this.fileName = 'tesselate_' + analysisLayer1 + '_' + time
          break
        case 'lineToPolygon':
          if (this.lineToPolygonAnalyse() === false) return
          this.lineToPolygonAnalyse()
          this.fileName = 'lineToPolygon_' + analysisLayer1 + '_' + time
          break
        case 'polygonToLine':
          if (this.polygonToLineAnalyse() === false) return
          this.polygonToLineAnalyse()
          this.fileName = 'polygonToLine_' + analysisLayer1 + '_' + time
          break
      }

      this.$emit('onAnalysis', { vectorLayer: this.vectorLayer, fileName: this.fileName })
    },

    // 几何凸面
    convexHullAnalyse() {
      console.log('几何凸面')
      // Polygon类型判断
      let judgeType = this.originGeoJSON1.features.map(item => {
        if (item.geometry.type !== 'Polygon') return false
      })
      if (judgeType.length !== 0 && judgeType[0] == false) {
        this.$message.error('请选择Polygon的图层')
        return false
      }

      let format = new GeoJSON()
      let features = format.readFeatures(this.originGeoJSON1, { featureProjection: 'EPSG:3857' })

      let parser = new jsts.io.OL3Parser()
      parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon)

      for (let i = 0; i < features.length; i++) {
        let jstsGeom = parser.read(features[i].getGeometry())
        let convexHulled = jstsGeom.convexHull()
        features[i].setGeometry(parser.write(convexHulled))
      }

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
    // 多要素并集
    mulFeatureAnalyse() {
      console.log('多要素并集')
      let combined = turf.combine(this.originGeoJSON1)
      let format = new GeoJSON()
      let multiCombineFeatures = []
      multiCombineFeatures = format.readFeatures(combined, { featureProjection: 'EPSG:3857' })

      this.source = new VectorSource()
      this.source.addFeatures(multiCombineFeatures)
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
    // 多要素溶解
    dissolveAnalyse() {
      console.log('多要素溶解')
      if (this.originGeoJSON1.type !== 'FeatureCollection') {
        this.$message.error('请选择FeatureCollection类型图层')
        return false
      }
      // Polygon类型判断
      let judgeType = this.originGeoJSON1.features.map(item => {
        if (item.geometry.type !== 'Polygon') return false
      })
      if (judgeType.length !== 0 && judgeType[0] == false) {
        this.$message.error('请选择Polygon的图层')
        return false
      }

      let dissolveFeatures = []
      let dissolved = turf.dissolve(this.originGeoJSON1)
      let format = new GeoJSON()
      dissolveFeatures = format.readFeatures(dissolved, { featureProjection: 'EPSG:3857' })

      this.source = new VectorSource()
      this.source.addFeatures(dissolveFeatures)
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
    // 划分三角形
    tesselateAnalyse() {
      console.log('划分三角形')
      let format = new GeoJSON()
      let features = this.originGeoJSON1.features
      let tesselateFeatures = []

      // Polygon类型判断
      let judgeType = this.originGeoJSON1.features.map(item => {
        if (item.geometry.type !== 'Polygon') return false
      })
      if (judgeType.length !== 0 && judgeType[0] == false) {
        this.$message.error('请选择Polygon的图层')
        return false
      }

      for (let i = 0; i < features.length; i++) {
        let tesselateed = turf.tesselate(features[i])
        let tesselateededFeature = format.readFeatures(tesselateed, { featureProjection: 'EPSG:3857' })
        tesselateFeatures.push(tesselateededFeature)
      }

      this.source = new VectorSource()
      tesselateFeatures.map(item => {
        this.source.addFeatures(item)
      })
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
    // 几何质心
    centroidAnalyse() {
      console.log('几何质心')
      let format = new GeoJSON()
      let features = this.originGeoJSON1.features
      let centerFeatures = []

      // Polygon类型判断
      let judgeType = this.originGeoJSON1.features.map(item => {
        if (item.geometry.type !== 'Polygon') return false
      })
      if (judgeType.length !== 0 && judgeType[0] == false) {
        this.$message.error('请选择Polygon的图层')
        return false
      }

      for (let i = 0; i < features.length; i++) {
        let centerpoint = turf.centroid(features[i])
        let centerFeature = format.readFeature(centerpoint, { featureProjection: 'EPSG:3857' })
        centerFeatures.push(centerFeature)
      }
      this.source = new VectorSource()
      this.source.addFeatures(centerFeatures)
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
    // 线转面
    lineToPolygonAnalyse() {
      console.log('线转面')
      let features = this.originGeoJSON1.features
      let lineToPolygonFeatures = []

      // LineString类型判断
      let judgeType = this.originGeoJSON1.features.map(item => {
        let type = item.geometry.type
        if (type !== 'LineString' && type !== 'MultiLineString') return false
      })
      if (judgeType.length !== 0 && judgeType[0] == false) {
        this.$message.error('请选择lineString的图层')
        return false
      }

      let turfCoordinates = []
      for (let i = 0; i < features.length; i++) {
        let coordinates = features[i].geometry.coordinates
        for (let i = 0; i < coordinates.length; i++) {
          turfCoordinates.push(coordinates[i])
        }
      }

      let turfValue = turf.lineString(turfCoordinates)
      let lineToPolygoned = turf.lineToPolygon(turfValue)
      let format = new GeoJSON()
      let lineToPolygonFeature = format.readFeature(lineToPolygoned, { featureProjection: 'EPSG:3857' })
      lineToPolygonFeatures.push(lineToPolygonFeature)

      this.source = new VectorSource()
      this.source.addFeatures(lineToPolygonFeatures)

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
    // 面转线
    polygonToLineAnalyse() {
      console.log('面转线')
      let features = this.originGeoJSON1.features
      let polygonToLineFeatures = []

      // Polygon类型判断
      let judgeType = this.originGeoJSON1.features.map(item => {
        let type = item.geometry.type
        if (type !== 'Polygon' && type !== 'MultiPolygon') return false
      })
      if (judgeType.length !== 0 && judgeType[0] == false) {
        this.$message.error('请选择Polygon的图层')
        return false
      }

      for (let i = 0; i < features.length; i++) {
        let polygonToLineed = turf.polygonToLine(features[i])
        let format = new GeoJSON()
        let polygonToLineFeature = format.readFeature(polygonToLineed, { featureProjection: 'EPSG:3857' })
        polygonToLineFeatures.push(polygonToLineFeature)
      }

      this.source = new VectorSource()
      this.source.addFeatures(polygonToLineFeatures)

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
    // 缓冲区 确定btn
    bufferFormSure() {
      const time = moment(new Date().getTime()).format('YYYY_MM_DD_HH_mm_ss')
      const { analysisLayer1, radius } = this.spatialAnalysis
      if (!analysisLayer1) {
        this.$message.error('请选择图层')
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
    // 缓冲区分析
    bufferAnalyse(radius) {
      console.log('缓冲区分析')
      let features = this.originGeoJSON1.features
      let bufferedFeatures = []

      for (let i = 0; i < features.length; i++) {
        let buffered = turf.buffer(features[i], radius, { units: 'meters' })
        let format = new GeoJSON()
        let bufferedFeature = format.readFeature(buffered, { featureProjection: 'EPSG:3857' })
        bufferedFeatures.push(bufferedFeature)
      }
      this.source = new VectorSource()
      this.source.addFeatures(bufferedFeatures)
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

    // 叠置分析 确定btn
    overlayFormSure() {
      const time = moment(new Date().getTime()).format('YYYY_MM_DD_HH_mm_ss')
      const { analysisLayer1, analysisLayer2 } = this.spatialAnalysis
      if (!analysisLayer1) {
        this.$message.error('请选择图层1')
        return false
      }
      if (!analysisLayer2) {
        this.$message.error('请选择图层2')
        return false
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
      let format1 = new GeoJSON()
      let features1 = format1.readFeatures(this.originGeoJSON1, { featureProjection: 'EPSG:3857' })
      let format2 = new GeoJSON()
      let features2 = format2.readFeatures(this.originGeoJSON2, { featureProjection: 'EPSG:3857' })

      // let features1 = this.originGeoJSON1.features
      // let features2 = this.originGeoJSON2.features

      // Polygon类型判断
      let judgeType1 = this.originGeoJSON1.features.map(item => {
        let type = item.geometry.type
        if (type !== 'Polygon' && type !== 'MultiPolygon') return false
      })
      if (judgeType1.length !== 0 && judgeType1[0] == false) {
        this.$message.error('请选择Polygon的图层')
        return false
      }

      let judgeType2 = this.originGeoJSON2.features.map(item => {
        let type = item.geometry.type
        if (type !== 'Polygon' && type !== 'MultiPolygon') return false
      })
      if (judgeType2.length !== 0 && judgeType2[0] == false) {
        this.$message.error('请选择Polygon的图层')
        return false
      }

      switch (this.methodName) {
        case 'union':
          this.union(features1, features2)
          break
        case 'intersection':
          this.intersection(features1, features2)
          break
      }
    },
    // 联合
    union(features1, features2) {
      let unionFeatures = []
      let unioned = null
      let turfValue1 = null
      let turfValue2 = null
      for (let a = 0; a < features1.length; a++) {
        let coordinates1 = features1[a].getGeometry().getCoordinates()
        let turfCoordinates1 = []
        for (let i = 0; i < coordinates1.length; i++) {
          for (let j = 0; j < coordinates1[0].length; j++) {
            let feaTransform1 = transform(coordinates1[i][j], 'EPSG:3857', 'EPSG:4326')
            turfCoordinates1.push(feaTransform1)
          }
        }
        turfValue1 = turf.polygon([turfCoordinates1])

        for (let b = 0; b < features2.length; b++) {
          let coordinates2 = features2[b].getGeometry().getCoordinates()
          let turfCoordinates2 = []
          for (let i = 0; i < coordinates2.length; i++) {
            for (let j = 0; j < coordinates2[0].length; j++) {
              let feaTransform2 = transform(coordinates2[i][j], 'EPSG:3857', 'EPSG:4326')
              turfCoordinates2.push(feaTransform2)
            }
          }
          turfValue2 = turf.polygon([turfCoordinates2])
          if (a === 0 && b === 0) {
            unioned = turf.union(turfValue1, turfValue2)
          } else {
            unioned = turf.union(unioned, turfValue2)
          }
        }

        if (a !== 0) unioned = turf.union(unioned, turfValue1)
      }
      let format = new GeoJSON()
      let unionFeature = format.readFeature(unioned, { featureProjection: 'EPSG:3857' })
      unionFeatures.push(unionFeature)

      this.source = new VectorSource()
      this.source.addFeatures(unionFeatures)
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
    // 相交
    intersection(features1, features2) {
      let intersectFeatures = []
      let intersection = null

      for (let a = 0; a < features1.length; a++) {
        let coordinates1 = features1[a].getGeometry().getCoordinates()
        let properties1 = features1[a].getProperties()
        this.turfCoordinates1 = []
        this.feaTransform1 = []
        for (let i = 0; i < coordinates1.length; i++) {
          for (let j = 0; j < coordinates1[0].length; j++) {
            this.feaTransform1 = transform(coordinates1[i][j], 'EPSG:3857', 'EPSG:4326')
            this.turfCoordinates1.push(this.feaTransform1)
          }
        }
        let turfValue1 = turf.polygon([this.turfCoordinates1], properties1)
        for (let b = 0; b < features2.length; b++) {
          let coordinates2 = features2[b].getGeometry().getCoordinates()
          let properties2 = features2[b].getProperties()
          this.turfCoordinates2 = []
          this.feaTransform2 = []
          for (let i = 0; i < coordinates2.length; i++) {
            for (let j = 0; j < coordinates2[0].length; j++) {
              this.feaTransform2 = transform(coordinates2[i][j], 'EPSG:3857', 'EPSG:4326')
              this.turfCoordinates2.push(this.feaTransform2)
            }
          }
          let turfValue2 = turf.polygon([this.turfCoordinates2], properties2)

          intersection = turf.intersect(turfValue1, turfValue2)
          if (intersection !== null) {
            let format = new GeoJSON()
            let intersectFeature = format.readFeature(intersection, { featureProjection: 'EPSG:3857' })
            // 需要 先将属性中的geometry删掉 因为 会有 原来的坐标值 再设置属性
            delete properties1.geometry && intersectFeature.setProperties(properties1)
            intersectFeatures.push(intersectFeature)
          }
        }
      }
      console.log(intersectFeatures)
      this.source = new VectorSource()
      this.source.addFeatures(intersectFeatures)
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

    // 投影转换 确定btn
    projectionFormSure() {
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
      switch (this.methodName) {
        case 'toMercator':
          if (this.toMercatorTransform() === false) return
          this.toMercatorTransform()
          this.fileName = 'toMercator_' + analysisLayer1 + '_' + time
          break
        case 'toWgs84':
          if (this.toWgs84Transform() === false) return
          this.toWgs84Transform()
          this.fileName = 'toWgs84' + analysisLayer1 + '_' + time
          break
      }
      this.$emit('projectionAnalysis', { vectorLayer: this.vectorLayer, fileName: this.fileName })
    },
    // to墨卡托
    toMercatorTransform() {
      console.log('to墨卡托')
      let features = this.originGeoJSON1.features
      let toMercatorFeatures = []

      for (let i = 0; i < features.length; i++) {
        let toMercatored = turf.toMercator(features[i])
        let format = new GeoJSON()
        let toMercatoredFeature = format.readFeature(toMercatored)
        toMercatorFeatures.push(toMercatoredFeature)
      }

      this.source = new VectorSource()
      this.source.addFeatures(toMercatorFeatures)
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
    // towgs84
    toWgs84Transform() {
      console.log('towgs84')
      let features = this.originGeoJSON1.features
      let toMercatorFeatures = []

      for (let i = 0; i < features.length; i++) {
        let toMercatored = turf.toWgs84(features[i])
        let format = new GeoJSON()
        let toMercatoredFeature = format.readFeature(toMercatored)
        toMercatorFeatures.push(toMercatoredFeature)
      }

      this.source = new VectorSource()
      this.source.addFeatures(toMercatorFeatures)
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
