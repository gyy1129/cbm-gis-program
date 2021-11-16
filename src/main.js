import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import tableHeight from './directive/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueParticles from 'vue-particles'
import BaiduMap from 'vue-baidu-map'

Vue.config.productionTip = false
// 表格自适应指令
Vue.use(tableHeight)
Vue.use(ElementUI)
Vue.use(VueParticles)
Vue.use(BaiduMap, { ak: 'oBNh8PCBulUl1upwiNY5NIADxm39FFof' })

router.beforeEach((to, from, next) => {
  //获取用户登录成功后储存的登录标志
  let getFlag = localStorage.getItem('Flag')
  //如果登录标志存在且为isLogin，即用户已登录
  if (getFlag === 'isLogin') {
    //设置vuex登录状态为已登录
    store.state.isLogin = true
    next()
    //如果已登录，还想想进入登录注册界面，则定向回首页
    // if (!to.meta.isLogin) {
    //   ElementUI.Message.error('请先退出登录')
    //   next({
    //     path: '/home'
    //   })
    // }
    //如果登录标志不存在，即未登录
  } else {
    //用户想进入需要登录的页面，则定向回登录界面
    if (to.meta.isLogin) {
      next({
        path: '/login'
      })
      //ElementUI友好提示
      ElementUI.Message.info('请先登录')
      //用户进入无需登录的界面，则跳转继续
    } else {
      next()
    }
  }
})

router.afterEach(() => {
  window.scroll(0, 0)
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
