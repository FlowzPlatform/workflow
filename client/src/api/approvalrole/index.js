import axios from 'axios'
import config from '../../config'
export default {
  get: (roleName) => {
    if (!roleName) {
      return axios.get(config.approvalRoleURI + 'getroles')
        .then(response => {
          return response.data.data.roles
        })
        .catch(error => {
          console.log('Error : ', error)
        })
    } else {
      return axios.get(config.approvalRoleURI + 'userslist/' + roleName)
        .then(response => {
          console.log(':::', response.data.data.roles)
          return response.data.data.roles
        })
        .catch(error => {
          console.log('Error : ', error)
        })
    }
  }
}
