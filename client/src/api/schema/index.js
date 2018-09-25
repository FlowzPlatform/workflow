import api from '../../api'
let model = 'schema'
let getAllEntity = async(id) => {
  let response = await api.request('get', '/' + model + '/' + id)
  for (let [index, item] of response.data.entity.entries()) {
    if (item.customtype) {
      response.data.entity[index]['entity'] = await getAllEntity(item.type)
      response.data.entity[index]['name'] = item.name
    }
  }
  return response.data
}
export default {
  get: (id = null, params = null) => {
    if (id === null) {
      return api.request('get', '/' + model, null, params)
    } else {
      return api.request('get', '/' + model + '/' + id)
    }
  },
  getCustom: (string) => {
    // console.log('string', string)
    if (!string) {
      return api.request('get', '/' + model + '?isdeleted=false')
    } else {
      return api.request('get', '/' + model + string)
    }
  },
  getAll: getAllEntity,
  getThis: (id) => {
    return api.request('get', '/' + model + '/' + id)
  },
  post: (data) => {
    return api.request('post', '/' + model, data)
  },
  put: (id, data) => {
    return api.request('put', '/' + model + '/' + id, data)
  }
}
