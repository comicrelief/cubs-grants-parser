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

  parseGrantsByCountry(countryID) {
    const url = constructUrl('GetGrantsProjectsByCountry');

    const qs2 = qs;
    qs2.CountryID = countryID;

    return new Promise((resolve, reject) => {
      request.get({
        url,
        qs: qs2,
      }, (err, response, body) => {
        if (err) {
          reject(err);
        }

        const data = cleanupJson(body);
        resolve(data.GrantsProjects.GrantsProject);
      });
    });
  },

  parseGrants() {
    const url = constructUrl('GetLiveGrantsProjects');

    return new Promise((resolve, reject) => {
      this.parseCountries()
        .then((countries) => {
          request.get({
            url,
            qs,
          }, (err, response, body) => {
            if (err) {
              reject(err);
            }

            let data = cleanupJson(body);

            data = data.GrantsProjects.GrantsProject;
            // data.forEach((grant, i) => {
            //   countries.forEach((country) => {

            //     if (country.CountryID == grant.SubRegionID) {
            //       data[i].CountryCode = country.CountryCode;
            //       data[i].CountryID = country.CountryID;
            //       data[i].CountryName = country.CountryName;
            //     }
            //   });
            // });

            resolve(data);
          });
        });
    });
  },

};
