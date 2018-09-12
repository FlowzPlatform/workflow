import api from '../api'
import axios from 'axios'
import config from '@/config'
import flowz from '@/api/flowz'
export default {
  getSchema ({ commit }) {
    commit('SET_SCHEMA', [])
    api.request('get', '/schema?$paginate=false')
      .then(response => {
        commit('SET_SCHEMA', response.data)
      })
      .catch(error => {
        console.log(error)
        commit('SET_SCHEMA', [])
      })
  },
  getFlowzdata ({ commit }) {
    flowz.get(null, {
      $paginate: false
    })
      .then(response => {
        commit('SET_FLOWZDATA', response.data)
      })
      .catch(error => {
        console.log(error)
        commit('SET_FLOWZDATA', [])
      })
  },
  setXMLtoLocalStorage ({commit}, text) {
    commit('SET_XML', text)
  },
  removeXMLtoLocalStorage ({commit}) {
    commit('REMOVE_XML')
  },
  authenticate ({ commit }, authToken) {
    let userData = commit('GET_USER')
    if (userData !== undefined) {
      return userData
    }
    return axios({
      method: 'get',
      url: config.loginURL + '/userdetails',
      headers: {
        'authorization': authToken
      }
    })
    .then(response => {
      if (response) {
        commit('SET_USER', response.data.data)
        return response.data.data
      } else {
        return null
      }
    })
  },
  authenticateToken ({ commit }, authToken) {
    return true
    // return axios({
    //   method: 'post',
    //   url: config.loginURL + '/validatetoken',
    //   headers: {
    //     'authorization': authToken
    //   }
    // })
    // .then(response => {
    //   return response.data.status
    // })
  }
}
