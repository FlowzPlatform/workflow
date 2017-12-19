console.log('process.env.NODE_ENV', process.env.NODE_ENV)
var temp = {
  serverURI: 'http://localhost:3030',
  socketURI: 'http://localhost:4033',
  workerRegisterURL: 'http://172.16.230.253:4001',
  approvalRoleURI: 'http://api.flowz.com/authldap/',
  loginURL: 'http://auth.flowz.com/api',
  fixedLayout: false,
  hideLogoOnMobile: false,
  facebookSuccessCallbackUrl: 'http://localhost:8000',
  loginWithFacebookUrl: 'http://auth.flowz.com/auth/facebook',
  googleSuccessCallbackUrl: 'http://localhost:8000',
  loginWithGoogleUrl: 'http://auth.flowz.com/auth/Gplus',
  twitterSuccessCallbackUrl: 'http://localhost:8000',
  loginWithTwitterUrl: 'http://auth.flowz.com/auth/twitter',
  linkedinSuccessCallbackUrl: 'http://localhost:8000',
  loginWithLinkedinUrl: 'http://auth.flowz.com/auth/linkedin',
  githubSuccessCallbackUrl: 'http://localhost:8000',
  loginWithGithubUrl: 'http://auth.flowz.com/auth/github'
}
if (process.env.NODE_ENV !== 'development') {
  temp = {
    serverURI: 'http://api.flowz.com/eng',
    socketURI: 'http://ws.flowz.com:4033',
    workerRegisterURL: 'http://api.flowz.com/jobqueue1',
    approvalRoleURI: 'http://api.flowz.com/authldap/',
    loginURL: 'http://auth.flowz.com/api',
    fixedLayout: false,
    hideLogoOnMobile: false,
    facebookSuccessCallbackUrl: 'http://engine.flowz.com/',
    loginWithFacebookUrl: 'http://auth.flowz.com/api/facebook',
    googleSuccessCallbackUrl: 'http://engine.flowz.com/',
    loginWithGoogleUrl: 'http://auth.flowz.com/api/Gplus',
    linkedinSuccessCallbackUrl: 'http://engine.flowz.com/',
    loginWithLinkedinUrl: 'http://auth.flowz.com/api/linkedin',
    githubSuccessCallbackUrl: 'http://engine.flowz.com/',
    loginWithGithubUrl: 'http://auth.flowz.com/api/github'
  }
}
export default temp
