import api from '../../api'
let model = 'schemamapping'
export default {
  get: (id) => {
    if (id === undefined) {
      return api.request('get', '/' + model)
    } else {
      return api.request('get', '/' + model + '/' + id)
    }
  },
  post: (data) => {
    return api.request('post', '/' + model, data)
  },
  deleteThis: (id) => {
    return api.request('delete', '/' + model + '/' + id)
  }
}
