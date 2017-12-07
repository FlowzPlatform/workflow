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

// Include and set up feathers client
const Feathers = require('feathers/client')
const hooks = require('feathers-hooks')
  // const authentication = require('feathers-authentication/client')
const socketio = require('feathers-socketio/client')
const io = require('socket.io-client')

const socket = io(config.serverURI)
const feathers = Feathers()
  .configure(socketio(socket))
  .configure(hooks())
  // .configure(authentication({storage: window.localStorage}))
  // Include it as a CommonJS module
const vueFeathers = require('vue-feathers')
  // And plug it in
Vue.use(vueFeathers, feathers)

import ElementUI from 'element-ui'
import element from 'element-ui/src/locale/lang/en'
import 'element-ui/lib/theme-default/index.css'
Vue.use(ElementUI, { element })

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

import VueCodeMirror from 'vue-codemirror'
Vue.use(VueCodeMirror)

/* jquery-ui */

import VueParticles from 'vue-particles'
Vue.use(VueParticles)

/* Animated css */

import 'animate.css/animate.css'

/* IView */
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'

import AsyncComputed from 'vue-async-computed'
Vue.use(AsyncComputed)

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

import psl from 'psl'
// Some middleware to help us ensure the user is authenticated.
router.beforeEach((to, from, next) => {
  iView.LoadingBar.config({ color: '#0e406d' })
    // window.console.log('Transition', transition)
    // router.app.$store.state.token
  if (to.query.ob_id) {
    let location = psl.parse(window.location.hostname) // get parent domain
    location = location.domain === null ? location.input : location.domain
    router.app.$cookie.set('auth_token', to.query.ob_id, { expires: 1, domain: location })
  }
  const token = router.app.$cookie.get('auth_token')
  if (to.matched.some(record => record.meta.requiresAuth) && (!token || token === 'null')) {
    window.console.log('Not authenticated')
    next({
      path: '/login'
        // query: { redirect: to.fullPath }
    })
  } else {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      store.dispatch('authenticate', token).then(response => {
        store.commit('SET_USER', response)
          // get user role
        if (to.matched.some(record => record.meta.role)) {
          store.dispatch('getUser', response.email).then(user => {
            if (user) {
              if (store.state.role !== null) {
                store.commit('SET_ROLE', user.role)
                if (to.matched.find(record => record.meta.role).meta.role.indexOf(parseInt(user.role)) === -1) {
                  // next({
                  //   path: '/login'
                  //     // query: { redirect: to.fullPath }
                  // })
                  next()
                } else {
                  next()
                }
              } else {
                store.commit('SET_ROLE', user.role)
                next({
                  path: parseInt(user.role) === 1 ? '/admin/dashboard' : '/'
                })
              }
            } else {
              next()
            }
          })
        } else {
          next()
        }
      }).catch(error => {
        console.log(error.message)
          // window.console.log('Not authenticated')
        next({
          path: '/login'
            // query: { redirect: to.fullPath }
        })
      })
    } else {
      next()
    }
  }
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
