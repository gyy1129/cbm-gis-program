<!--  -->
<template>
  <div class="content">
    <Background />
    <el-form
      :model="registerForm"
      :rules="rules"
      status-icon
      ref="registerForm"
      label-width="100px"
      class="registerForm"
    >
      <h3 class="title">煤层气管理系统注册</h3>
      <el-form-item prop="username" label="用户名：">
        <el-input type="text" v-model="registerForm.username" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="密码：">
        <el-input type="password" v-model="registerForm.password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item prop="secondPassword" label="确认密码：">
        <el-input type="password" v-model="registerForm.secondPassword" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item class="btn">
        <el-button @click="register" class="register" type="primary">注册</el-button>
        <el-button @click="toLogin" class="toLogin">已有账号，去登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { register } from '@/request/api'
import Background from './background.vue'
export default {
  name: 'Register',
  components: { Background },
  data() {
    return {
      registerForm: {
        username: '',
        password: '',
        secondPassword: ''
      },
      rules: {
        username: [{ required: true, message: '请输入你的用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入你的密码', trigger: 'blur' }],
        secondPassword: [{ required: true, message: '请再次确认你的密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    register() {
      const { username, password, secondPassword } = this.registerForm
      if (password !== secondPassword) {
        this.$message.error('设置密码不一致，请再次确认输入密码')
        return
      }
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          const params = { username, password }
          register(params).then(res => {
            if (res.status) {
              this.$message.success(res.message)
              this.$confirm('是否去登录？', '提示', {
                confirmButtonText: '去登录',
                cancelButtonText: '取消'
              })
                .then(() => {
                  this.$router.push({ path: '/login' })
                })
                .catch(() => {
                  this.$message.info('已取消')
                })
            } else {
              this.$message.error(res.message)
            }
          })
        }
      })
    },
    toLogin() {
      this.$router.push({ path: '/login' })
    }
  },
  mounted() {}
}
</script>
<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  .registerForm {
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
        .register {
          width: 100%;
          margin: 5px 0;
          font-size: 16px;
        }
        .toLogin {
          width: 100%;
          margin: 5px 0;
          font-size: 16px;
          text-align: center;
        }
      }
    }
  }
}
</style>
