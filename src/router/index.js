import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/index'
import cate from '@/components/cate'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'index',
    component: index
  }, {
    path: '/cate',
    name: 'cate',
    component: cate
  }]
})
