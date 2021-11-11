<template>
  <div class="containter">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <!-- <baidu-map class="map" :scroll-wheel-zoom="true" :center="center" :zoom="zoom">
        <bm-scale anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-scale>
        <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
        <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_SATELLITE_MAP']" anchor="BMAP_ANCHOR_TOP_LEFT"></bm-map-type>
        <bm-copyright anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :copyright="copyright"> </bm-copyright>
        <bm-boundary name="山西省沁水县" :strokeWeight="3" strokeColor="blue" :fillOpacity="0.1"></bm-boundary>
      </baidu-map> -->
      <div class="map" id="map"></div>
    </div>
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
import axios from 'axios'
import { MP } from '@/map'

export default {
  name: 'cbmWater',
  components: { Tabs },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '煤层气井地理位置',
      ak: 'oBNh8PCBulUl1upwiNY5NIADxm39FFof',
      center: {
        lng: 112.65,
        lat: 35.7
      },
      zoom: 13,
      copyright: { id: 1, content: '©537实验室' },
      point: [{ lng: 112.5265536, lat: 35.64501361 }],
      points: [],
      pointsTotal: null
    }
  },
  computed: {},
  methods: {
    initMap(BMap) {
      const map = new BMap.Map('map') // 创建Map实例
      const center = new BMap.Point(this.center.lng, this.center.lat)
      map.centerAndZoom(center, this.zoom) // 初始化地图,设置中心点坐标和地图级别
      map.enableScrollWheelZoom(true) // 启用滚轮放大缩小
      // map.setCurrentCity('晋城')

      map.addControl(
        new BMap.MapTypeControl({
          mapTypes: [window.BMAP_NORMAL_MAP, window.BMAP_SATELLITE_MAP],
          anchor: window.BMAP_ANCHOR_TOP_LEFT
        })
      ) // 添加 地图类型 地图 + 卫星
      map.addControl(new BMap.NavigationControl({ anchor: window.BMAP_ANCHOR_TOP_RIGHT })) // 添加 平移缩放控件
      map.addControl(new BMap.ScaleControl({ anchor: window.BMAP_ANCHOR_TOP_RIGHT })) // 添加 比例尺控件
      const copyCtrl = new BMap.CopyrightControl({ anchor: window.BMAP_ANCHOR_BOTTOM_RIGHT })
      copyCtrl.addCopyright(this.copyright)
      map.addControl(copyCtrl) // 添加 版权

      let myIcon = new BMap.Icon('/jing_position.png', new BMap.Size(200, 200))
      myIcon.setImageSize(new BMap.Size(20, 20)) //设置图标大小
      let point = new BMap.Point(this.point[0].lng, this.point[0].lat)
      let markergg = new BMap.Marker(point, { icon: myIcon })
      map.addOverlay(markergg) //添加GPS marker

      //label样式
      let labelgg = new BMap.Label('端氏-001', { offset: new BMap.Size(-15, -23) })
      labelgg.setStyle({
        width: '120px;',
        color: '#fff',
        fontSize: '12px',
        height: '20px',
        lineHeight: '20px',
        fontFamily: '微软雅黑',
        background: '#676768',
        border: "1px solid '#ff8355'",
        borderRadius: '5px',
        textAlgin: 'left',
        'z-index': 999999
      })
      labelgg.hide()
      markergg.setLabel(labelgg) //添加GPS label

      // markergg.setAnimation(window.BMAP_ANIMATION_BOUNCE)
      // for (let i = 0; i < this.pointsTotal; i++) {
      //   let point = new BMap.Point(this.points[i].baidu_lng, this.points[i].baidu_lat)
      //   let marker = new BMap.Marker(point)
      //   map.addOverlay(marker) //添加GPS marker
      //   let label = new BMap.Label(this.points[i].well_name, { offset: new BMap.Size(20, -10) })
      //   marker.setLabel(label) //添加GPS label
      // }

      this.addMarkerOverHandler(markergg)
    },
    addMarkerOverHandler(marker) {
      marker.addEventListener('mouseover', function () {
        marker.setTop(true)
        if (marker.getLabel()) {
          marker.getLabel().show()
        }
      })
      marker.addEventListener('mouseout', function () {
        marker.setTop(false)
        if (marker.getLabel()) {
          marker.getLabel().hide()
        }
      })
    },
    getPosition() {
      axios
        .post('http://localhost:3000/data/wellposition')
        .then(res => {
          if (res.data.status) {
            this.points = res.data.results
            this.pointsTotal = res.data.resultsCount
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    }
  },
  mounted() {
    this.getPosition()
    this.$nextTick(() => {
      MP(this.ak).then(BMap => {
        this.initMap(BMap)
      })
    })
  }
}
</script>
<style lang="less" scoped>
.containter_main {
  position: absolute;
  top: 60px;
  left: 18px;
  width: 87%;
  height: 820px;
  border: 3px solid #fff;
  box-shadow: 0 0 25px #a1a1a1;
  .map {
    width: 100%;
    height: 100%;
    /deep/.anchorBL {
      display: none; // 删除 百度地图自带的版权
    }
  }
}
</style>
