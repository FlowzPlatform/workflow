import api from '../../api'
let model = 'subscription/user-module-role'
export default {
  get: (id = null, params = null) => {
    if (id === null) {
      return api.request('get', '/' + model, null, params)
    } else {
      return api.request('get', '/' + model + '/' + id, params)
    }
  },
  post: (data) => {
    return api.request('post', '/' + model, data)
  },
  put: (id, data) => {
    return api.request('put', '/' + model + '/' + id, data)
  },
  patch: (id, data) => {
    return api.request('patch', '/' + model + '/' + id, data)
  },
  delete: (id) => {
    return api.request('delete', '/' + model + '/' + id)
  }
}
