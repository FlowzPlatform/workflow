console.log('process.env.NODE_ENV', process.env.NODE_ENV)
var temp = {
  serverURI: 'http://localhost:3030',
  workerRegisterURL: 'http://172.16.230.253:4001',
  approvalRoleURI: 'http://api.flowz.com/authldap/',
  loginURL: 'http://auth.flowz.com/api',
  fixedLayout: false,
  hideLogoOnMobile: false,
  facebookSuccessCallbackUrl: 'http://localhost:8000',
  loginWithFacebookUrl: 'http://auth.flowz.com/auth/facebook',
  googleSuccessCallbackUrl: 'http://localhost:8000',
  loginWithGoogleUrl: 'http://auth.flowz.com/auth/Gplus',
  grapesUrl: 'http://172.16.230.133:3032'
}
if (process.env.NODE_ENV !== 'development') {
  temp = {
    serverURI: 'http://api.flowz.com/eng',
    workerRegisterURL: 'http://api.flowz.com/jobqueue1',
    approvalRoleURI: 'http://api.flowz.com/authldap/',
    loginURL: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api',
    fixedLayout: false,
    hideLogoOnMobile: false,
    grapesUrl: 'http://webbuilder.flowz.com'
  }
}
export default temp
