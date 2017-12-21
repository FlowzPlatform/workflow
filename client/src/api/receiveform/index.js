import api from '../../api'
let model = 'receive-form'
export default {
  post: (data) => {
    return api.request('post', '/' + model, data)
  }
}
