const schema = require('./schema/schema.service.js');
const emailtemplate = require('./emailtemplate/emailtemplate.service.js');
const flowz = require('./flowz/flowz.service.js');
const bpmnplugins = require('./bpmnplugins/bpmnplugins.service.js');
const finstance = require('./finstance/finstance.service.js');
const flowzdata = require('./flowzdata/flowzdata.service.js');
const sendmail = require('./sendmail/sendmail.service.js');
const emailReceive = require('./email-receive/email-receive.service.js');
const dataquery = require('./dataquery/dataquery.service.js');
const dflowzdata = require('./dflowzdata/dflowzdata.service.js');
module.exports = function() {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(schema);
  app.configure(emailtemplate);
  app.configure(flowz);
  app.configure(bpmnplugins);
  app.configure(finstance);
  app.configure(flowzdata);
  app.configure(sendmail);
  app.configure(emailReceive);
  app.configure(dataquery);
  app.configure(dflowzdata);
};
