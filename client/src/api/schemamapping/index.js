import api from '../../api'
let model = 'schemamapping'
export default {
  get: (id) => {
    if (id === undefined) {
      return api.request('get', '/' + model + '/?$paginate=false')
    } else {
      return api.request('get', '/' + model + '/' + id)
    }
  },
  post: (data) => {
    return api.request('post', '/' + model, data)
    .then(response => {
      return ({'status': 'success', 'message': 'Mapping Inserted sucessfully;'})
    })
    .catch(error => {
      return ({'status': 'error', 'message': error})
    })
  },
  deleteThis: (id) => {
    return api.request('delete', '/' + model + '/' + id)
  },
  update: (data, id) => {
    return api.request('put', '/' + model + '/' + id, data)
    .then(response => {
      return ({'status': 'success', 'message': 'Schema Mapping updated sucessfully;'})
    })
    .catch(error => {
      return ({'status': 'error', 'message': error})
    })
  }
}
