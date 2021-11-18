<template>
  <div class="containter">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <baidu-map class="map" :scroll-wheel-zoom="true" :center="center" :zoom="zoom" @ready="handler">
        <bm-scale anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-scale>
        <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
        <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_SATELLITE_MAP']" anchor="BMAP_ANCHOR_TOP_LEFT"></bm-map-type>
        <bm-copyright anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :copyright="copyright"> </bm-copyright>
        <bm-boundary name="山西省沁水县" :strokeWeight="3" strokeColor="blue" :fillOpacity="0.1"></bm-boundary>
        <bml-marker-clusterer :averageCenter="true">
          <bm-marker
            v-for="point of points"
            :key="point.id"
            :position="{ lng: point.baidu_lng, lat: point.baidu_lat }"
            @click="lookDetail(point)"
          >
            <bm-info-window
              :title="infoWindow.info.well_name"
              :position="{ lng: infoWindow.info.baidu_lng, lat: infoWindow.info.baidu_lat }"
              :show="point.showFlag"
              @close="infoWindowClose(point)"
              @open="infoWindowOpen(point)"
            >
              <p>
                <span class="left">经度：</span><span class="right">{{ infoWindow.info.baidu_lng }}</span>
              </p>
              <p>
                <span class="left">纬度：</span><span class="right">{{ infoWindow.info.baidu_lat }}</span>
              </p>
            </bm-info-window>
            <bm-label :content="point.well_name" :labelStyle="labelStyle" :offset="{ width: -10, height: 27 }" />
          </bm-marker>
        </bml-marker-clusterer>
        <el-form :inline="true" :model="form" class="search_form">
          <el-form-item>
            <el-input v-model.trim="form.wellName" size="small" placeholder="请输入井名" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="onSearch">查询</el-button>
          </el-form-item>
        </el-form>
      </baidu-map>
    </div>
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
import axios from 'axios'
import { BmlMarkerClusterer } from 'vue-baidu-map'
import { cloneDeep } from 'lodash'

export default {
  name: 'gisData',
  components: { Tabs, BmlMarkerClusterer },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '煤层气井地理位置',
      form: {
        wellName: null,
        lng: null,
        lat: null
      },
      ak: 'oBNh8PCBulUl1upwiNY5NIADxm39FFof',
      BMap: null,
      map: null,
      center: {
        lng: 112.4,
        lat: 35.74
      },
      zoom: 11,
      copyright: [{ id: 1, content: '©矿大煤层气537实验室' }],
      points: [],
      pointsTotal: null,
      infoWindow: { info: {} },
      labelStyle: {
        padding: '0 3px',
        height: '20px',
        lineHeight: '20px',
        color: '#fff',
        fontSize: '12px',
        background: '#676768',
        border: "1px solid '#ff8355'",
        borderRadius: '3px',
        textAlgin: 'center'
        // 'z-index': 999999
      }
    }
  },
  methods: {
    //百度地图初始化
    handler({ BMap, map }) {
      this.BMap = BMap // 百度地图
      this.map = map // 当前地图
    },

    // 点击点坐标赋值
    lookDetail(point) {
      point.showFlag = true
      this.infoWindow.info = point
      console.log(this.infoWindow)
    },
    // 关闭弹窗
    infoWindowClose(point) {
      point.showFlag = false
    },
    // 打开弹窗
    infoWindowOpen(point) {
      point.showFlag = true
    },
    // 查询
    onSearch() {
      const wells = cloneDeep(this.points)
      wells.find(item => {
        if (item.well_name === this.form.wellName) {
          this.form.lng = item.baidu_lng
          this.form.lat = item.baidu_lat
          let search_point = new this.BMap.Point(this.form.lng, this.form.lat)
          this.map.panTo(search_point)
          console.log(this.map)
        }
      })
      if (!this.form.lng) {
        this.$message.error('请输入正确的井名！')
      }
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
  }
}
</script>
<style lang="less" scoped>
.containter_main {
  position: relative;
  width: 89%;
  height: 92vh;
  .map {
    width: 100%;
    height: 100%;
    /deep/.BMap_bubble_title {
      color: #d86513;
      font-weight: 600;
    }
    /deep/.BMap_bubble_content {
      color: #475074;
      font-weight: 500;
    }
    /deep/.anchorBL {
      display: none; // 删除 百度地图自带的版权
    }
    .search_form {
      position: absolute;
      top: 5%;
      left: 2%;
      z-index: 2;
      .el-form-item {
        margin: 0 2px 0 0;
      }
    }
  }
}
</style>
