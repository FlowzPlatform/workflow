let email = require('emailjs')
const errors = require('feathers-errors');

let user = process.env.SMTP_USER || ''
let password = process.env.SMTP_PASS || ''
let host = process.env.SMTP_HOST || ''
/* eslint-disable no-unused-vars */
class Service {
  constructor (options) {
    this.options = options || {};
  }

  find (params) {
    return Promise.resolve([]);
  }

  get (id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

  create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }
    let mydata = sendmail(data, params)
    return Promise.resolve(mydata);
  }

  update (id, data, params) {
    return Promise.resolve(data);
  }

  patch (id, data, params) {
    return Promise.resolve(data);
  }

  remove (id, params) {
    return Promise.resolve({ id });
  }
}

function sendmail (data, params) {
  //  console.log(params)
  let smtpUser = user
  let smtpPassword = password
  let smtpHost = host
  if (params.headers.smtp_user) {
    smtpUser = params.headers.smtp_user
  }
  if (params.headers.smtp_password) {
    smtpPassword = params.headers.smtp_password
  }
  if (params.headers.smtp_host) {
    smtpHost = params.headers.smtp_host
  }
  // console.log('', smtpHost, smtpPassword, smtpUser)
  if (smtpHost !== '' && smtpHost !== undefined && smtpPassword !== '' && smtpPassword !== undefined && smtpHost !== '' && smtpHost !== undefined) {
    let SMTPServer = email.server.connect({
      user: smtpUser,
      password: smtpPassword,
      host: smtpHost,
      ssl: false
    });
    return new Promise((resolve, reject) => {
      SMTPServer.send({
        text: data['body'],
        // html: '<html>Nikita</html>',
        from: data['from'],
        to: data['to'],
        cc: data['cc'],
        bcc: data['bcc'],
        subject: data['subject'],
        attachment: 
         [
            {
              data: data['html'] || '',
              alternative:true
            }
         ]
      }, function (err, message) {
        if (err) {
          console.log('err', err)
          reject(err)
        }
        resolve({
          "success": "email sent successfully"
        })
        // console.log(err || message); 
      })
    })
  } else {
    throw new errors.BadRequest('Error', {
      errors: { message: 'smtp configuration required' }
    });
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
