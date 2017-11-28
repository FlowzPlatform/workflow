module.exports = {
  plugins : {
    createPattern: "role:job,cmd:create",
    findPattern: "role:job,cmd:findjob",
    queuePattern: "role:job,cmd:queue",
    updatePattern: "role:job,cmd:update",
    subscriptionCreatePattern: "role:subscription,cmd:created"
  },
  cxnOptions: {
    host: process.env.host || "localhost",
    port: process.env.port || 28015,
    db: process.env.db || "FlowzEngine"
  },
  symmetricWorker: {
    port : process.env.symmetric_port || 9000,
    table : "symmetricWorkers",
    executeWorkerURL: "http://localhost:9000",
    executeWorkerService: "/execute-worker",
    childProcessFile: "start-child-worker.js"
  },
  waitingThreshold: 0.40,
  increaseWorker: 10,
  maxWorker: 10,
  pino: {
    timestamp: false,
    prettyPrint: {
      forceColor: true
    }
  },
  registerWorker: {
    table: "registerWorkers",
    port: process.env.register_port || 3000,
    getJobModuleApiURL: "http://localhost:3000",
    getJobModuleApiService: "/job-module/"
  },
  web_option: {
    port: process.env.job_port || 5000,
    urlPrefix: "/job"
  },
  defaultQueue : {
    name: "start",
    masterInterval: 60000,
    changeFeed: true,
    concurrency: 10,
    removeFinishedJobs: false
  },
  defaultSubscription: {
    enable: true
  },
  defaultCreateJob : {
    priority: "normal",
    timeout: 300000,
    retrymax: 3,
    retrydelay: 600000
  },
  pinoDB: {
    timestamp: "pino.stdTimeFunctions.slowTime"
  },
  system_logs_table: "system_logs",
  chokidar: {
    persistent: true,
    ignoreInitial: false,
    followSymlinks: true,
    cwd: ".",
    disableGlobbing: false,
    usePolling: true,
    interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 99,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    },
    ignorePermissionErrors: false,
    atomic: true
  }
}
