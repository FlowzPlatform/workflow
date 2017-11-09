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
          // "error": {
          //   "statusCode": 500,
          //   "name": "Error",
          //   "message": "read ETIMEDOUT",
          //   "code": "ETIMEDOUT",
          //   "errno": "ETIMEDOUT",
          //   "syscall": "read",
          //   "stack": "Error: read ETIMEDOUT\n    at exports._errnoException (util.js:1050:11)\n    at TCP.onread (net.js:582:26)"
          // }
          throw error.message
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
