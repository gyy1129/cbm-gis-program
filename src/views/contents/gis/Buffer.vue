<template>
  <div class="containter">
    <div id="map" class="map"></div>
  </div>
</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import View from 'ol/View'
export default {
  name: 'Buffer',
  components: {},
  data() {
    return {}
  },

  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      new Map({
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        target: 'map',
        view: new View({
          projection: 'EPSG:4326',
          center: [114.064839, 22.548857],
          zoom: 2
        })
      })
    }
  }
}
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
