<template>
  <div>
    <div class="container">
      <div class="container_main">
        <p class="title">系 统 说 明 书</p>
        <div class="content">
          <p class="sub_title">一、系统简介</p>
          <p class="paragraph">
            基于煤层气时空特征产出序列研究系统是集煤层气数据管理与可视化展示、GIS空间分析与构图分析、煤层气产出预测于一体，可对较为复杂的煤层气数据和地质参数进行特征分析研究并基于时间序列进行产量预测。
          </p>
          <p>
            通常情况下，煤层气数据较为复杂且数据较为散乱，想要进行各种分析时，每个人都需要进行数据收集整理，再数据清洗，时间花费成本较高。与此同时，一般表格的数据展示，数据特征难以直观显示，将煤层气数据与地图和图表结合，可以很好的展现数据部分特性。利用图神经网络分析，需要用到GIS部分空间分析功能，通常可以利用GIS的一些桌面应用程序进行空间分析，如ARCMAP软件。但这些软件安装较为繁琐，使用效率不高。集成数据和GIS空间分析功能，利用分析结果进行模型预测，能最大化实现已有资源共享，功能统一规划运用，解决煤层气时空特征产量预测存在问题。
          </p>
          <p>
            该系统实现了用户管理、数据管理、数据与地图可视化展示、数据上传、地图编辑、空间分析、聚类分析、构图分析、构建邻接矩阵、模型预测等功能，为煤层气数据和GIS数据实现在线分析提供了一条切实可行的途径。
          </p>
        </div>
        <div class="content">
          <p class="sub_title">二、功能与结果</p>
          <p class="paragraph">神奇的系统</p>
        </div>
        <div class="content">
          <p class="sub_title">三、操作方法与注意事项</p>
          <p class="paragraph">神奇的系统</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Specification',
  components: {},
  data() {
    return {}
  },
  computed: {},
  methods: {},
  mounted() {}
}
</script>
<style lang="less" scoped>
.container {
  position: absolute;
  top: 2%;
  left: 1%;
  width: 87%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 14px #cac6c6;
  .container_main {
    margin: 15px 20px;
    .title {
      text-align: center;
      font-size: 28px;
      color: #565b78;
    }
    p {
      color: #6a74a5;
      font-size: 18px;
      font-family: 'Microsoft Yahei';
      text-indent: 2em;
      line-height: 28px;
      margin-bottom: 5px;
      letter-spacing: 2px;
    }
    .content {
      margin-bottom: 10px;
      .sub_title {
        margin-bottom: 5px;
      }
      .paragraph {
      }
    }
  }
}
</style>
