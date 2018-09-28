module.exports = {
  NODE_ENV: '"production"',
  accesskey: JSON.stringify(process.env.accesskey),
  secretkey: JSON.stringify(process.env.secretkey),
  domainKey: JSON.stringify(process.env.domainKey)
}
