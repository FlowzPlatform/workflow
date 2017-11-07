const app = require('config')
const cxnOptions = app.get('rethinkdb')
var qOptions = app.get('jOptions')
qOptions.name = 'select_worker'

const worker = require('flowz-worker')
const select_worker = new worker({
    cxnOptions: cxnOptions,
    qOptions: qOptions
  },
  (input) => {

  let output = {}
  output.rejected = []
  output.selected = []

  for (let i = 0; i < input.length; i++) {
    output.rejected[i] = {}
    output.rejected[i].selector = []
    output.selected[i] = {}
    output.selected[i].selector = []
    for (let j = 0; j < input[i].selector.length; j++) {
      let t = {}
      for (key in input[i].selector[j]) {
        t[key] = input[i].selector[j][key]
      }
      if(input[i].selector[j].selected){
        output.selected[i].selector.push(t)
      }else{
        output.rejected[i].selector.push(t)
      }
    }
  }

  return output
})
