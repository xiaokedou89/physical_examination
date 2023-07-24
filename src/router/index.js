import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken } from '@/utils/auth.js'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/goods'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/home')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login')
    },
    {
      path: '/goods',
      name: 'goods',
      component: () => import('@/views/goods')
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: () => import('@/views/feedback')
    },
    {
      path: '/model',
      name: 'model',
      component: () => import('@/views/model')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = getToken()
  if (token && token !== 'Bearer null' && token!== 'Beare undefined') {
    // 有token判断是不是跳转到login页面
    if (to.path === '/login') {
      // 重定向到首页
      next({
        path: '/'
      })
    } else {
      // 正常放行
      next()
    }
  } else {
    // 没有token如果是login页面放心
    if (to.path === '/login') {
      next()
    }
    // 否则跳到login
    next({path: '/login'})
  }

})

export default router;