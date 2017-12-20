/* eslint-disable no-unused-vars */
let async = require('asyncawait/async');
let await = require('asyncawait/await');
let config = require('config');
var axios = require('axios');

var tName = 'receive_form';
var r = require('rethinkdbdash')({
    // host: 'aws-us-east-1-portal.30.dblayer.com',
    // port: '16868',
    host: "159.203.134.27",
    port: "28015",
    db: 'FlowzEngine'
    // rauth: "51b2885598be1c2c1243a5c9c3548ad2",
    // cert: "/ca.crt"
});

class Service {
  constructor(options) {
    this.options = options || {};
  }
  find(params) {
    console.log('find feathers...');
    var res = findFunction()
    return Promise.resolve(res)
  }
  get(id, params) {
    console.log('Get feathers...');
    var res = getFunction(id)
    return Promise.resolve(res)
  }
  create(data, params) {
    console.log('create feathers...');
    var res = createFunction(data)
    return Promise.resolve(res)
  }
  update(id, data, params) {
    console.log('Update feathers...');
    var res = updateFunction(id, data)
    return Promise.resolve(res)
  }
  patch(id, data, params) {
    var res = patchFunction(id, data)
    return Promise.resolve(res)
  }
  remove(id, params) {
    console.log('Delete feathers...')
    var res = removeFunction(id)
    return Promise.resolve(res)
  }
}

var findFunction = async function () {
  let result
  await r.table(tName)
    .run()
    .then(async function (response) {
      console.log(response);
      result = await response
    })
    .error(function (err) {
      console.log(err);
    })
  return result
}

var getFunction = async function (id) {
  let result
  await r.table(tName)
    .get(id)
    .run()
    .then(async function (response) {
      console.log(response);
      result = await response
    })
    .error(function (err) {
      console.log(err);
    })
  return result
}

var createFunction = async function (data) {
  r.table(tName)
    .insert(data)
    .run()
    .then(function (response) {
      console.log('Success ', response);
    })
    .error(function (err) {
      console.log('error occurred ', err);
    })
  return data
}

var updateFunction = async function (id, data) {

  return id
}

var patchFunction = async function (id, data) {

  return id
}

var removeFunction = async function (id) {
  let result
  await r.table(tName)
    .get(id)
    .delete()
    .run()
    .then(async function (response) {
      console.log(response);
      result = await response
    })
    .error(function (err) {
      console.log(err);
    })
  return result
}

module.exports = function (options) {
  return new Service(options);
};
module.exports.Service = Service;
