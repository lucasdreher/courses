/**
 * Helpers for various tasks
 * 
 */

const // Dependencies
	crypto = require('crypto'),
	config = require('./config'),
	https = require('https'),
	querystring = require('querystring');
const { request } = require('http');

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = function(str) {
	if (typeof str == 'string' && str.length > 0) {
		const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	} else {
		return false;
	}
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str) {
	try {
		const obj = JSON.parse(str);
		return obj;
	} catch (e) {
		return {};
	}
};

// Crete a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength) {
	strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false;
	if (strLength) {
		// Define all the possible character that could go into a string
		const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

		// Start the final string
		let str = '';
		for (let i = 0; i < strLength; i++) {
			// Get random character from the possibleCharacters string
			const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
			// Append this character to the final string
			str += randomCharacter;
		}

		//Return the final string

		return str;
	} else {
		return false;
	}
};

// Send an SMS message via Twilio
helpers.sendTwilioSms = function(phone, msg, callback) {
	// Validate parameters
	phone = typeof phone == 'string' && phone.trim().length == 10 ? phone.trim() : false;
	msg = typeof msg == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
	if (phone && msg) {
		// Configure the request payload
		const payload = {
			From: config.twilio.fromPhone,
			To: `${config.twilio.countryCode}${phone}`,
			Body: msg
		};

		// Stringify the payload
		const stringPayload = querystring.stringify(payload);

		// Configure the request details
		const requestDetails = {
			protocol: 'https:',
			hostname: 'api.twilio.com',
			method: 'POST',
			path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
			auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(stringPayload)
			}
		};

		// Instantiate the request object
		const req = https.request(requestDetails, function(res) {
			// Grab the status of the sent request
			const status = res.statusCode;
			// Callback successfully if the request went through
			if (status == 200 || status == 201) {
				callback(false);
			} else {
				callback(`Status code returned was ${status} ${payload.To} ${phone}`);
			}
		});

		// Bind to the error event so it doesn't get thrown
		req.on('error', (e) => callback(e));

		// Add the payload
		req.write(stringPayload);

		// End the request
		req.end();
	} else {
		callback('Given parameters were missing or invalid');
	}
};

// ==================

// Export the modules
module.exports = helpers;
