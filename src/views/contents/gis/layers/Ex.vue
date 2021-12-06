<template>
  <div id="map" ref="rootmap">
    <div class="vm">
      <!-- <h2 class="h-title">弹窗 popup</h2> -->

      <!-- 弹窗元素 -->
      <div id="popup" class="ol-popup" ref="popup">
        <a href="#" id="popup-close" class="ol-popup-closer" @click="closePopup"></a>
        <div class="popup-content">
          <table id="routeBox">
            <tbody>
              <tr></tr>
              <tr>
                <td>所在图层：</td>
                <td>{{ layerName }}</td>
              </tr>
              <tr>
                <td>handle：</td>
                <td>{{ handle }}</td>
              </tr>
              <tr>
                <td>块名称：</td>
                <td>{{ blockName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'ol/ol.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
// import Feature from "ol/Feature";
import GeoJSON from 'ol/format/GeoJSON'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
// import Select from "ol/interaction/Select"
// import {bbox} from 'ol/loadingstrategy';
import Point from 'ol/geom/Point'
import { transform } from 'ol/proj'
import Text from 'ol/style/Text'
import Overlay from 'ol/Overlay'
export default {
  data() {
    return {
      map: null,
      allFeatures: null,
      layerName: null,
      blockName: null,
      handle: null,
      overlayer: null
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      var extent = [11285.07103919199, 20056.574012374178, 61290.31172946711, 33996.47243386325]
      var wfsVectorSource = new VectorSource({
        url: '/anhui_xianjitongjishuju_WGS84.geojson',
        format: new GeoJSON()
        // features: Feature,
        // strategy: bbox
      })

      var wfsVectorLayer = new VectorLayer({
        style: new Style({
          stroke: new Stroke({
            // color: 'blue',
            color: 'rgba(30,144,255)',
            width: 3
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)'
          })
        }),
        source: wfsVectorSource,
        visible: true
      })

      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          wfsVectorLayer
        ],
        view: new View({
          center: [31955.4551374715, 28165.253430237015],
          // projection: 'EPSG:4326',
          zoom: 5
        })
      })
      // this.map.addLayer()
      this.map.getView().fit(extent, this.map.getSize())
      // this.map.getView().setZoom(14);
      var that = this

      // 2. 创建Overlay图层
      that.overlayer = new Overlay({
        element: this.$refs.popup, // 弹窗标签，在html里
        autoPan: true, // 如果弹窗在底图边缘时，底图会移动
        autoPanAnimation: {
          // 底图移动动画
          duration: 250
        }
      })

      if (timer) {
        clearInterval(timer)
      }

      var timer = setTimeout(() => {
        var fs = wfsVectorSource.getFeatures()

        that.allFeatures = fs

        console.log('allFeatures', that.allFeatures)
      }, 3000)

      //Vector第一种单击事件
      // var selectSingleClick = new Select();
      // this.map.addInteraction(selectSingleClick);

      // selectSingleClick.on('select', function(e) {
      //     // var p = e.mapBrowserEvent.coordinate
      //     // console.log('p',p)
      //     console.log(e)
      //     var features=e.target.getFeatures().getArray();
      //     if (features.length>0)
      //     {
      //         console.log('length',features.length)
      //         var feature=features[0];
      //         console.log('feature',feature)
      //     }
      // })

      //Vector第二种单击事件
      this.map.on('singleclick', mapClick)

      function mapClick(e) {
        var p = e.coordinate
        var p1 = new Point(transform(p, 'EPSG:3857', 'EPSG:4326')).getCoordinates()
        console.log(p)
        console.log('this.allFeatures.length', that.allFeatures)
        for (let j = 0; j < that.allFeatures.length - 1; j++) {
          var b1 = new Point(
            transform(that.allFeatures[j].getGeometry().getClosestPoint(p), 'EPSG:3857', 'EPSG:4326')
          ).getCoordinates()
          var b2 = new Point(
            transform(that.allFeatures[j + 1].getGeometry().getClosestPoint(p), 'EPSG:3857', 'EPSG:4326')
          ).getCoordinates()
          var x1 = that.getDistance(p1[0], p1[1], b1[0], b1[1])
          var x2 = that.getDistance(p1[0], p1[1], b2[0], b2[1])
          let fea = that.allFeatures[j + 1]
          if (x1 < x2) {
            that.allFeatures[j + 1] = that.allFeatures[j]
            that.allFeatures[j] = fea
          }
        }

        let a = that.allFeatures[that.allFeatures.length - 1]
        that.overlayer.setPosition(p)
        that.map.addOverlay(that.overlayer)
        a.setStyle(that.polygonStyle())
        that.map.getView().setCenter(p)
        console.log(a)
      }
    },
    // 关闭弹窗
    closePopup: function () {
      console.log(this)
      // 把弹窗位置设置为undefined，并清空坐标数据
      this.overlayer.setPosition(undefined)
      this.currentCoordinate = null
    },
    //计算两点之间距离
    getDistance: (lat1, lng1, lat2, lng2) => {
      lat1 = lat1 || 0

      lng1 = lng1 || 0

      lat2 = lat2 || 0

      lng2 = lng2 || 0

      var rad1 = (lat1 * Math.PI) / 180.0

      var rad2 = (lat2 * Math.PI) / 180.0

      var a = rad1 - rad2

      var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0

      var r = 6378137

      return (
        r *
        2 *
        Math.asin(
          Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2))
        )
      )
    },
    //设置高亮样式
    polygonStyle: () => {
      var style = new Style({
        fill: new Fill({
          //矢量图层填充颜色，以及透明度
          color: 'rgba(220, 20, 60, 1)'
        }),
        stroke: new Stroke({
          //边界样式
          lineDash: [6], //注意:该属性为虚线效果，在IE10以上版本才有效果
          color: '#FF0000',
          width: 2
        }),
        text: new Text({
          //文本样式
          font: '20px Verdana,sans-serif',
          // text:feature.attr.dmaName,
          fill: new Fill({
            color: '#FF0000'
          })
        })
      })
      return style
    }
  }
}
</script>

<style>
#map {
  height: 100%;
}
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
