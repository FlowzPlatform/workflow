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
    return axios({
      method: 'get',
      url: config.loginURL + '/userdetails',
      headers: {
        'authorization': authToken
      }
    })
    .then(response => {
      if (response) {
        return response.data.data
      } else {
        return
      }
    })
  }
}
