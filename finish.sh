curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s239?action=finishupgrade'

# curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
# -X POST \
# 'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s316?action=finishupgrade'

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s246?action=finishupgrade'
