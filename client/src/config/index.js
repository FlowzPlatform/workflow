console.log('process.env.NODE_ENV', process.env.NODE_ENV)
var temp = {
  serverURI: 'http://172.16.160.117:3030',
  workerRegisterURL: 'http://172.16.230.253:4001',
  approvalRoleURI: 'http://api.flowz.com/authldap//',
  loginURL: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api',
  fixedLayout: false,
  hideLogoOnMobile: false
}

if (process.env.NODE_ENV !== 'development') {
  temp = {
    serverURI: 'http://api.flowz.com/eng',
    workerRegisterURL: 'http://api.flowz.com/jobqueue1',
    approvalRoleURI: 'http://api.flowz.com/authldap/',
    loginURL: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api',
    fixedLayout: false,
    hideLogoOnMobile: false
  }
}
export default temp
