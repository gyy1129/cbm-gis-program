<template>
  <div class="containter">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main">
      <el-card class="mb15">
        <el-form :model="timeData" ref="clusterMax" label-width="120px">
          <el-row :gutter="6">
            <el-col :span="12">
              <el-form-item label="井名：" prop="wellName">
                <el-input v-model="timeData.wellName" placeholder="请输入井名(中间用','分割)" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="primary" @click="searchTime">查询时间序列</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card class="mb15">
        <div id="timeSeries" v-show="picShow"></div>
        <el-empty description="暂无结果" class="empty" v-show="!picShow"></el-empty>
      </el-card>
    </div>
  </div>
</template>

<script>
import Tabs from '../components/Tabs.vue'
import * as echarts from 'echarts'
import { wellTimeSeries } from '@/request/api'
export default {
  name: 'timeData',
  components: { Tabs },
  data() {
    return {
      firstMenu: '数据报表',
      secondMenu: '时间序列可视化',
      timeData: {
        wellName: '华加1,华加10-1'
        // wellName: '华加1'
      },
      picShow: false,
      name: [],
      rawResults: [],
      value: null,
      date: null
    }
  },
  computed: {},
  mounted() {},
  methods: {
    searchTime() {
      console.log('查询')
      this.picShow = true
      this.names = this.timeData.wellName.split(',')
      this.getTimeData()
    },
    getTimeData() {
      const params = { names: this.names }
      wellTimeSeries(params)
        .then(res => {
          if (res.status) {
            // this.value = res.results[0].value
            // this.date = res.results[0].date
            this.rawResults = res.results
            this.draw()
            this.$message.success(res.message)
          } else {
            this.$message.error(res.message)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    draw() {
      this.myTimeSeries = echarts.init(document.getElementById('timeSeries'))
      const seriesList = []
      this.rawResults.map(obj => {
        let series = {
          name: obj.name,
          type: 'line',
          showSymbol: false,
          data: obj.value,
          emphasis: { focus: 'series' },
          // labelLayout: { moveOverlap: 'shiftY' },
          endLabel: {
            show: true,
            formatter: function (params) {
              console.log(params)
              return params.seriesName + ': ' + params.value
            }
          }
        }
        seriesList.push(series)
      })

      const option = {
        // animation: true,
        // animationDuration: 20000,
        // animationEasing: 'cubicInOut',
        title: {
          text: '煤层气井时间序列'
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        legend: {
          left: 'center'
        },
        xAxis: {
          name: '时间',
          type: 'category',
          data: this.date
        },
        yAxis: {
          type: 'value',
          name: '产气量'
        },
        grid: {
          right: 140
        },

        series: seriesList
        // series: [
        //   {
        //     name: names[0],
        //     type: 'line',
        //     showSymbol: false,
        //     data: this.value,
        //     endLabel: {
        //       show: true,
        //       formatter: function (params) {
        //         console.log(params)
        //         return params.seriesName + ': ' + params.value
        //       }
        //     }
        //   }
        // ]
      }
      this.myTimeSeries.setOption(option)
    }
  }
}
</script>
<style lang="less" scoped>
.containter_main {
  position: absolute;
  top: 60px;
  left: 18px;
  width: 87%;
  /deep/.el-form-item {
    margin-bottom: 0;
  }
  .mb15 {
    margin-bottom: 15px;
  }
  #timeSeries {
    height: 600px;
    margin: 0 auto;
  }
  .empty {
    height: 600px;
    margin: 0 auto;
  }
}
</style>
