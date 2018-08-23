import api from '../../api'
let model = 'flowz'
export default {
  get: (id = null, params = null, headers = null) => {
    if (id === null) {
      return api.request('get', '/' + model, null, params, headers)
    } else {
      return api.request('get', '/' + model + '/' + id, null, params, headers)
    }
  },
  getCustom: (string) => {
    return api.request('get', '/' + model + string)
  },
  post: (data) => {
    return api.request('post', '/' + model, data)
  },
  put: (id, data) => {
    return api.request('put', '/' + model + '/' + id, data)
  },
  delete: (id) => {
    return api.request('delete', '/' + model + '/' + id)
  }
}
