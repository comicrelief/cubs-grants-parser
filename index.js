const request = require('request');
const env = require('node-env-file');
const md5 = require('md5');

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

dedupeGrants = (array) => {
  const tmp = {};
  return array.reduce((p, c) => {
    const k = hashGrant(c);
    if (tmp[k]) return p;
    tmp[k] = true;
    return p.concat(c);
  }, []);
};

hashGrant = (grant) => {
  const grantString = grant.AmountAwarded
    + grant.CopywrittenSummary
    + grant.CountryID
    + grant.IssueID
    + grant.Name
    + grant.PartPostcode
    + grant.Region
    + grant.StartDate
    + grant.SubRegionID
    + grant.AmountAwarded;
  return md5(grantString);
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

        // Dedupe grants, this leads to loss of grants that are similar
        // but have different grants ids. To be sorted out with the data
        // provider in CUBS.
        data = dedupeGrants(data);

        resolve(data);
      });
    });
  },

};
