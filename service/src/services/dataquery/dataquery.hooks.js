

module.exports = {
  before: {
    all: [],
    find: [
      hook => beforeFind(hook)
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};


function beforeFind(hook) {
  let query = {};
  // console.log('__________________________________________________')
  if (hook.params.query.hasOwnProperty('$all')) {
    delete hook.params.query.$all
    
    // ----------------------------- || Get Last Record Data || --------------------------
    if (hook.params.query.$data) {
      delete hook.params.query.$data
      query = hook.app.services.flowzdata.createQuery(hook.params.query)
      hook.params.rethinkdb = query.hasFields('stageReference').filter(function(mdoc) {
        return mdoc("stageReference").count().gt(0)
      }).map(function(item) {
        return item.merge({
          'stageReference': item('stageReference').map(function(doc1) {
            return doc1.merge(function(doc) {
              // return {data: doc1.getField('stageRecordId')}
              // return {data: r.db('FlowzEngine').table('flowzdata').get(doc1.getField('stageRecordId')).getField('data')}
              return {data: hook.app.services.flowzdata.table.get(doc1.getField('stageRecordId')).getField('data')}
            })
          })   
        })
      })
    } else {
      query = hook.app.services.finstance.createQuery(hook.params.query)
      hook.params.rethinkdb = query.hasFields('stageReference').filter(function(mdoc) {
        return mdoc("stageReference").count().gt(0)
      }).map(function(item) {
        return item.merge({
          'stageReference': item('stageReference').map(function(doc1) {
            return doc1.merge(function(doc) {
              // return {data: doc1.getField('stageRecordId')}
              // return {data: r.db('FlowzEngine').table('flowzdata').get(doc1.getField('stageRecordId')).getField('data')}
              return {data: hook.app.services.flowzdata.table.get(doc1.getField('stageRecordId')).getField('data')}
            })
          })   
        })
      })
    }
  } else if (hook.params.query.hasOwnProperty("$last")) {
    delete hook.params.query.$last
    
    // ----------------------------- || Get Last Record Data || --------------------------
    query = hook.app.services.finstance.createQuery(hook.params.query)
    hook.params.rethinkdb = query.outerJoin(hook.app.services.flowzdata.table ,function(instance,data){
      return instance.hasFields('stageReference').and(
        instance('stageReference').count().gt(0).and(
        data('id').eq(instance('stageReference').nth(-1).getField('stageRecordId'))
      ))
    }).without({"right": {"id": true}})
    .zip()
  }
  // console.log('__________________________________________________')
  // console.log('hook.params.rethinkdb', hook.params.rethinkdb)
}