const request = require('request');
const env = require('node-env-file');

// Load API credentials from a local environment file if available
env(__dirname + '/.env', { raise: false });

// put in request with promises
const qs = {
  Username: process.env.CUBS_USERNAME,
  Salt: process.env.CUBS_SALT,
  SecurityKey: process.env.CUBS_SECURITY_KEY,
};

constructUrl = (method) => {
  return process.env.CUBS_URL + '/' + method;
};

cleanupJson = (data) => {
  const json = data
    .replace('<?xml version="1.0" encoding="utf-8"?>', '')
    .replace('<string xmlns="http://tempuri.org/">', '')
    .replace('</string>', '')
    .replace(/\\\\"/gi, '');
  return JSON.parse(json);
};

module.exports = {

  parseCountries() {
    const url = constructUrl('GetCountries');

    return new Promise((resolve, reject) => {
      request.get({
        url,
        qs,
      }, (err, response, body) => {
        if (err) {
          reject(err);
        }

        const data = cleanupJson(body);
        resolve(data.Countries.Country);
      });
    });
  },

  parseGrants() {
    const url = constructUrl('GetLiveGrantsProjects');

    return new Promise((resolve, reject) => {
      request.get({
        url,
        qs,
      }, (err, response, body) => {
        if (err) {
          reject(err);
        }

        const data = cleanupJson(body);
        resolve(data.GrantsProjects.GrantsProject);
      });
    });
  },

};
