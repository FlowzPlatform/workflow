import axios from 'axios'
import config from '../config'
import store from '../store'
import utils from '@/Utils'
const timeout = {
  '/schema': 7200,
  '/flowz': 7200,
  '/emailtemplate': 7200,
  '/bpmnplugins': 9200,
  '/finstance': 0,
  '/dataquery': 0,
  '/flowzdata': 0,
  '/receiveform': 0,
  '/sendmail': 0,
  '/dflowzdata': 0
}

export default {
  async request (method, uri, data = null, params = null, headers) {
    if (headers !== null && headers !== undefined) {
      if (store.state.subscription !== undefined) {
        headers.subscriptionId = store.state.subscription
      } else {
        headers.subscriptionId = ''
      }
    } else {
      headers = {
        subscriptionId: store.state.subscription
      }
    }
    if (!method) {
      console.error('API function call requires method argument')
      return
    }

    if (!uri) {
      console.error('API function call requires uri argument')
      return
    }

    if (headers.subscription === '') {
      console.error('API function call requires proper subscriptionId to be passed as a header')
      return
    }
    let url = config.serverURI + uri
    if (method === 'get') {
      let cacheKey = `${method}_${url}_${JSON.stringify(params)}`
      let cachedTimeout = 0
      if (timeout.hasOwnProperty(uri)) {
        cachedTimeout = timeout[uri]
      } else {
        let regExpmainPlan = new RegExp('^\/[A-Za-z]*\/', 'i') // eslint-disable-line
        let n = uri.match(regExpmainPlan)
        if (n !== undefined && n !== null && n.length > 0) {
          cachedTimeout = timeout[n[0].substring(0, n[0].length - 1)]
        }
      }
      let res = await utils.CachedRes(cacheKey, cachedTimeout)
      if (!res) {
        return axios({ method, url, data, params, headers }).then(resp => {
          utils.setCached(cacheKey, resp)
          return resp
        })
      } else {
        return res
      }
    } else {
      return axios({ method, url, data, params, headers })
    }
  }
}
