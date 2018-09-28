import api from '../../api'
let model = 'finstance'
export default {
  get: (id = null, params = null, headers = null) => {
    if (id === null) {
      return api.request('get', '/' + model, null, params, headers)
    } else {
      return api.request('get', '/' + model + '/' + id, null, params, headers)
    }
  },
  // getThis: (id) => {
  //   return api.request('get', '/' + model + '/' + id)
  // },
  post: (data, params = null, headers) => {
    return api.request('post', '/' + model, data, params, headers)
  },
  put: (id, data, params = null, headers) => {
    return api.request('put', '/' + model + '/' + id, data, params, headers)
  },
  patch: (id, data, params = null, headers) => {
    return api.request('patch', '/' + model + '/' + id, data, params, headers)
  },
  delete: (id, params = null, headers) => {
    return api.request('delete', '/' + model + '/' + id, params, headers)
  }
}
