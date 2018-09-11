import api from '../../api'
let model = 'flowz'
import store from '@/store'
export default {
  get: (id = null, params = null, headers = null) => {
    if (id === null) {
      return api.request('get', '/' + model, null, params, headers)
    } else {
      // console.log('get by id')
      if (this.$store.state.flowzdef.hasOwnProperty(id)) {
        return this.$store.state.flowzdef[id]
      } else {
        return api.request('get', '/' + model + '/' + id, null, params, headers).then(res => {
          this.$store.state.flowzdef[id] = res.data
          return res
        })
      }
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
