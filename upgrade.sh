curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/seneca_jobqueue_flowz:master","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["4001:4001/tcp","4002:4002/tcp","4003:4003/tcp"],"version": "406e9785-7b0f-47b4-a247-45eecae7fbf5","environment": {"host": "'"$RDB_HOST"'","port": "'"$RDB_PORT"'","authDB":"'"$RAUTH"'","cert":"'"$CERT_SENECA_JOBQUEUE_FLOWZ"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 4001,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s239?action=upgrade'

# curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
# -X POST \
# -H 'Accept: application/json' \
# -H 'Content-Type: application/json' \
# -d '{
#      "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/flowz_frontend_flowz:master","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=engine-front"},"ports": ["80:80/tcp","443:443/tcp"],"version": "40f37569-31d5-4797-98e7-3765e0a7d31b","healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 80,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"requestLine": "GET \"http://localhost\" \"HTTP/1.0\"","responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
# 'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s316?action=upgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/flowz_backend_flowz:master","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["3033:3033/tcp","4033:4033/tcp"],"version": "5c95f163-665f-4512-8bba-5bfbfb56a94b","environment": {"rauth":"'"$RAUTH"'","cert":"'"$CERT_FLOWZ_BACKEND_FLOWZ"'","RDB_HOST":"'"$RDB_HOST"'","RDB_PORT":"'"$RDB_PORT"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 3033,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s246?action=upgrade'
