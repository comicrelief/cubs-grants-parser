const request = require('request');

module.exports = {

  parseGrants() {
    const method = 'GetLiveGrantsProjects';
    // const method = 'GetCountries';
    const url = process.env.CUBS_URL + '/' + method;

    // put in request with promises
    const qs = {
      Username: process.env.CUBS_USERNAME,
      Salt: process.env.CUBS_SALT,
      SecurityKey: process.env.CUBS_SECURITY_KEY,
    };

    return new Promise(function(resolve, reject) {
      request.get({
        url,
        qs,
      }, (err, response, body) => {

        if (err) {
          reject(err);
        }

        // Do some data cleanup
        let data = body
          .replace('<?xml version="1.0" encoding="utf-8"?>', '')
          .replace('<string xmlns="http://tempuri.org/">', '')
          .replace('</string>', '')
          .replace(/\\\\"/gi, '');

        data = JSON.parse(data);
        resolve(data.GrantsProjects.GrantsProject);
      });
    });

  },

};
