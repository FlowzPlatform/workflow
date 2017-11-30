const config = require("config");
let host = config.get("rdb_host").trim()
let port = config.get("rdb_port").trim()
module.exports = {
  rethinkdb: {
    db: "FlowzEngine",
    servers: [{
      host: config.get('rdb_host').trim(),
      port: config.get('rdb_port').trim()
    }]
  }
}