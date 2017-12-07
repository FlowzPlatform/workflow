curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/seneca_jobqueue_flowz:dev","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["4001:4001/tcp","4002:4002/tcp","4003:4003/tcp"],"version": "406e9785-7b0f-47b4-a247-45eecae7fbf5","environment": {"host": "aws-us-east-1-portal.30.dblayer.com","port": 16868,"authDB":"51b2885598be1c2c1243a5c9c3548ad2","cert":true}}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s239?action=upgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/flowz_frontend_flowz:dev","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=engine-front"},"ports": ["80:80/tcp"],"version": "40f37569-31d5-4797-98e7-3765e0a7d31b"}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s316?action=upgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/flowz_backend_flowz:dev","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["3033:3033/tcp"],"version": "5c95f163-665f-4512-8bba-5bfbfb56a94b","environment": {"rauth":"51b2885598be1c2c1243a5c9c3548ad2","cert":"/ca.crt","RDB_HOST":"aws-us-east-1-portal.30.dblayer.com","RDB_PORT":"16868"}}},"toServiceStrategy":null}' \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s246?action=upgrade'
