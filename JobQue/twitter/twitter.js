var Twit = require('twit')
var axios = require('axios')
var _ = require('lodash')
var config = require('./config')
let flowid = config.flowid
var T = new Twit({
  consumer_key: config.tweetCredential.consumer_key,
  consumer_secret: config.tweetCredential.consumer_secret,
  access_token: config.tweetCredential.access_token,
  access_token_secret: config.tweetCredential.access_token_secret
})
var stream = T.stream('statuses/filter', { track: '@KrunalMMahera' })
stream.on('tweet', function(tweet) {
  console.log('tweet', tweet)
  axios.get(config.serverURI + '/flowz/' + flowid)
    .then(function(response) {
      let jsonobject = {}
      jsonobject = response.data.json
      jsonobject.fid = flowid
      jsonobject.createdOn = Date()
      axios.post(config.serverURI + '/flowz-instance/', jsonobject)
        .then(function(response) {
          addInputForStartProcess(response.data, tweet)
        })
        .catch(function(error) {
          console.log('error', error)
        })
    }).catch(function(error) {
      console.log(error);
    });
})

function addInputForStartProcess(flowinstance, tweet) {
  let instanceid = flowinstance.id
  let startEvent = flowinstance.start_states[0]
  let startEventEntity = _.find(flowinstance.processList, function(o) { return o.id == startEvent; });
  let object = {
    Attachement: '',
    Message: tweet,
    Schemaid: startEventEntity.inputProperty[0].entityschema.id,
    Type: 'tweet_template'
  }
  let inputdata = []
  inputdata.push(object)
  let processdata = {
    instanceid: instanceid,
    processid: startEvent,
    data: inputdata
  }
  axios.post(config.serverURI + '/instance/', processdata).then(function(response) {
      console.log('response', response.data)
    })
    .catch(function(error) {
      console.log('error', error)
    })
}