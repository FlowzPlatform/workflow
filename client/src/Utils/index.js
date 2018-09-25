import store from '@/store'
const millisend = 1000

let isCachedResultValid = (result, timeout = 3600) => {
  return (result && Date.now() - result.timestamp < timeout * millisend)
}
let setCached = (key, result) => {
  store.state.Cache[key] = {'result': result, 'timestamp': Date.now()}
}

let CachedRes = (key, timeout) => {
  return new Promise((resolve, reject) => {
    if (store.state === undefined) {
      console.log('state undefined....')
    }
    const cachedResult = store.state.Cache[key]
    // check cache key valid
    if (isCachedResultValid(cachedResult, timeout)) {
      return resolve(cachedResult['result'])
    } else {
      return resolve(false)
    }
  })
}

let removeTimeOutKey = (timeout = 7200) => { // TODO: only delete the old
  if (Object.keys(store.state.Cache).length > 10000) {
    for (let key in Object.keys(Cache)) {
      if (!isCachedResultValid(store.state.Cache[key], timeout)) {
        delete store.state.Cache[key]
      }
    }
  }
}

setTimeout(removeTimeOutKey, 7200)

export default {
  isCachedResultValid,
  CachedRes,
  setCached
}
