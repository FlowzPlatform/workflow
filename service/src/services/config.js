const config = require('config');
const fs = require('fs');
// console.log('USER', config.get('rdb_user').trim());
let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname + process.env.cert) } : null
let rauth = process.env.rauth ? process.env.rauth : null
var rethinkdb = {
  rethinkdb: {
    db: 'FlowzEngine',
    servers: [{
      host: config.get('rdb_host').trim(),
      port: config.get('rdb_port').trim(),
      authKey: rauth,
      ssl: ssl
    }]
  }
};
if (config.get('rdb_user').trim() !== '') {
  rethinkdb.rethinkdb.servers.user = config.get('rdb_user').trim();
  rethinkdb.rethinkdb.servers.password = config.get('rdb_password').trim()
}
module.exports = rethinkdb;