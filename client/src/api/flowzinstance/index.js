import api from '../../api'
let model = 'flowz-instance'
export default {
  get: () => {
    return api.request('get', '/' + model)
  },
  getThis: (id) => {
    return api.request('get', '/' + model + '/' + id)
  },
  getByfid: (fid, params = null) => {
    return api.request('get', '/' + model + '?fid=' + fid, null, params)
  },
  post: (data) => {
    return api.request('post', '/' + model, data)
  },
  put: (id, data) => {
    return api.request('put', '/' + model + '/' + id, data)
  }
}
