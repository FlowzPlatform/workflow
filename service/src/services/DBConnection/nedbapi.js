var db1 = require('./db');
let async = require('asyncawait/async');
let await = require('asyncawait/await');
var databasename = 'schema_builder';

var Datastore = require('nedb-promise');
var fname = (db1.nedb.dbname == '') ? databasename + '.db' : db1.nedb.dbname + '.db';
// console.log(fname);
var db = new Datastore({ filename: fname, autoload: true });
// db = {}; 

db.schema = new Datastore({ filename: 'schema.db', autoload: true });
db.instance = new Datastore({ filename: 'instance.db', autoload: true });

module.exports = {
  choose: async(function () {
    console.log('===================NEDB=================');
  }),

  //get methods
  getSchemaName: async(function (name) {
    console.log('NeDB get SchemaName');
    var schemadata = await (db.schema.cfind({ title: name }).exec());
    // console.log('SchemaName',schemadata);
    return schemadata;
  }),

  getThisSchemaType: async(function (id, type) {
    console.log('NeDB get SchemaCurrent Type', type);
    var schemadata = await (db.schema.cfindOne({ _id: id }).exec());
    var result = [];
    schemadata.entity.forEach(function (item, i) {
      if (item.type === type) {
        result.push(item);
      }
    });
    return result;
  }),

  getThisSchemaFieldName: async(function (id, fieldname) {
    console.log('NeDB get SchemaCurrent fieldname');
    var schemadata = await (db.schema.cfindOne({ _id: id }).exec());
    var result = [];
    schemadata.entity.forEach(function (item, i) {
      if (item.name === fieldname) {
        result.push(item);
      }
    });
    return result;
  }),

  getSchema: async(function () {
    console.log('NeDB get Schema');
    var schemadata = await (db.schema.cfind({}).exec())
      // console.log('schemadata',schemadata)
    return schemadata;
  }),
  getThisSchema: async(function (id) {
    console.log('NeDB get SchemaCurrent');
    var schemadata = await (db.schema.cfindOne({ _id: id }).exec());
    // console.log('SchemaCurrent',schemadata);
    // return schemadata;
    if(schemadata == null) {
        return [];
    }
    else {
      var arr=[]
      arr.push(schemadata)
    }
  }),
  getflowsInstance: async(function () {
    console.log('NeDB get flowsInstance');
    var flowsInstance = await (db.instance.cfind({}).exec());
    // console.log('flowsInstance',flowsInstance);
    return flowsInstance;
  }),
  getThisflowsInstance: async(function (id) {
    console.log('NeDB get flowsInstanceCurrent');
    var flowsInstance = await (db.instance.cfindOne({ _id: id }).exec());
    // console.log('flowsInstance',flowsInstance);
    return flowsInstance;
  }),

  //post methods
  postSchema: async(function (data) {
    console.log('NeDB post Schema');
    var schemadata = await (db.schema.insert(data));
    console.log('schemadata', schemadata);
    return schemadata;
  }),
  postflowsInstance: async(function (data) {
    console.log('NeDB post flowsInstance');
    var flowsInstance = await (db.instance.insert(data));
    console.log('flowsInstance', flowsInstance);
    return flowsInstance;
  }),

  //put methods
  putSchema: async(function (data, id) {
    delete data._id
    console.log('NeDB put Schema');
    var schemadata = await (db.schema.update({ _id: id }, { $set: data }));
    console.log('schemadata', schemadata);
    return schemadata;
  }),
  putflowsInstance: async(function (data, id) {
    console.log('NeDB put flowsInstance');
    var flowsInstance = await (db.instance.update({ _id: id }, { $set: data }));
    console.log('flowsInstance', flowsInstance);
    return flowsInstance;
  }),

  //delete methods
  // deleteSchema: async(function() {
  //     var schemadata = await (db.schema.remove({}, { multi: true }));
  //     return schemadata;
  // }),
  deleteThisSchema: async(function (id, type) {
    console.log('NeDB delete schema', type);
    if(type == 'softdel'){
      var schemadata = await (db.schema.update({ _id: id }, { $set: {isdeleted: true}}));
      // console.log('nedb ',schemadata)
      return schemadata;
    }
    // var schemadata = await (db.schema.remove({ _id: id }));
    // console.log('schemadata', schemadata);
  }),
  deleteThisflowsInstance: async(function (id) {
    console.log('NeDB delete flowsInstance');
    var flowsInstance = await (db.instance.remove({ _id: id }));
    console.log('flowsInstance', flowsInstance);
    return flowsInstance;
  })

}
