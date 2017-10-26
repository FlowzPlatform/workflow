/* eslint-disable no-unused-vars */
var express = require('express');
var path = require('path');
var CryptoJS = require("crypto-js");
let async = require('asyncawait/async');
let await = require('asyncawait/await');
// var db = require('../DBConnection/db');
var fileName = '../DBConnection/db.json';
var fs = require('fs');
var jsonfile = require('jsonfile')
var _ = require('lodash')
var endecrypt = require('../encryption/security')

class Service {
  constructor (options) {
    this.options = options || {};
  }

  find (params) {
    let result = new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, '../DBConnection/db.json'),function (err, data) {
          if (err) return console.log(err);
              resolve(JSON.parse(data));
          });
    });
    var _data = Promise.resolve(result).then(function(dbdata){
        // console.log(dbdata)
        _.forEach(dbdata, function(instances, db){
            // console.log(instances)
            _.forEach(instances.dbinstance, function(item, i){
                // console.log(dbdata[db].dbinstance[i])
                delete dbdata[db].dbinstance[i].username
                delete dbdata[db].dbinstance[i].password
            })
        })
        return dbdata
    });
    return _data
  }

  get (id, params) {
    let result = new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, '../DBConnection/db.json'),function (err, data) {
          if (err) return console.log(err);
              resolve(JSON.parse(data));
          });
    });
    var _data = Promise.resolve(result).then(function(dbdata){
        // console.log(dbdata)
        var instance;
        _.forEach(dbdata, function(instances, db){
            var obj = _.find(instances.dbinstance, {id: id})
            if(obj != undefined){
              instance = obj
            }   
        })
        return instance
    });
    return _data
  }

  create (data, params) {
    console.log('********* Inside Create Service *********\n');
    //encryption
    data.password = endecrypt.encrypt(data.password);
    // console.log(data)
    let result = new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, '../DBConnection/db.json'),function (err, data) {
          if (err) return console.log(err);
              resolve(JSON.parse(data));
          });
    });
    var _data = Promise.resolve(result).then(function(res){
      var selectDB = data.selectedDb;
      delete data.selectedDb;

      //check connection alredy exist or not
      var check = ''
      _.map(res[selectDB].dbinstance, function(instance) { 
        if(instance.connection_name == data.connection_name && instance.host == data.host && instance.port == data.port && instance.dbname == data.dbname){
            check = 'Exist'
        }
      })
      if(check == 'Exist'){
        return 'Exist'
      }else{
        //check connection is isdefault true
          if(data.isdefault){
            _.forEach(res[selectDB].dbinstance, function(inst){
              inst.isdefault = false
            })    
          }
          console.log(res[selectDB].dbinstance)
          res[selectDB].dbinstance.push(data)
          let result1 = new Promise((resolve, reject) => {
            jsonfile.writeFile(path.join(__dirname, '../DBConnection/db.json'), res, {spaces: 4}, function(err) {
                if (err) return 'Error';
                resolve(res);
            });
          });
          Promise.resolve(result1);
          return 'Success'
      }
    });
    return _data;
  }

  update (id, data, params) {
    console.log('Inside Update Settings...', id, data, params.query)
    var updatedb = params.query.db
    let result = new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, '../DBConnection/db.json'),function (err, data) {
          if (err) return console.log(err);
              resolve(JSON.parse(data));
          });
    });
    var _data = Promise.resolve(result).then(function(res){
        var index_instance = _.findKey(res[updatedb].dbinstance, {id: id});
        // console.log('instance', index_instance)
        res[updatedb].dbinstance[index_instance].isenable = data.isenable
        let result1 = new Promise((resolve, reject) => {
            jsonfile.writeFile(path.join(__dirname, '../DBConnection/db.json'), res, {spaces: 4}, function(err) {
                if (err) return 'Error';
                resolve(res);
            });
          });
        return Promise.resolve(result1);
    });
    return _data;
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    console.log('Inside Delete Settings...')
    var updatedb = params.query.db
    let result = new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, '../DBConnection/db.json'),function (err, data) {
          if (err) return console.log(err);
              resolve(JSON.parse(data));
          });
    });
    var _data = Promise.resolve(result).then(function(res){
        var index_instance = _.findKey(res[updatedb].dbinstance, {id: id});
        // console.log('instance', index_instance)
        res[updatedb].dbinstance.splice(index_instance, 1)
        let result1 = new Promise((resolve, reject) => {
            jsonfile.writeFile(path.join(__dirname, '../DBConnection/db.json'), res, {spaces: 4}, function(err) {
                if (err) return 'Error';
                resolve(res);
            });
          });
        return Promise.resolve(result1);
    });
    return _data;
    // return Promise.resolve({ id });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
