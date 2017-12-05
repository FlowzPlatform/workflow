import api from '../../api'
let model = 'usermaster'
export default {
  get: (id) => {
    if (id === undefined) {
      return api.request('get', '/' + model)
    } else {
      return api.request('get', '/' + model + '/' + id)
    }
  },
  getByParam: (param) => {
    // 'http://172.16.160.117:3030/usermaster?emailId='+self.formInline.Email
    return api.request('get', '/' + model + '?emailId=' + param)
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
