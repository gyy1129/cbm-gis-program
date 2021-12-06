<template>
  <el-popover v-model="visible" trigger="click" placement="bottom" @show="popShow" class="div_popover">
    <div>
      <el-button @click="columnsReset" size="small">重置</el-button>
      <el-button @click="handleConfirm" size="small" type="primary">确认</el-button>
    </div>
    <hr style="border: 1px solid #e5e5e5; margin: 8px 0" />
    <el-checkbox-group v-model="checks">
      <div v-for="(num, index) in Math.ceil(visibleColumns.length / 5)" :key="index">
        <template v-for="(item, j) in visibleColumns">
          <el-checkbox v-if="j >= index * 5 && j < 5 * (index + 1)" :key="item.name" :label="item.name">
            {{ item.name }}
          </el-checkbox>
        </template>
      </div>
    </el-checkbox-group>
    <div slot="reference">
      <el-button size="medium" type="primary" icon="el-icon-tickets">显示列</el-button>
    </div>
  </el-popover>
</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  props: {
    columns: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  computed: {
    newCell() {
      return this.columns.filter(item => item.visible === false || this.checks.includes(item.name))
    },
    visibleColumns() {
      return this.columns.filter(item => item.visible !== false)
    }
  },
  data() {
    return {
      checks: [],
      visible: false,
      saveCheckCopy: []
    }
  },
  mounted() {
    // 获取显示列配置
    this.getColumnsData()
  },
  methods: {
    getColumnsData() {
      this.checks = this.columns.map(column => column.name)
      this.$emit('model', this.newCell)
    },

    popShow() {
      if (this.saveCheckCopy.length) this.checks = cloneDeep(this.saveCheckCopy)
    },
    handleConfirm() {
      this.saveCheckCopy = cloneDeep(this.checks)
      this.$emit('model', this.newCell)
      this.visible = false
    },
    columnsReset() {
      this.checks = this.columns.map(column => column.name)
    }
  }
}
</script>
<style lang="less" scoped>
.div_popover {
  display: inline-block;
  margin-right: 10px;
}
</style>
