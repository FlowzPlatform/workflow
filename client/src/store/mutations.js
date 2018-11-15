var _ = require('lodash')
export default {
  SET_USER (state, user) {
    state.user = user
  },
  GET_USER (state) {
    return state.user
  },
  SET_TOKEN (state, token) {
    state.token = token
  },
  SET_ROLE (state, role) {
    state.role = role
  },
  SET_SCHEMA (state, schema) {
    state.schema = schema
  },
  SET_FLOWZDATA (state, flowz) {
    state.flowz = flowz
  },
  SET_MAPTEMP (state, data) {
    var status = _.find(state.mappingTemp, { 'producer': data.producer })
    if (status !== undefined) {
      var inx = _.findIndex(state.mappingTemp, { 'producer': data.producer })
      state.mappingTemp[inx] = data
    } else {
      state.mappingTemp.push(data)
    }
  },
  SET_DELTHISMAPTEMP (state, data) {
    state.mappingTemp.splice(data.index, 1)
  },
  SET_XML (state, data) {
    state.BPMNxml = data
  },
  REMOVE_XML (state) {
    state.BPMNxml = ''
  }
}
