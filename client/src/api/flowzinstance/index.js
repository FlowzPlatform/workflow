import api from '../../api'
let model = 'flowz-instance'
export default {
  get: (params = null, headers = null) => {
    console.log('headers', headers)
    return api.request('get', '/' + model, null, params, headers)
  },
  getThis: (id, params = null, headers = null) => {
    return api.request('get', '/' + model + '/' + id, null, params, headers)
  },
  getByfid: (fid, params = null, headers = null) => {
    return api.request('get', '/' + model + '?fid=' + fid, null, params, headers)
  },
  post: (data, params = null, headers = null) => {
    return api.request('post', '/' + model, data, null, params, headers)
  },
  put: (id, data, params = null, headers = null) => {
    return api.request('put', '/' + model + '/' + id, data, null, params, headers)
  }
}
