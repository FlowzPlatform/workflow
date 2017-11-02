var _ = require('lodash')
export default {
  TOGGLE_LOADING (state) {
    state.callingAPI = !state.callingAPI
  },
  SET_USER (state, user) {
    state.user = user
  },
  SET_TOKEN (state, token) {
    state.token = token
  },
  SET_SCHEMA (state, schema) {
    state.schema = schema
  },
  SET_SETTINGS (state, settings) {
    state.settings = settings
  },
  SET_TABDATA (state, tabdata) {
    // console.log('SET_TABDATA', tabdata)
    state.tabdata.push(tabdata)
  },
  SET_FLOWZDATA (state, flowz) {
    state.flowz = flowz
  },
  SET_MAPTEMP (state, data) {
    // console.log(_.find(state.mappingTemp, { 'producer': data.producer }))
    var status = _.find(state.mappingTemp, { 'producer': data.producer })
    if (status !== undefined) {
      var inx = _.findIndex(state.mappingTemp, { 'producer': data.producer })
      state.mappingTemp[inx] = data
    } else {
      state.mappingTemp.push(data)
    }
  },
  SET_DELTHISMAPTEMP (state, data) {
    // console.log('SET_DELTHISMAPTEMP', data)
    state.mappingTemp.splice(data.index, 1)
  },
  SET_XML (state, data) {
    state.BPMNxml = data
  },
  REMOVE_XML (state) {
    state.BPMNxml = ''
  }
}

