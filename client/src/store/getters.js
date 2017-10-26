export default {
  allSchema (state) {
    // console.log('allSchema', state.schema)
    return state.schema
  },
  allSettings (state) {
    return state.settings
  },
  TabData (state) {
    return state.tabdata
  },
  MapTemp (state) {
    // console.log('state.mappingTemp', state.mappingTemp)
    return state.mappingTemp
  },
  getXML (state) {
    return state.BPMNxml
  }
}
