if [ "$TRAVIS_BRANCH" = "master" ]
then
    {
    echo "call $TRAVIS_BRANCH branch"
    ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_MASTER":"$RANCHER_SECRETKEY_MASTER"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_MASTER/v2-beta/projects?name=Production" | jq '.data[].id' | tr -d '"'`
    echo $ENV_ID
    USERNAME="$DOCKER_USERNAME_FLOWZ";
    TAG="latest";
    FRONT_HOST="$FRONT_HOST_MASTER";
    RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_MASTER";
    RANCHER_SECRETKEY="$RANCHER_SECRETKEY_MASTER";
    RANCHER_URL="$RANCHER_URL_MASTER";
    DOMAINKEY="$DOMAINKEY_MASTER";
    SMTP_USER="$SMTP_USER_MASTER";
    SMTP_PASS="$SMTP_PASS_MASTER";
    SMTP_HOST="$SMTP_HOST_MASTER";
    SERVICE_NAME_SENECA="$SERVICE_NAME_SENECA_MASTER";
    SERVICE_NAME_BACKEND="$SERVICE_NAME_BACKEND_MASTER";
    SERVICE_NAME_FRONTEND="$SERVICE_NAME_FRONTEND_MASTER";
    BACKEND_HOST="$BACKEND_HOST_MASTER";
    RDB_HOST="$RDB_HOST_MASTER";
    RDB_PORT="$RDB_PORT_MASTER";
    STACK_SERVICE_NAME_FOR_FRONT="$STACK_SERVICE_NAME_FOR_FRONT_MASTER";
  }
elif [ "$TRAVIS_BRANCH" = "develop" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_DEVELOP":"$RANCHER_SECRETKEY_DEVELOP"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_DEVELOP/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      TAG="dev";
      FRONT_HOST="$FRONT_HOST_DEVELOP";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_DEVELOP";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_DEVELOP";
      RANCHER_URL="$RANCHER_URL_DEVELOP";
      DOMAINKEY="$DOMAINKEY_DEVELOP";
      SMTP_USER="$SMTP_USER_DEVELOP";
      SMTP_PASS="$SMTP_PASS_DEVELOP";
      SMTP_HOST="$SMTP_HOST_DEVELOP";
      SERVICE_NAME_SENECA="$SERVICE_NAME_SENECA_DEVELOP";
      SERVICE_NAME_BACKEND="$SERVICE_NAME_BACKEND_DEVELOP";
      SERVICE_NAME_FRONTEND="$SERVICE_NAME_FRONTEND_DEVELOP";
      BACKEND_HOST="$BACKEND_HOST_DEVELOP";
      RDB_HOST="$RDB_HOST_DEVELOP";
      RDB_PORT="$RDB_PORT_DEVELOP";
      STACK_SERVICE_NAME_FOR_FRONT="$STACK_SERVICE_NAME_FOR_FRONT_DEVELOP";
  }
elif [ "$TRAVIS_BRANCH" = "staging" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"

      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_STAGING":"$RANCHER_SECRETKEY_STAGING"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_STAGING/v2-beta/projects?name=Staging" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      TAG="staging";
      FRONT_HOST="$FRONT_HOST_STAGING";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_STAGING";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_STAGING";
      RANCHER_URL="$RANCHER_URL_STAGING";
      DOMAINKEY="$DOMAINKEY_STAGING";
      SMTP_USER="$SMTP_USER_STAGING";
      SMTP_PASS="$SMTP_PASS_STAGING";
      SMTP_HOST="$SMTP_HOST_STAGING";
      SERVICE_NAME_SENECA="$SERVICE_NAME_SENECA_STAGING";
      SERVICE_NAME_BACKEND="$SERVICE_NAME_BACKEND_STAGING";
      SERVICE_NAME_FRONTEND="$SERVICE_NAME_FRONTEND_STAGING";
      BACKEND_HOST="$BACKEND_HOST_STAGING";
      RDB_HOST="$RDB_HOST_STAGING";
      RDB_PORT="$RDB_PORT_STAGING";
      STACK_SERVICE_NAME_FOR_FRONT="$STACK_SERVICE_NAME_FOR_FRONT_STAGING";
  }  
else
  {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_QA":"$RANCHER_SECRETKEY_QA"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_QA/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      TAG="qa";
      FRONT_HOST="$FRONT_HOST_QA";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_QA";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_QA";
      RANCHER_URL="$RANCHER_URL_QA";
      DOMAINKEY="$DOMAINKEY_QA";
      SMTP_USER="$SMTP_USER_QA";
      SMTP_PASS="$SMTP_PASS_QA";
      SMTP_HOST="$SMTP_HOST_QA";
      SERVICE_NAME_SENECA="$SERVICE_NAME_SENECA_QA";
      SERVICE_NAME_BACKEND="$SERVICE_NAME_BACKEND_QA";
      SERVICE_NAME_FRONTEND="$SERVICE_NAME_FRONTEND_QA";
      BACKEND_HOST="$BACKEND_HOST_QA";
      RDB_HOST="$RDB_HOST_QA";
      RDB_PORT="$RDB_PORT_QA";
      STACK_SERVICE_NAME_FOR_FRONT="$STACK_SERVICE_NAME_FOR_FRONT_QA";
  }
fi

SERVICE_ID_JOBQUEUE=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects/$ENV_ID/services?name=$SERVICE_NAME_SENECA" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_JOBQUEUE

SERVICE_ID_FRONTEND=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects/$ENV_ID/services?name=$SERVICE_NAME_FRONTEND" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_FRONTEND

SERVICE_ID_BACKEND=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects/$ENV_ID/services?name=$SERVICE_NAME_BACKEND" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_BACKEND

curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:'$USERNAME'/seneca_jobqueue_flowz:'$TAG'","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "'"$BACKEND_HOST"'"},"ports": ["4001:4001/tcp","4002:4002/tcp","4003:4003/tcp"],"environment": {"host": "'"$RDB_HOST"'","port": "'"$RDB_PORT"'","authDB":"'"$RAUTH"'","cert":"'"$CERT_SENECA_JOBQUEUE_FLOWZ"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 4001,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_JOBQUEUE?action=upgrade

curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:'$USERNAME'/flowz_frontend_flowz:'$TAG'","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "'"$FRONT_HOST"'","io.rancher.scheduler.affinity:container_label_soft_ne": "'"$STACK_SERVICE_NAME_FOR_FRONT"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 80,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"requestLine": "GET \"http://localhost\" \"HTTP/1.0\"","responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_FRONTEND?action=upgrade

curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:'$USERNAME'/flowz_backend_flowz:'$TAG'","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "'"$BACKEND_HOST"'"},"ports": ["3033:3033/tcp","4033:4033/tcp"],"environment": {"rauth":"'"$RAUTH"'","cert":"'"$CERT_FLOWZ_BACKEND_FLOWZ"'","RDB_HOST":"'"$RDB_HOST"'","RDB_PORT":"'"$RDB_PORT"'","domainKey":"'"$DOMAINKEY"'","SMTP_USER":"'"$SMTP_USER"'","SMTP_PASS":"'"$SMTP_PASS"'","SMTP_HOST":"'"$SMTP_HOST"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 3033,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_BACKEND?action=upgrade
