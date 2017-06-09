'use strict';

var request = require('request');

module.exports = {

	parseGrants: function(callback) {
		var method = 'GetLiveGrantsProjects';
		// var method = 'GetCountries';
		var url = process.env.CUBS_URL + '/' + method;

		// put in request with promises
		var qs = {
			Username: process.env.CUBS_USERNAME,
			Salt: process.env.CUBS_SALT,
			SecurityKey: process.env.CUBS_SECURITY_KEY
		};

		request.get({
			url: url,
			qs: qs
		}, function(err, response, body) {

			// Do some data cleanup
			var body = body
        .replace('<?xml version="1.0" encoding="utf-8"?>', '')
        .replace('<string xmlns="http://tempuri.org/">', '')
        .replace('</string>', '')
        .replace(/\\\\"/gi, '');

      var json = JSON.parse(body);
      return callback(json.GrantsProjects.GrantsProject);
    });
	}

};
