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
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/components/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/common/Home.vue'),
    meta: { title: '煤层气管理项目' },
    children: [
      {
        path: '/data/cbmproperty',
        name: 'cbmproperty',
        component: () => import('@/views/contents/datas/cbmProperty.vue'),
        meta: {
          label: '煤层气属性数据', // 标题
          cache: true, // 是否缓存
          role: '/cbmproperty'
        }
      },
      {
        path: '/data/cbmgas',
        name: 'cbmgas',
        component: () => import('@/views/contents/datas/cbmGas.vue'),
        meta: {
          label: '煤层气产气时间序列', // 标题
          cache: true, // 是否缓存
          role: '/cbmgas'
        }
      },
      {
        path: '/data/cbmwater',
        name: 'cbmwater',
        component: () => import('@/views/contents/datas/cbmWater.vue'),
        meta: {
          label: '煤层气产水时间序列', // 标题
          cache: true, // 是否缓存
          role: '/cbmwater'
        }
      },
      {
        path: '/data/gisdata',
        name: 'gisdata',
        component: () => import('@/views/contents/datas/gisData.vue'),
        meta: {
          label: '煤层气gis数据',
          cache: true,
          role: '/gisdata'
        }
      },
      {
        path: '/function/gnn/cluster',
        name: 'cluster',
        component: () => import('@/views/contents/functions/cluster.vue'),
        meta: {
          label: '聚类',
          cache: true,
          role: '/cluster'
        }
      },
      {
        path: '/function/gnn/draw',
        name: 'draw',
        component: () => import('@/views/contents/functions/draw.vue'),
        meta: {
          label: '构图',
          cache: true,
          role: '/draw'
        }
      },
      {
        path: '/function/gnn/forecast',
        name: 'forecast',
        component: () => import('@/views/contents/functions/forecast.vue'),
        meta: {
          label: '预测',
          cache: true,
          role: '/forecast'
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

export default router
