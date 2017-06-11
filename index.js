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

        let data = cleanupJson(body);
        data = data.GrantsProjects.GrantsProject;

        // Wrap into array as some countries only return a single grant
        if (!(data instanceof Array)) {
          data = [data];
        }

        resolve(data);
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

        let data = cleanupJson(body);
        data = data.GrantsProjects.GrantsProject;
        resolve(data);
      });
    });
  },

  parseGrantsWithCountries() {
    return new Promise((resolve, reject) => {
      const countriesP = this.parseCountries();
      const grantsP = countriesP.then((countries) => {
        const countryP = countries.map((country) => {
          return this.parseGrantsByCountry(country.CountryID);
        });
        return Promise.all(countryP);
      });

      grantsP.then((grants) => {
        countriesP.then((countries) => {
          const grantsAnnotated = grants;
          grants.forEach((grantsPerCountry, i) => {
            grantsPerCountry.forEach((grant, j) => {
              countries.forEach((country) => {
                if (country.CountryName.toUpperCase() === grant.Country) {
                  grantsAnnotated[i][j].CountryName = country.CountryName;
                  grantsAnnotated[i][j].CountryID = country.CountryID;
                  grantsAnnotated[i][j].CountryCode = country.CountryCode;
                }
              });
            });
          });

          const grantsFlattened = [].concat(...grantsAnnotated);
          return resolve(grantsFlattened);
        });
      });
    });
  },

};
