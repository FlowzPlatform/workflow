import api from '../../api'
let model = 'emailtemplate'
export default {

  // let gets = async function (id) {
  //     return true;
  //   },
  get: () => {
    return api.request('get', '/' + model)
  }
}
