var db = require('./db');
let _ = require('lodash');
let async = require('asyncawait/async');
let await = require('asyncawait/await');
var endecrypt = require('../encryption/security')
var r = []

db.rethink.dbinstance.forEach(function (instance, inx) {
    if (instance.isenable) {

      var connection = require('rethinkdbdash')({
        username: instance.username,
        password: endecrypt.decrypt(instance.password),
        port: instance.port,
        host: instance.host,
        db: instance.dbname
      });

      var yes = connection.dbList().contains(instance.dbname) // create db if not exists
        .do(function (dbExists) {
          return connection.branch(dbExists, { created: 0 }, connection.dbCreate(instance.dbname));
        }).run().then(function () {
          return connection.db(instance.dbname).tableList().contains('schema') // create table if not exists
            .do(function (tableExists) {
              return connection.branch(tableExists, { created: 0 }, connection.db(instance.dbname).tableCreate('schema'));
            }).run().then(function () {
              return connection.db(instance.dbname).tableList().contains('flowsinstance') // create table if not exists
                .do(function (tableExists) {
                  return connection.branch(tableExists, { created: 0 }, connection.db(instance.dbname).tableCreate('flowsinstance'));
                }).run();
            });
        });
      r.push({ id: instance.id, conn: connection })
    }
  })

module.exports = {
  choose: async(function () {
    console.log('===================RETHINKDB=================');
  }),
  getSchemaName: async(function (name) {
    console.log('rethink get SchemaName');
    var schemadata = await (r.table('schema').filter({ 'title': name })
      .run()
      .then(function (response) {
        // console.log('response',response);
        return response;
      })
      .error(function (err) {
        console.log('Error:', err);
      }))
    return schemadata;
  }),

  getThisSchemaType: async(function (id, type) {
    console.log('rethink get Schema Type');
    var schemadata = await (r.table('schema').filter({ 'id': id })
      .run()
      .then(function (response) {
        // console.log('response',response);
        var result = [];
        response[0].entity.forEach(function (item, i) {
          // console.log('item---',item);
          if (item.type === type) {
            result.push(item);
          }
        });
        return result;
      })
      .error(function (err) {
        console.log('Error:', err);
      }))
    return schemadata;
  }),

  getThisSchemaFieldName: async(function (id, fieldname) {
    console.log('rethink get Schema Type');
    var schemadata = await (r.table('schema').filter({ 'id': id })
      .run()
      .then(function (response) {
        // console.log('response',response);
        var result = [];
        response[0].entity.forEach(function (item, i) {
          // console.log('item---',item);
          if (item.name === fieldname) {
            result.push(item);
          }
        });
        return result;
      })
      .error(function (err) {
        console.log('Error:', err);
      }))
    return schemadata;
  }),

  getSchema: async(function () {
    console.log('rethink get Schema');
    var schemadata = async(function () {
      var result = []
      _.forEach(r, function (dbinstance) {
          var data = await (dbinstance.conn.table('schema').run())
          _.forEach(data, function (instance) {
            result.push(instance)
          })
        })
      return result;
    });
    var res = await (schemadata())
    return res;
    // var schemadata = await (r.table('schema').run())
    // .then(function(response){
    //     // console.log('response getSchema::',response);
    //     return response;
    // })
    // .error(function(err){
    //     console.log('Error:',err);
    // }))
    // return schemadata;

    //      var schemadata = await (r.table('schema')
    // .run()
    // .then(function(response){
    //  // console.log('response getSchema::',response);
    //           return response;
    // })
    // .error(function(err){
    //  console.log('Error:',err);
    // }))
    // return schemadata;
  }),

  getThisSchema: async(function (id) {
    console.log('rethink get SchemaCurrent');
    // var schemadata = await (r.table('schema').filter({'id': id}).run())
    // // console.log('SchemaCurrent',id, schemadata);
    // return schemadata[0];
    var schemadata = async(function () {
      var result = []
      _.forEach(r, function (dbinstance) {
        var data = await (dbinstance.conn.table('schema').filter({ 'id': id }).run())
        _.forEach(data, function (instance) {
          result.push(instance)
        })
      })
      return result;
    });
    var res = await (schemadata())
    return res;
  }),

  getflowsInstance: async(function () {
    console.log('rethink get flowsInstance');
    var flowsInstance = async(function () {
      var result = []
      _.forEach(r, function (dbinstance) {
          var data = await (dbinstance.conn.table('flowsinstance').run())
          _.forEach(data, function (instance) {
            result.push(instance)
          })
        })
      return result;
    });
    var res = await (flowsInstance())
    return res;
    // var flowsInstance = await (r.table('flowsinstance')
    //   .run()
    //   .then(function (response) {
    //     // console.log('getflowsInstance:',response);
    //     return response;
    //   })
    //   .error(function (err) {
    //     console.log('Error:', err);
    //   }));
    // return flowsInstance;
  }),

  getThisflowsInstance: async(function (id) {
    console.log('rethink get flowsInstanceCurrent');
    var flowsInstance = async(function () {
      var result = []
      _.forEach(r, function (dbinstance) {
        var data = await (dbinstance.conn.table('flowsinstance').filter({ 'id': id }).run())
        _.forEach(data, function (instance) {
          result.push(instance)
        })
      })
      return result;
    });
    var res = await (flowsInstance())
    return res;
    // var flowsInstance = await (r.table('flowsinstance').filter({ 'id': id }).run());
    // // console.log('flowsInstance',flowsInstance);
    // return flowsInstance[0];
  }),

  //post methods
  postSchema: async(function (data) {
    console.log('rethink post Schema');
    console.log('guid', data.database[1])
    var selectedDB = _.find(r, (d) => {
        return d.id == data.database[1]
    })
      // console.log(selectedDB)
    var schema = await (selectedDB.conn.table("schema").insert(data).run());

    var _id = schema.generated_keys[0];
    selectedDB.conn.table("schema").get(_id).update({ '_id': _id }).run();
    return schema;


    //    var schema = await (r.table("schema").insert(data).run());
    // console.log('########## from postSchema',schema);

    // var _id = schema.generated_keys[0];
    //    r.table("schema").get(_id).update({'_id': _id}).run();
    // return schema;
  }),
  
  postflowsInstance: async(function (data, dbid) {
    console.log('....................rethink post flowsInstance........................');
    console.log('guid', dbid)
    var selectedDB = _.find(r, (d) => {
        return d.id == dbid
    })
    // var _data = JSON.parse(data);
    // console.log('data:',_data);
    var flowsInstance = await (selectedDB.conn.table("flowsinstance").insert(data).run());
    // console.log('########## from postSchema',flowsInstance);

    var _id = flowsInstance.generated_keys[0];
    selectedDB.conn.table("flowsinstance").get(_id).update({ '_id': _id }).run();
    return flowsInstance.generated_keys[0];
  }),

  //put methods
  putSchema: async(function (data, id) {
    console.log('rethink put Schema');
    var selectedDB = _.find(r, (d) => {
        return d.id == data.database[1]
      })
      // console.log(selectedDB)
    var schema = await (selectedDB.conn.table("schema").get(id).replace(data).run());
    return schema;
    // var schema = await (r.table('schema').get(id).replace(data).run());
    // return schema;
  }),
  putflowsInstance: async(function (data, id) {
    console.log('rethink put flowsInstance');
    var selectedDB = _.find(r, (d) => {
        return d.id == data.database[1]
    })
    var flowsinstance = await (selectedDB.conn.table('flowsinstance').get(id).replace(data).run());
    return flowsinstance;
  }),

  // *******************delete methods********************

  // deleteSchema: async(function () {
  //   console.log('rethink delete allSchema');
  //   var schema = await (r.table('schema').delete().run());
  //   return schema;
  // }),

  deleteThisSchema: async(function (id, type) {
    console.log('rethink delete schema');
    if(type == 'softdel') {
        var schemadata = async(function () {
          var result = []
          _.forEach(r, function (dbinstance) {
            var data = await (dbinstance.conn.table('schema').get(id).update({isdeleted: true}).run())
            _.forEach(data, function (instance) {
              result.push(instance)
            })
          })
          return result;
        });
        var res = await (schemadata())
        // console.log('rethink delete res::', res);
        return res;
    }
    // var schema = await (selectedDB.conn.table("schema").filter({ 'id': id }).delete().run());
    // return schema;
    // // var schema = await (r.table('schema').filter({ 'id': id }).delete().run());
  }),

  // deleteflowsInstance: async(function () {
  //   console.log('rethink delete allSchema');
  //   var flowsinstance = await (r.table('flowsinstance').delete().run());
  //   return flowsinstance;
  // }),
  deleteThisflowsInstance: async(function (id) {
    console.log('rethink delete flowsInstance');
    var flowsinstance = await (r.table('flowsinstance').filter({ 'id': id }).delete().run());
    return flowsinstance;
  })
}
