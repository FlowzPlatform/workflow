import api from '../api'
import axios from 'axios'
import config from '@/config'
import modelUser from '@/api/user'
import flowz from '@/api/flowz'
// import _ from 'lodash'
export default {
  getSchema ({ commit }) {
    commit('SET_SCHEMA', [])
    api.request('get', '/schema?$paginate=false')
      .then(response => {
        // console.log('hdhd::', _.reject(response.data, { 'isdeleted': true }))
        commit('SET_SCHEMA', response.data)
      })
      .catch(error => {
        console.log(error)
        commit('SET_SCHEMA', [])
      })
  },
  getSettings ({ commit }) {
    commit('SET_SETTINGS', [])
    api.request('get', '/settings')
      .then(response => {
        commit('SET_SETTINGS', response.data)
      })
      .catch(error => {
        console.log(error)
        // commit('SET_SETTINGS', [])
      })
  },
  getTabdata ({commit}, text) {
    commit('SET_TABDATA', text)
    // console.log('getTabdata', text)
  },
  getFlowzdata ({ commit }) {
    // commit('SET_FLOWZDATA', [])
    // api.request('get', '/flowz')
    flowz.get(null, {
      $paginate: false,
      $select: ['id', 'json']
    })
      .then(response => {
        commit('SET_FLOWZDATA', response.data)
      })
      .catch(error => {
        console.log(error)
        commit('SET_FLOWZDATA', [])
      })
  },
  setMapTemp ({commit}, text) {
    // console.log('getMapTempflag', text)
    commit('SET_MAPTEMP', text)
  },
  delThisMapTemp ({commit}, text) {
    // console.log('getMapTempflag', text)
    commit('SET_DELTHISMAPTEMP', text)
  },
  setXMLtoLocalStorage ({commit}, text) {
    commit('SET_XML', text)
  },
  removeXMLtoLocalStorage ({commit}) {
    commit('REMOVE_XML')
  },
  authenticate ({ commit }, authToken) {
    let userData = commit('GET_USER')
    if (!userData) {
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
    return axios({
      method: 'post',
      url: config.loginURL + '/validatetoken',
      headers: {
        'authorization': authToken
      }
    })
    .then(response => {
      return response.data.status
    })
  },
  getUser ({ commit }, email) {
    return modelUser.getByParam(email).then((response) => {
      if (response && response.data.data.length > 0) {
        return response.data.data[0]
      }
    })
  }
  // getActiveFlow ({commit}, id) {
  //   console.log(id)
  //   // return flowz.get(id, {
  //   //   $select: ['json']
  //   // }).then(res => {
  //   commit('SET_ACTIVE_FLOW', id)
  //   //   // return res.data
  //   // }).catch(err => {
  //   //   console.log('Error state getActiveFlow', err)
  //   //   commit('SET_ACTIVE_FLOW', '')
  //   //   // return []
  //   // })
  // }
}
