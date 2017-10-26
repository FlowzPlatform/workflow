<style scoped>
    .expand-row{
        margin-bottom: 16px;
    }
</style>
<template>
    <div>
        <Row class="expand-row" :gutter="16">
            <Col span="8">
              <table class="table">
                <tr>
                  <th>Role/Title</th>
                  <th>Emails</th>
                </tr>
                <tr v-for="item in row.process">
                  <td>{{item.role}} </td>
                  <td><div>{{item.email}} </div></td>
                </tr>
              </table>
            </Col>
            <Col span="16">
              <div>
                <Collapse>
                  <Panel>
                      Tracking
                      <div slot="content">
                        <div>
                          <span>To :</span> {{row.tracking.to}}
                        </div>
                        <div>
                          <span>CC :</span> {{row.tracking.cc}}
                        </div>
                        <div>
                          <span>BCC :</span> {{row.tracking.bcc}}
                        </div>
                      </div>
                  </Panel>
                </Collapse>
              </div>
              </br>
              <div>
                <Collapse>
                  <Panel>
                      Final Notification
                      <div slot="content">
                        <div>
                          <fieldset>
                            <legend>
                              <strong>Approved</strong>
                            </legend>
                            <div style="margin:10px;">
                              <div>
                                <b>Requester&nbsp;:&nbsp;</b>
                                <span>{{row.finalNotification.approved.requester ? 'Yes' : 'No'}}</span>
                              </div>
                              <div>
                                <b>All Participants&nbsp;:&nbsp; </b>
                                <span>{{row.finalNotification.approved.allParticipants ? 'Yes' : 'No'}}</span>
                              </div>
                              <div>
                                <b>Additional Emails&nbsp;:&nbsp;</b>
                                <span>{{row.finalNotification.approved.additionalEmails}}</span>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                        </br>
                        <div>
                          <fieldset>
                            <legend>
                              <strong>Rejected</strong>
                            </legend>
                            <div style="margin:10px;">
                              <div>
                                <b>Requester&nbsp;:&nbsp;</b>
                                <span>{{row.finalNotification.rejected.requester ? 'Yes' : 'No'}}</span>
                              </div>
                              <div>
                                <b>All Approved&nbsp;:&nbsp; </b>
                                <span>{{row.finalNotification.rejected.allApproved ? 'Yes' : 'No'}}</span>
                              </div>
                              <div>
                                <b>All Participants&nbsp;:&nbsp; </b>
                                <span>{{row.finalNotification.rejected.allParticipants ? 'Yes' : 'No'}}</span>
                              </div>
                              <div>
                                <b>Additional Emails&nbsp;:&nbsp;</b>
                                <span>{{row.finalNotification.rejected.additionalEmails}}</span>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                        </br>
                        <div>
                          <fieldset>
                            <legend>
                              <strong>Progress</strong>
                            </legend>
                            <div style="margin:10px;">
                              <div>
                                <b>Requester&nbsp;:&nbsp;</b>
                                <span>{{row.finalNotification.progress.requester ? 'Yes' : 'No'}}</span>
                              </div>
                              <div>
                                <b>All Participants&nbsp;:&nbsp; </b>
                                <span>{{row.finalNotification.progress.allParticipants ? 'Yes' : 'No'}}</span>
                              </div>
                              <div>
                                <b>Additional Emails&nbsp;:&nbsp;</b>
                                <span>{{row.finalNotification.progress.additionalEmails}}</span>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      </div>
                  </Panel>
                </Collapse>
              </div>
            </Col>
        </Row>
    </div>
</template>

<script>
    export default {
      props: {
        row: Object
      }
    }
</script>
<style scoped>
fieldset { border:  0}
fieldset legend {
    font-size: 16px;
    padding: 30px 0 10px;
    border-bottom: 2px solid #eaedf1;
  }
</style>
