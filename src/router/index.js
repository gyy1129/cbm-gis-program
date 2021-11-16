import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/components/Login.vue'),
    meta: { title: '登录', isLogin: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/components/Register.vue'),
    meta: { title: '注册', isLogin: false }
  },

  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/layout/Layout.vue'),
    meta: { title: '首页', isLogin: true },
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('@/views/components/Home.vue'),
        meta: {
          isLogin: true
        }
      }
    ]
  },
  {
    path: '/data',
    name: 'data',
    component: () => import('@/views/layout/Layout.vue'),
    meta: { title: '煤层气管理项目', isLogin: true },
    children: [
      {
        path: '/data/cbmproperty',
        name: 'cbmproperty',
        component: () => import('@/views/contents/datas/cbmProperty.vue'),
        meta: {
          title: '煤层气属性数据', // 标题
          isLogin: true
        }
      },
      {
        path: '/data/cbmgas',
        name: 'cbmgas',
        component: () => import('@/views/contents/datas/cbmGas.vue'),
        meta: {
          label: '煤层气产气时间序列', // 标题
          isLogin: true
        }
      },
      {
        path: '/data/cbmwater',
        name: 'cbmwater',
        component: () => import('@/views/contents/datas/cbmWater.vue'),
        meta: {
          label: '煤层气产水时间序列', // 标题
          isLogin: true
        }
      },
      {
        path: '/data/gisdata',
        name: 'gisdata',
        component: () => import('@/views/contents/datas/gisData.vue'),
        meta: {
          label: '煤层气井地理位置',
          isLogin: true
        }
      }
    ]
  },
  {
    path: '/gnn',
    name: 'gnn',
    component: () => import('@/views/layout/Layout.vue'),
    meta: { title: '煤层气管理项目', isLogin: true },
    children: [
      {
        path: '/gnn/cluster',
        name: 'cluster',
        component: () => import('@/views/contents/functions/cluster.vue'),
        meta: {
          label: '聚类',
          isLogin: true
        }
      },
      {
        path: '/gnn/draw',
        name: 'draw',
        component: () => import('@/views/contents/functions/draw.vue'),
        meta: {
          label: '构图',
          isLogin: true
        }
      },
      {
        path: '/gnn/forecast',
        name: 'forecast',
        component: () => import('@/views/contents/functions/forecast.vue'),
        meta: {
          label: '预测',
          isLogin: true
        }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.matched[0].meta.title
  next()
})

//路由守卫
// router.beforeEach((to, from ,next) =>  {
//   const islogin = localStorage.eletoken ? true : false
//   if (to.path == "/login" || to.path == "/register"){
//     next()
//   } else {
//     islogin ? next() : next("/login")
//   }
// })
export default router
