console.log('process.env.NODE_ENV', process.env.NODE_ENV)
console.log('process.env.domain', process.env.domainkey)
console.log('process.env.domain', process.env.domainKey)
console.log('process.env', process.env)
var temp = {
  // serverURI: 'http://localhost:3030', // 'http://172.16.230.86:3030'
  // socketURI: 'http://localhost:4033',
  serverURI: 'https://api.' + process.env.domainKey + '/eng',
  socketURI: 'wss://ws.' + process.env.domainKey + ':4033',
  workerRegisterURL: 'http://localhost:4001',
  approvalRoleURI: 'http://api.' + process.env.domainKey + '/authldap/',
  fixedLayout: false,
  hideLogoOnMobile: false,
  // loginURL: 'http://auth.' + process.env.domainKey + '/api',
  loginURL: 'https://api.' + process.env.domainKey + '/auth/api',
  // facebookSuccessCallbackUrl: 'http://localhost:8000',
  facebookSuccessCallbackUrl: 'https://engine.' + process.env.domainKey + '/',
  loginWithFacebookUrl: 'http://auth.' + process.env.domainKey + '/auth/facebook',
  // googleSuccessCallbackUrl: 'http://localhost:8000',
  googleSuccessCallbackUrl: 'https://engine.' + process.env.domainKey + '/',
  loginWithGoogleUrl: 'http://auth.' + process.env.domainKey + '/auth/Gplus',
  twitterSuccessCallbackUrl: 'http://localhost:8000',
  loginWithTwitterUrl: 'http://auth.' + process.env.domainKey + '/auth/twitter',
  // linkedinSuccessCallbackUrl: 'http://localhost:8000',
  linkedinSuccessCallbackUrl: 'https://engine.' + process.env.domainKey + '/',
  loginWithLinkedinUrl: 'http://auth.' + process.env.domainKey + '/auth/linkedin',
  // githubSuccessCallbackUrl: 'http://localhost:8000',
  githubSuccessCallbackUrl: 'https://engine.' + process.env.domainKey + '/',
  loginWithGithubUrl: 'http://auth.' + process.env.domainKey + '/auth/github',
  grapesUrl: 'https://www.webbuilder.' + process.env.domainKey + '/',
  grapesAPI: 'http://api.' + process.env.domainKey + '/serverapi',
  grapesDomain: process.env.domainKey,
  subscriptionUrl: 'https://api.' + process.env.domainKey + '/subscription/',
  getAllPermissionsUrl: 'https://api.' + process.env.domainKey + '/authldap/getallpermission/',
  setPermissionUrl: 'https://api.' + process.env.domainKey + '/authldap/setpermission'
}
if (process.env.NODE_ENV !== 'development') {
  temp = {
    // serverURI: 'http://localhost:3030', // 'http://172.16.230.86:3030'
    // socketURI: 'http://localhost:4033',
    serverURI: 'https://api.' + process.env.domainKey + '/eng',
    socketURI: 'wss://ws.' + process.env.domainKey + ':4033',
    workerRegisterURL: 'https://api.' + process.env.domainKey + '/jobqueue1',
    approvalRoleURI: 'https://api.' + process.env.domainKey + '/authldap/',
    loginURL: 'https://api.' + process.env.domainKey + '/auth/api',
    fixedLayout: false,
    hideLogoOnMobile: false,
    facebookSuccessCallbackUrl: 'https://engine.' + process.env.domainKey + '/',
    loginWithFacebookUrl: 'https://auth.' + process.env.domainKey + '/auth/facebook',
    googleSuccessCallbackUrl: 'https://engine.' + process.env.domainKey + '/',
    loginWithGoogleUrl: 'https://auth.' + process.env.domainKey + '/auth/Gplus',
    linkedinSuccessCallbackUrl: 'https://engine.' + process.env.domainKey + '/',
    loginWithLinkedinUrl: 'https://auth.' + process.env.domainKey + '/auth/linkedin',
    githubSuccessCallbackUrl: 'https://engine.' + process.env.domainKey + '/',
    loginWithGithubUrl: 'https://auth.' + process.env.domainKey + '/auth/github',
    grapesUrl: 'https://www.webbuilder.' + process.env.domainKey + '/',
    grapesAPI: 'https://api.' + process.env.domainKey + '/serverapi',
    grapesDomain: process.env.domainKey,
    subscriptionUrl: 'https://api.' + process.env.domainKey + '/subscription/',
    getAllPermissionsUrl: 'https://api.' + process.env.domainKey + '/authldap/getallpermission/',
    setPermissionUrl: 'https://api.' + process.env.domainKey + '/authldap/setpermission'
  }
}
export default temp
