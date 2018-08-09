import api from '../../api'
let model = 'finstance'
export default {
  get: (id = null, params = null) => {
    if (id === null) {
      return api.request('get', '/' + model, null, params).then(response => {
        return response.data
      })
    } else {
      return api.request('get', '/' + model + '/' + id, params)
    }
  },
  // getThis: (id) => {
  //   return api.request('get', '/' + model + '/' + id)
  // },
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