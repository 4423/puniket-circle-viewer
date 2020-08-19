import Vue from 'vue'
import VueRouter from 'vue-router'
import VueAnalytics from 'vue-analytics'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
{
  path: '/',
  name: 'Home',
  component: Home
},
]

const router = new VueRouter({
  mode: 'history',
  routes: routes,
})

Vue.use(VueAnalytics, {
  id: 'UA-57215541-10',
  router,
})

export default router
