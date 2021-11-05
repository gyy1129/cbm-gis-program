<!--  -->
<template>
  <div class="content">
    <el-form :model="loginForm" :rules="rules" status-icon ref="loginForm" label-width="80px" class="loginForm">
      <h3 class="title">煤层气管理系统登录</h3>
      <el-form-item prop="username" label="用户名：">
        <el-input type="text" v-model="loginForm.username" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="密码：">
        <el-input type="password" v-model="loginForm.password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item class="btn">
        <el-button type="primary" @click="submit" class="submit">登录</el-button>
        <el-button @click="register" class="register">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: 'test',
        password: '123456'
      },
      rules: {
        username: [{ required: true, message: '请输入你的用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入你的密码', trigger: 'blur' }]
      },
      userId: null,
      username: null
    }
  },
  methods: {
    submit() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          const params = {
            username: this.loginForm.username,
            password: this.loginForm.password
          }
          axios
            .post('http://localhost:3000/login', params)
            .then(res => {
              if (res.data.status) {
                //设置Vuex登录标志为true，默认userLogin为false
                this.$store.dispatch('userLogin', true)
                //Vuex在用户刷新的时候userLogin会回到默认值false，所以我们需要用到HTML5储存
                //我们设置一个名为Flag，值为isLogin的字段，作用是如果Flag有值且为isLogin的时候，证明用户已经登录了。
                localStorage.setItem('Flag', 'isLogin')
                this.$message.success(res.data.message)
                this.userId = res.data.results.id
                this.username = res.data.results.username
                this.$router.push({ path: '/home' })
              } else {
                this.$message.error(res.data.message)
              }
            })
            .catch(err => {
              this.$message.error(err.message)
            })
        } else {
          return false
        }
      })
    },
    register() {
      this.$router.push({ path: '/register' })
    }
  },
  computed: {},
  mounted() {}
}
</script>
<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  .loginForm {
    -webkit-border-radius: 5px;
    border-radius: 8px;
    margin: 180px auto;
    width: 400px;
    padding: 35px 35px 15px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    z-index: 999;
    .title {
      text-align: center;
      padding: 15px 0;
      color: #409eff;
    }
    label.el-checkbox.rememberme {
      margin: 0px 0px 15px 15px;
      text-align: left;
    }
    .btn {
      /deep/.el-form-item__content {
        margin: 5px auto !important;
        .submit {
          width: 100%;
          margin: 5px 0;
          font-size: 16px;
        }
        .register {
          width: 100%;
          margin: 5px 0;
          font-size: 16px;
        }
      }
    }
  }
}
</style>
