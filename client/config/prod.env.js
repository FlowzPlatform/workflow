module.exports = {
  NODE_ENV: '"production"',
  accesskey: JSON.stringify(process.env.accesskey),
  secretkey: JSON.stringify(process.env.secretkey),
  domainkey: JSON.stringify(process.env.domainkey)
}
