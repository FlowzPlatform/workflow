import api from '../../api'
let model = 'approval'
export default {

  // let gets = async function (id) {
  //     return true;
  //   },
  // get: (id) => {
  //   if (id === undefined) {
  //     return api.request('get', '/' + model)
  //   } else {
  //     return api.request('get', '/' + model + '/' + id)
  //   }
  // }

  get: (rowId) => {
    return api.request('get', '/' + model)
    .then(response => {
      return response.data.data
    })
    .catch(error => {
      console.log(error)
    })
  },
  getOne: (rowId) => {
    return api.request('get', '/' + model + '/' + rowId)
    .then(response => {
      return response.data
    })
    .catch(error => {
      console.log(error)
    })
  },
  delete: (rowId) => {
    return api.request('delete', '/' + model + '/' + rowId)
    .then(response => {
      return ({'status': 'success', 'message': 'Record deleted sucessfully;'})
    })
    .catch(error => {
      return ({'status': 'error', 'message': error})
    })
  },
  add: (data) => {
    return api.request('post', '/' + model, data)
    .then(response => {
      return ({'status': 'success', 'message': 'Record Inserted sucessfully;'})
    })
    .catch(error => {
      console.log(error)
    })
  },
  update: (data, id) => {
    return api.request('put', '/' + model + '/' + id, data)
    .then(response => {
      return ({'status': 'success', 'message': 'Record updated sucessfully;'})
    })
    .catch(error => {
      console.log(error)
    })
  }
}
