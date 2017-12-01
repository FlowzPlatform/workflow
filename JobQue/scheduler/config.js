module.exports = {
  rethinkdb: {
    host: process.env.host || "localhost",
    port: process.env.port || 28015,
    db: process.env.db || "FlowzEngine",
    user: process.env.user,
    password: process.env.password
  },
  qOptions: {
    name: process.env.scheduler || "scheduler",
    masterInterval: 60000,
    changeFeed: true,
    concurrency: 1,
    removeFinishedJobs: false
  },
  serviceURL: process.env.serviceURL || "http://localhost:5000",
  jobURL : process.env.jobURL || "http://localhost:3000"
}
