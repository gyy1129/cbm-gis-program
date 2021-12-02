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
    path: '/data',
    name: 'data',
    component: () => import('@/views/layout/Layout.vue'),
    meta: { title: '煤层气管理项目', isLogin: true },
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('@/views/components/Home.vue'),
        meta: {
          isLogin: true
        }
      },
      {
        path: '/data/cbmproperty',
        name: 'cbmproperty',
        component: () => import('@/views/contents/datas/cbmProperty.vue'),
        meta: {
          isLogin: true
        }
      },
      {
        path: '/data/cbmgas',
        name: 'cbmgas',
        component: () => import('@/views/contents/datas/cbmGas.vue'),
        meta: {
          isLogin: true
        }
      },
      {
        path: '/data/gisdata',
        name: 'gisdata',
        component: () => import('@/views/contents/datas/gisData.vue'),
        meta: {
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
        name: 'gnnCluster',
        component: () => import('@/views/contents/gnn/cluster.vue'),
        meta: {
          isLogin: true
        }
      },
      {
        path: '/gnn/draw',
        name: 'gnnDraw',
        component: () => import('@/views/contents/gnn/draw.vue'),
        meta: {
          isLogin: true
        }
      },

      {
        path: '/gnn/adjMatrix',
        name: 'gnnAdjMatrix',
        component: () => import('@/views/contents/gnn/adjacentMatrix.vue'),
        meta: {
          isLogin: true
        }
      },
      {
        path: '/gnn/forecast',
        name: 'gnnForecast',
        component: () => import('@/views/contents/gnn/forecast.vue'),
        meta: {
          isLogin: true
        }
      }
    ]
  },
  {
    path: '/gis',
    name: 'gis',
    component: () => import('@/views/layout/Layout.vue'),
    meta: { title: '煤层气管理项目', isLogin: true },
    children: [
      // 基础地图
      {
        path: '/gis/map',
        name: 'map',
        component: () => import('@/views/contents/gis/Map.vue'),
        meta: {
          isLogin: true
        }
      },
      // 地图编辑
      {
        path: '/gis/draw/standard',
        name: 'drawStandard',
        component: () => import('@/views/contents/gis/edit/Standard.vue'),
        meta: {
          isLogin: true
        }
      },
      {
        path: '/gis/draw/free',
        name: 'drawFree',
        component: () => import('@/views/contents/gis/edit/Free.vue'),
        meta: {
          isLogin: true
        }
      },

      {
        path: '/gis/edit/buffer',
        name: 'editBuffer',
        component: () => import('@/views/contents/gis/Buffer.vue'),
        meta: {
          isLogin: true
        }
      },

      {
        path: '/gis/spatial/buffer',
        name: 'spatialBuffer',
        component: () => import('@/views/contents/gis/Buffer.vue'),
        meta: {
          isLogin: true
        }
      },
      {
        path: '/gis/spatial/cluster',
        name: 'spatialCluster',
        component: () => import('@/views/contents/gis/Standard.vue'),
        meta: {
          isLogin: true
        }
      },
      {
        path: '/gis/spatial/statistics',
        name: 'spatialStatistics',
        component: () => import('@/views/contents/gis/Standard.vue'),
        meta: {
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
