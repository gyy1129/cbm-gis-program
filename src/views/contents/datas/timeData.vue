<template>
  <div class="containter">
    <Tabs :firstMenu="firstMenu" :secondMenu="secondMenu" />
    <div class="containter_main" v-loading="loading" element-loading-text="结果马上就好啦！请耐心等待一下~">
      <el-card class="mb15">
        <el-form :model="timeData" ref="clusterMax" label-width="120px">
          <el-row :gutter="6">
            <el-col :span="12">
              <el-form-item label="井名：" prop="wellName">
                <el-input
                  v-model="timeData.wellName"
                  placeholder="请输入井名(中间用','分割)(举例：'华加1,华加10-1,华加10-2)"
                  clearable
                ></el-input>
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
      loading: false,
      timeData: {
        wellName: '华加1,华加10-1,华加10-2'
        // wellName: '华加1,华加10-1,华加10-2,华加11-1,华加11-2,华加11-3,华加11,华加12'
      },
      picShow: false,
      name: [],
      rawResults: [],
      date: null
    }
  },
  computed: {},
  mounted() {},
  methods: {
    searchTime() {
      const names = this.timeData.wellName.split(',')
      // 数组去空值
      const namesNotNull = names.filter(name => {
        return name
      })
      if (namesNotNull.length === 0) {
        this.$message.error('注意输入格式，输入非空值')
        return
      }
      // 数组去重
      this.names = Array.from(new Set(namesNotNull))
      if (this.names.length > 12) {
        this.$message.error('查询有效井数不能超过12个')
        return
      }
      this.picShow = true
      this.getTimeData()
    },
    getTimeData() {
      this.loading = true
      const params = { names: this.names }
      wellTimeSeries(params)
        .then(res => {
          this.loading = false
          if (res.status) {
            this.rawResults = res.results
            this.date = res.date
            this.draw()
            this.$message.success(res.message)
          } else {
            this.$message.error(res.message)
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    draw() {
      if (this.rawResults.length === 0) {
        this.$message.error('没有数据')
        return
      }
      this.myTimeSeries = echarts.init(document.getElementById('timeSeries'))
      this.myTimeSeries.clear()
      const seriesList = []
      this.rawResults.map(obj => {
        let series = {
          name: obj.name,
          type: 'line',
          showSymbol: false,
          data: obj.value,
          emphasis: { focus: 'series' },
          // labelLayout: { moveOverlap: 'shiftY' },
          animation: true,
          animationDuration: 8000,
          animationEasing: 'cubicInOut',
          endLabel: {
            show: true,
            formatter: function (params) {
              return params.seriesName + ': ' + params.value
            }
          }
        }
        seriesList.push(series)
      })

      const option = {
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
          // boundaryGap: false, //坐标轴不留白
          axisLabel: {
            //x坐标展示偏移
            interval: 80,
            rotate: 60
          },
          data: this.date
        },
        yAxis: {
          type: 'value',
          name: '产气量'
        },
        grid: {
          //canvas距离边界位置
          left: '6%',
          right: '7%'
        },
        series: seriesList
      }
      option && this.myTimeSeries.setOption(option)
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
