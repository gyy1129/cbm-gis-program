<template>
  <div class="containter">
    <el-card class="operation_div">
      <div class="operation_select">
        <span>选择标准几何类型：</span>
        <el-select v-model="geoType" placeholder="请选择" @change="changeType" size="medium">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
      </div>
      <el-button type="primary" @click="editDraw" size="medium">修改已绘制图形</el-button>
      <el-button type="primary" @click="stopEdit" size="medium" plain>停止修改</el-button>
      <el-button type="danger" @click="delGeoType" size="medium" plain>清除画笔</el-button>
      <el-button type="danger" @click="deleteDraw" size="medium">清空绘制</el-button>
    </el-card>
    <div id="olmap" class="olmap"></div>
  </div>
</template>

<script>
import 'ol/ol.css'
import { Map, View } from 'ol'
import { Vector as VectorSource, XYZ } from 'ol/source'
import { Vector as VectorLayer, Tile as TileLayer } from 'ol/layer'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { Modify, Draw, Snap } from 'ol/interaction'
import { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import GeoJSON from 'ol/format/GeoJSON'
// import { transform } from 'ol/proj'
export default {
  name: 'olMap',
  components: {},
  data() {
    return {
      options: [
        {
          value: 'Point',
          label: '点'
        },
        {
          value: 'LineString',
          label: '线'
        },
        {
          value: 'Polygon',
          label: '多边形'
        },
        {
          value: 'Circle',
          label: '圆'
        },
        {
          value: 'Square',
          label: '正方形'
        },
        {
          value: 'Box',
          label: '长方形'
        },
        {
          value: 'None',
          label: '清除画笔'
        }
      ],
      geoType: 'None',
      map: null,
      source: null,
      vector: null,
      draw: null,
      snap: null,
      modify: null,
      geometryFunction: null
    }
  },
  mounted() {
    this.initMap()
    this.addVectorLayer() // 先添加 矢量图层 ；之后 在该图层上 开始绘制
    this.pointerMove()
  },
  methods: {
    // 添加 矢量图层
    addVectorLayer() {
      this.source = new VectorSource({ wrapX: false })
      this.vector = new VectorLayer({
        source: this.source,
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
      this.map.addLayer(this.vector)
    },

    // 开始绘制
    startDraw(value) {
      this.geometryFunction = null // 要清空 要不然会 影响画线
      if (value !== 'None') {
        if (value === 'Square') {
          value = 'Circle'
          this.geometryFunction = createRegularPolygon(4)
        }
        if (value === 'Box') {
          value = 'Circle'
          this.geometryFunction = createBox()
        }
        this.draw = new Draw({
          source: this.source,
          type: value,
          geometryFunction: this.geometryFunction,
          style: new Style({
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.4)'
            }),
            stroke: new Stroke({
              color: '#ffcc33',
              width: 2
            }),
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({
                color: '#ffcc33'
              })
            })
          })
        })
        this.map.addInteraction(this.draw)
        this.snap = new Snap({
          source: this.source
        })
        this.map.addInteraction(this.snap)
      }
    },

    // 下拉框 值变化时
    changeType(value) {
      // 先 清空  再绘制
      this.map.removeInteraction(this.draw)
      this.map.removeInteraction(this.snap)
      this.startDraw(value)
    },

    // 编辑已绘制图形
    editDraw() {
      if (this.vector) {
        this.modify = new Modify({
          source: this.vector.getSource()
        })
        this.map.addInteraction(this.modify)
      }
    },

    // 停止编辑
    stopEdit() {
      if (this.modify) {
        this.map.removeInteraction(this.modify)
      }
    },

    // 清除画笔
    delGeoType() {
      this.geoType = 'None'
      if (this.draw) {
        this.map.removeInteraction(this.draw)
        this.map.removeInteraction(this.snap)
      }
    },

    // 清空绘制
    deleteDraw() {
      if (this.draw) {
        this.map.removeInteraction(this.draw)
        this.map.removeInteraction(this.snap)
      }
      if (this.vector) {
        this.vector.getSource().clear()
        // this.map.removeLayer(this.vector)
      }
    },
    // 初始化 地图
    initMap() {
      let gaodesat = new TileLayer({
        title: '高德卫星影像',
        source: new XYZ({
          url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}'
        })
      })

      let gaodesatlabel = new TileLayer({
        title: '高德文字标注',
        source: new XYZ({
          url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
        })
      })
      let well = new VectorLayer({
        source: new VectorSource({
          url: '/cbmProperty.geojson', //从文件加载边界等地理信息
          format: new GeoJSON(),
          projection: 'EPSG:4326'
        }),
        style: new Style({
          stroke: new Stroke({
            color: 'rgba(30,144,255)',
            width: 3
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)'
          }),
          image: new CircleStyle({
            radius: 3,
            fill: new Fill({
              color: 'red'
            })
          })
        })
      })
      this.map = new Map({
        target: 'olmap',
        layers: [gaodesat, gaodesatlabel, well],
        view: new View({
          projection: 'EPSG:4326',
          center: [110.46912, 36.24274],
          // center: transform([101.46912, 36.24274], 'EPSG:4326', 'EPSG:3857'),
          zoom: 5
        })
      })
    },
    // 鼠标 移动时 样式改变
    pointerMove() {
      this.map.on('pointermove', e => {
        const isHover = this.map.hasFeatureAtPixel(e.pixel)
        this.map.getTargetElement().style.cursor = isHover ? 'pointer' : ''
      })
    }
  }
}
</script>

<style lang="less" scoped>
.containter {
  width: 100%;
  height: 100%;
  .operation_div {
    position: absolute;
    top: 2%;
    left: 1%;
    z-index: 2;
    .operation_select {
      margin-bottom: 15px;
    }
  }
  .olmap {
    width: 100%;
    height: 100%;
  }
}
</style>
