import api from '../../api'
let model = 'dataquery'
export default {
  get: (id = null, params = null, headers = null) => {
    return api.request('get', '/' + model, null, params, headers)
  }
}
