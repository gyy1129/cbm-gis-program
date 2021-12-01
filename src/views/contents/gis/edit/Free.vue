<template>
  <div class="containter">
    <div id="olmap" class="olmap"></div>
  </div>
</template>

<script>
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import { OSM, XYZ } from 'ol/source'
import { transform } from 'ol/proj'

export default {
  name: 'olMap',
  components: {},
  data() {
    return {
      map: null,
      proj: 'EPSG:4326', //定义wgs84地图坐标系
      proj_m: 'EPSG:3857', //定义墨卡托地图坐标系
      esriMapLayer: null,
      osmLayer: null,
      tdtSatelliteLayer: null,
      gaodeMapLayer: null
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      //初始化map对象
      this.map = new Map({
        target: 'olmap',
        projection: this.proj,
        view: new View({
          center: transform([112.46912, 36.24274], this.proj, this.proj_m),
          zoom: 5
        })
      })
      // this.map.getView().fit([120.33944, 36.049352, 120.442925, 36.126585], this.map.getSize())
      //ArcGIS地图
      this.esriMapLayer = new TileLayer({
        source: new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        }),
        title: 'ESRI影像'
      })
      //OSM地图
      this.osmLayer = new TileLayer({
        source: new OSM(),
        title: 'OSM影像'
      })
      //天地图
      this.tdtSatelliteLayer = new TileLayer({
        source: new XYZ({
          url: 'http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=008a8816d2eee25a677670273eaee891',
          crossOrigin: 'anonymous'
        }),
        title: '天地图影像'
      })
      //高德地图
      this.gaodeMapLayer = new TileLayer({
        source: new XYZ({
          url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
        }),
        title: '高德地图'
      })
      //百度地图
      this.baiduMapLayer = new TileLayer({
        source: new XYZ({
          url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
        }),
        title: '百度地图'
      })

      //将图层加载到地图对象
      // this.map.addLayer(this.esriMapLayer)
      // this.map.addLayer(this.osmLayer)
      // this.map.addLayer(this.tdtSatelliteLayer)
      this.map.addLayer(this.gaodeMapLayer)
    }
  }
}
</script>

<style lang="less" scoped>
.containter {
  width: 100%;
  height: 100%;
  .olmap {
    width: 100%;
    height: 100%;
  }
}
</style>
