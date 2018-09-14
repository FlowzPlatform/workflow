// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// https://github.com/misterGF/CoPilot/blob/master/src/main.js
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'

import { sync } from 'vuex-router-sync'
import routes from './router'
import store from './store'
import config from '@/config'

// import BootstrapVue from 'bootstrap-vue'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'
// Vue.use(BootstrapVue)

// import CellRender from '@/components/cellRender'
// Vue.use(CellRender)

// Include and set up feathers client
const Feathers = require('feathers/client')
const hooks = require('feathers-hooks')
  // const authentication = require('feathers-authentication/client')
const socketio = require('feathers-socketio/client')
const io = require('socket.io-client')
let socket = io(config.socketURI)
socket.on('connect', function () {
})
socket.on('disconnect', function () {
})
  // if (process.env.NODE_ENV !== 'development') {
  //   socket = io(config.serverURI, {path: '/eng/socket.io'})
  // } else {
  //   socket = io(config.serverURI)
  // }
const feathers = Feathers()
  .configure(socketio(socket))
  .configure(hooks())
  // .configure(authentication({storage: window.localStorage}))
  // Include it as a CommonJS module
const vueFeathers = require('vue-feathers')
  // And plug it in]
Vue.use(vueFeathers, feathers)

/* vueTinymce */
import vueTinymce from '@deveodk/vue-tinymce'
// You need a specific loader for CSS files like https://github.com/webpack/css-loader
// import '@deveodk/vue-tinymce/dist/@deveodk/vue-tinymce.css'
Vue.use(vueTinymce)
  /* vueTinymce */

/* IView */
import iView from 'iview'
import locale from 'iview/dist/locale/en-US'
import 'iview/dist/styles/iview.css' // CSS

Vue.use(iView, { locale })

import VueParticles from 'vue-particles'
Vue.use(VueParticles)

/* Animated css */

import 'animate.css/animate.css'

// import AsyncComputed from 'vue-async-computed'
// Vue.use(AsyncComputed)

/* vue-split-panel */
import VueSplit from 'vue-split-panel'
Vue.use(VueSplit)

Vue.config.productionTip = false

/* eslint-disable no-new */
// cookies
var VueCookie = require('vue-cookie')
Vue.use(VueCookie)

// Routing logic
Vue.use(VueRouter)

var router = new VueRouter({
  routes: routes,
  mode: 'history',
  scrollBehavior: function (to, from, savedPosition) {
    return savedPosition || { x: 0, y: 0 }
  }
})

iView.LoadingBar.config({
  color: '#5cb85c',
  failedColor: '#f0ad4e',
  height: 5
})

import axios from 'axios'
import psl from 'psl'
// Some middleware to help us ensure the user is authenticated.
router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  iView.LoadingBar.config({ color: '#0e406d' })
  // window.console.log('Transition', transition)
  // router.app.$store.state.token
  let location = psl.parse(window.location.hostname) // get parent domain
  location = location.domain === null ? location.input : location.domain

  if (to.query.token) {
    router.app.$cookie.set('auth_token', to.query.token, { expires: 1, domain: location })
  }
  const token = router.app.$cookie.get('auth_token')
  store.state.token = token
  // set token in axios
  if (token) {
    axios.defaults.headers.common['authorization'] = token
  } else {
    delete axios.defaults.headers.common['authorization']
  }

  if (to.matched.some(record => record.meta.requiresAuth) && (!token || token === 'null' || store.state.token === undefined)) {
    next({
      path: '/login'
        // query: { redirect: to.fullPath }
    })
  } else {
    if (to.matched.some(record => record.meta.requiresAuth) || (to.path === '/login')) {
      store.dispatch('authenticateToken', token).then(response => {
        // get user role
        if (to.path !== '/') {
          if (to.matched.find(record => record.meta.role).meta.role.indexOf(parseInt(store.state.role)) === -1) {
            next({
              path: '/'
            })
          } else {
            next()
          }
        } else {
          if (store.state.role === 1) {
            next({
              path: '/admin/dashboard'
            })
          } else {
            next({
              path: '/dashboard'
            })
          }
        }
      }).catch(() => {
        router.app.$cookie.delete('auth_token', { domain: location })
        store.commit('SET_TOKEN', null)
        store.commit('SET_USER', null)
        store.commit('SET_ROLE', null)
        if (to.path !== '/login') {
          next({
            path: '/login'
          })
        } else {
          next()
        }
      })
    } else {
      next()
    }
  }
})

router.afterEach(route => {
  iView.LoadingBar.finish()
})

sync(store, router)
  // console.log('process.env.accesskey', process.env.accesskey)

new Vue({
  el: '#app',
  router,
  store: store,
  template: '<App/>',
  components: { App }
})
