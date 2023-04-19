// eslint-disable
var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

var params = {
  Destination: {
    ToAddresses: ['snsTo@devkick.pl'],
  },
  Template: 'WelcomeTemplate',
  TemplateData: '{ "name":"Łukasz" }',
  Source: 'sns@devkick.pl',
  ReplyToAddresses: ['sns@devkick.pl'],
};

var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendTemplatedEmail(params).promise();

sendPromise
  .then(function (data) {
    console.log(data.MessageId);
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });
