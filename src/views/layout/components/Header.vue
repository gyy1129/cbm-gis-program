<template>
  <div class="header">
    <div class="header_left">
      <div class="left_date">{{ curDate }}</div>
    </div>
    <div class="header_right">
      <div class="right_content">
        <div class="content_name">{{ userInfo.username }}</div>
        <div class="content_signout" @click="signout">退出</div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import 'moment/locale/zh-cn'
import { getUserInfo } from '@/request/api'

export default {
  name: 'Header',
  components: {},
  data() {
    return {
      curDate: '',
      userInfo: {
        username: '',
        id: ''
      }
    }
  },
  computed: {},
  methods: {
    getCurDate() {
      this.curDate = moment(new Date()).format('YYYY-MM-DD dddd')
    },
    signout() {
      this.$confirm('您确定要退出吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          localStorage.removeItem('Flag')
          localStorage.removeItem('UserInfo')
          this.$store.dispatch('userLogin', false)
          this.$router.push('/login')
        })
        .catch(() => {
          this.$message.info('已取消退出')
        })
    },
    getUserInfo() {
      const params = { id: this.userInfo.id }
      getUserInfo(params).then(res => {
        if (res.status) {
          this.userInfo.username = res.username
        }
      })
    }
  },
  mounted() {
    this.userInfo = JSON.parse(localStorage.getItem('UserInfo')) || {}
    this.getCurDate()
    if (this.userInfo.id) {
      this.getUserInfo()
    }
  }
}
</script>
<style lang="less" scoped>
.header {
  width: 100%;
  height: 32px;
  background-color: #404765;
  color: #fff;
  display: flex;
  align-items: center;
  .header_left {
    // position: fixed;
    // left: 20px;
    margin-left: 20px;
  }
  .header_right {
    // position: fixed;
    // right: 20px;
    margin-left: auto;
    .right_content {
      display: flex;
      align-items: center;
      .content_name {
        margin: 0 15px;
        line-height: 32px;
      }
      .content_signout {
        margin: 0 15px;
        line-height: 32px;
      }
    }
  }
}
</style>
