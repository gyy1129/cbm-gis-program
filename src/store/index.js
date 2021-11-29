import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  // 设置属性
  state: {
    isLogin: false,
    token: ''
  },
  // 获取属性的状态
  getters: {
    //获取登录状态
    isLogin: state => state.isLogin
  },
  // 设置属性状态
  mutations: {
    //保存登录状态
    userStatus(state, flag) {
      state.isLogin = flag
    },
    set_token(state, ltoken) {
      //第一个参数是拿到state对象
      // localStorage.setItem('token', ltoken)
      state.token = ltoken
    },
    del_token(state) {
      // localStorage.removeItem('token')
      state.token = ''
    }
  },
  // 应用mutations
  actions: {
    userLogin({ commit }, flag) {
      commit('userStatus', flag)
    },
    set_token(context, token) {
      context.commit('set_token', token)
    },
    del_token(context) {
      context.commit('del_token')
    }
  },
  modules: {}
})

export default store
