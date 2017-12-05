import axios from 'axios'
import config from '../../config'
let model = config.loginURL
export default {
  post: (data) => {
    let method = 'post'
    return axios({ method, model, data })
  }
}
