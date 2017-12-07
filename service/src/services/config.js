const config = require('config');
console.log('USER', config.get('rdb_user').trim());
var rethinkdb = {
  rethinkdb: {
    db: 'FlowzEngine',
    servers: [{
      host: config.get('rdb_host').trim(),
      port: config.get('rdb_port').trim()
    }]
  }
};
if (config.get('rdb_user').trim() !== '') {
  rethinkdb.rethinkdb.servers.user = config.get('rdb_user').trim();
  rethinkdb.rethinkdb.servers.password = config.get('rdb_password').trim()
}
module.exports = rethinkdb;