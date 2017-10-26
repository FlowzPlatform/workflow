import api from '../api'
// import _ from 'lodash'
export default {
  getSchema ({ commit }) {
    commit('SET_SCHEMA', [])
    api.request('get', '/schema')
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
  }
}
