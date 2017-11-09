import api from '@/api'
let model = 'bpmnplugins'
export default {
  get: (rowId) => {
    if (!rowId) {
      return api.request('get', '/' + model)
        .then(response => {
          return response.data.data
        })
        .catch(error => {
          console.log(error)
          return error
        })
    } else {
      return api.request('get', '/' + model + '/' + rowId)
        .then(response => {
          return response.data
        })
        .catch(error => {
          console.log(error)
        })
    }
  },
  update: (id, data) => {
    return api.request('put', '/' + model + '/' + id, data)
      .then(response => {
        return ({ status: 'success', message: 'Record updated sucessfully;' })
      })
      .catch(error => {
        return ({ error: 'success', message: error })
      })
  }
}
