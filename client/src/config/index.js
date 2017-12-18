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
    workerRegisterURL: 'http://api.flowz.com/jobqueue1',
    approvalRoleURI: 'http://api.flowz.com/authldap/',
    loginURL: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api',
    fixedLayout: false,
    hideLogoOnMobile: false,
    facebookSuccessCallbackUrl: 'http://dbetl.flowz.com/',
    loginWithFacebookUrl: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/facebook',
    googleSuccessCallbackUrl: 'http://dbetl.flowz.com/',
    loginWithGoogleUrl: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/Gplus',
    linkedinSuccessCallbackUrl: 'http://dbetl.flowz.com/',
    loginWithLinkedinUrl: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/linkedin',
    githubSuccessCallbackUrl: 'http://dbetl.flowz.com/',
    loginWithGithubUrl: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/github'
  }
}
export default temp
