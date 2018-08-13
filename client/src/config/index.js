console.log('process.env.NODE_ENV', process.env.NODE_ENV)
var temp = {
  serverURI: 'http://localhost:3030', // 'http://172.16.230.86:3030'
  socketURI: 'http://localhost:4033',
  // serverURI: 'https://api.' + process.env.domainkey + '/eng',
  // socketURI: 'wss://ws.' + process.env.domainkey + ':4033',
  workerRegisterURL: 'http://localhost:4001',
  approvalRoleURI: 'http://api.' + process.env.domainkey + '/authldap/',
  fixedLayout: false,
  hideLogoOnMobile: false,
  // loginURL: 'http://auth.' + process.env.domainkey + '/api',
  loginURL: 'https://api.' + process.env.domainkey + '/auth/api',
  facebookSuccessCallbackUrl: 'http://localhost:8000',
  loginWithFacebookUrl: 'http://auth.' + process.env.domainkey + '/auth/facebook',
  googleSuccessCallbackUrl: 'http://localhost:8000',
  loginWithGoogleUrl: 'http://auth.' + process.env.domainkey + '/auth/Gplus',
  twitterSuccessCallbackUrl: 'http://localhost:8000',
  loginWithTwitterUrl: 'http://auth.' + process.env.domainkey + '/auth/twitter',
  linkedinSuccessCallbackUrl: 'http://localhost:8000',
  loginWithLinkedinUrl: 'http://auth.' + process.env.domainkey + '/auth/linkedin',
  githubSuccessCallbackUrl: 'http://localhost:8000',
  loginWithGithubUrl: 'http://auth.' + process.env.domainkey + '/auth/github',
  grapesUrl: 'https://www.webbuilder.' + process.env.domainkey + '/',
  grapesAPI: 'http://api.' + process.env.domainkey + '/serverapi',
  grapesDomain: process.env.domainkey
}
if (process.env.NODE_ENV === 'development') {
  temp = {
    // serverURI: 'http://localhost:3030', // 'http://172.16.230.86:3030'
    // socketURI: 'http://localhost:4033',
    serverURI: 'https://api.' + process.env.domainkey + '/eng',
    socketURI: 'wss://ws.' + process.env.domainkey + ':4033',
    workerRegisterURL: 'https://api.' + process.env.domainkey + '/jobqueue1',
    approvalRoleURI: 'https://api.' + process.env.domainkey + '/authldap/',
    loginURL: 'https://api.' + process.env.domainkey + '/auth/api',
    fixedLayout: false,
    hideLogoOnMobile: false,
    facebookSuccessCallbackUrl: 'https://engine.' + process.env.domainkey + '/',
    loginWithFacebookUrl: 'https://auth.' + process.env.domainkey + '/auth/facebook',
    googleSuccessCallbackUrl: 'https://engine.' + process.env.domainkey + '/',
    loginWithGoogleUrl: 'https://auth.' + process.env.domainkey + '/auth/Gplus',
    linkedinSuccessCallbackUrl: 'https://engine.' + process.env.domainkey + '/',
    loginWithLinkedinUrl: 'https://auth.' + process.env.domainkey + '/auth/linkedin',
    githubSuccessCallbackUrl: 'https://engine.' + process.env.domainkey + '/',
    loginWithGithubUrl: 'https://auth.' + process.env.domainkey + '/auth/github',
    grapesUrl: 'https://www.webbuilder.' + process.env.domainkey + '/',
    grapesAPI: 'https://api.' + process.env.domainkey + '/serverapi',
    grapesDomain: process.env.domainkey
  }
}
export default temp
