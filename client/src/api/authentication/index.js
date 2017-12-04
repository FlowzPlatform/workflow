import axios from 'axios'
import config from '../../config'

export default {
  login: (params) => {
    return axios({
      method: 'post',
      url: config.loginURL + '/login',
      data: params
    }).then(response => {
      if (response) {
        return response.data
      } else {
        throw new Error('Network error!')
      }
    }).catch(error => {
      throw error
    })
  }
}
