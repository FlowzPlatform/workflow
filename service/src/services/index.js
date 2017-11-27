const schema = require('./schema/schema.service.js');
const instance = require('./instance/instance.service.js');
const settings = require('./settings/settings.service.js');
const approval = require('./approval/approval.service.js');
const emailtemplate = require('./emailtemplate/emailtemplate.service.js');
const schemamapping = require('./schemamapping/schemamapping.service.js');
const flowz = require('./flowz/flowz.service.js');
const flowzinstance = require('./flowz-instance/flowz-instance.service.js');
const instancetest = require('./instance-test/instance-test.service.js');
const scheduler = require('./scheduler/scheduler.service.js');
const logs = require('./logs/logs.service.js');
const addInputToJobQue = require('./addInputToJobQue/addInputToJobQue.service.js');

const bpmnplugins = require('./bpmnplugins/bpmnplugins.service.js');

module.exports = function() {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(schema);
  app.configure(instance);
  app.configure(settings);
  app.configure(approval);
  app.configure(emailtemplate);
  app.configure(schemamapping);
  app.configure(flowz);
  app.configure(flowzinstance);
  app.configure(instancetest);
  app.configure(logs);
  app.configure(addInputToJobQue);
  //app.configure(scheduler);
  app.configure(bpmnplugins);
};