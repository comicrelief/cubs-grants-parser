const request = require('request');

module.exports = {

  parseGrants(callback) {
    const method = 'GetLiveGrantsProjects';
    // const method = 'GetCountries';
    const url = process.env.CUBS_URL + '/' + method;

    // put in request with promises
    const qs = {
      Username: process.env.CUBS_USERNAME,
      Salt: process.env.CUBS_SALT,
      SecurityKey: process.env.CUBS_SECURITY_KEY,
    };

    request.get({
      url,
      qs,
    }, (err, response, body) => {
      // Do some data cleanup
      let data = body
        .replace('<?xml version="1.0" encoding="utf-8"?>', '')
        .replace('<string xmlns="http://tempuri.org/">', '')
        .replace('</string>', '')
        .replace(/\\\\"/gi, '');

      data = JSON.parse(data);
      return callback(data.GrantsProjects.GrantsProject);
    });
  },

};
