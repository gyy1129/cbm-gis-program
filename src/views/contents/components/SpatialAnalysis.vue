<template>
  <div class="">
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

import * as jsts from '@/utils/jsts.js' // 单独引入 jsts
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
    map: {
      type: Object,
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
      }
    }
  },
  computed: {},
  methods: {
    cancel() {
      this.$emit('closeMethodDisplay')
    },
    overlayFormSure() {
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
      this.$emit('onAnalysis')
    },
    overlayAnalyse() {
      console.log(this.methodName)
      if (this.methodName === 'union') {
        console.log(1111)
      }
    },
    bufferFormSure() {
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
      this.$emit('onAnalysis', { vectorLayer: this.vectorLayer, radius })
    },
    bufferAnalyse(radius) {
      console.log('缓冲区分析')
      let format = new GeoJSON()
      let features = format.readFeatures(this.originGeoJSON1, {
        featureProjection: 'EPSG:3857'
      })
      let parser = new jsts.io.OL3Parser()
      parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon)

      for (let i = 0; i < features.length; i++) {
        let feature = features[i]
        let jstsGeom = parser.read(feature.getGeometry())
        let buffered = jstsGeom.buffer(radius)
        feature.setGeometry(parser.write(buffered))
      }
      this.source = new VectorSource()
      this.source.addFeatures(features)
      this.vectorLayer = new VectorLayer({
        source: this.source
      })
      this.map.addLayer(this.vectorLayer)
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
