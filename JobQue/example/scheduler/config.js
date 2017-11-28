module.exports = {
  rethinkdb: {
    host: process.env.host || "localhost",
    port: process.env.port || 28015,
    db: process.env.db || "Flowz"
  },
  qOptions: {
    name: "scheduler",
    masterInterval: 60000,
    changeFeed: true,
    concurrency: 1,
    removeFinishedJobs: false
  }
}
